/**
 * Server-sent event plumbing shared by the AI provider adapters.
 *
 * Every provider streams SSE, but each one buries its text in a different
 * shape. The adapters decode their own frames into `TStreamDelta`s and this
 * module re-encodes them as one normalized stream, so the browser has a single
 * format to parse rather than three.
 */

/** A decoded frame from a provider's SSE stream. */
export interface TSSEFrame {
  event: string | null;
  data: string;
}

/** One normalized chunk on the way back to the client. */
export interface TStreamDelta {
  /** Text to append to the response. */
  text?: string;
  /** Token counts, usually only present on the provider's final frame. */
  usage?: { prompt_tokens?: number; completion_tokens?: number };
}

/**
 * Decodes an SSE byte stream into frames.
 *
 * Chunk boundaries fall wherever the network puts them, so a frame can arrive
 * split down the middle. The buffer below is what keeps a half-delivered
 * `data:` line from being parsed as JSON and thrown away.
 */
export async function* readSSE(body: ReadableStream<Uint8Array>): AsyncGenerator<TSSEFrame> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    // eslint-disable-next-line no-await-in-loop
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      // Frames are separated by a blank line; \r\n is legal too.
      let boundary = buffer.search(/\r?\n\r?\n/);
      while (boundary !== -1) {
        const rawFrame = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + buffer.slice(boundary).match(/^\r?\n\r?\n/)![0].length);
        const frame = parseFrame(rawFrame);
        if (frame) yield frame;
        boundary = buffer.search(/\r?\n\r?\n/);
      }
    }

    buffer += decoder.decode();
    const trailing = parseFrame(buffer);
    if (trailing) yield trailing;
  } finally {
    reader.releaseLock();
  }
}

function parseFrame(rawFrame: string): TSSEFrame | null {
  const lines = rawFrame.split(/\r?\n/);
  let event: string | null = null;
  const dataLines: string[] = [];

  for (const line of lines) {
    if (line.startsWith(":")) continue; // comment / keep-alive
    if (line.startsWith("event:")) {
      event = line.slice(6).trim();
    } else if (line.startsWith("data:")) {
      dataLines.push(line.slice(5).replace(/^ /, ""));
    }
  }

  if (dataLines.length === 0) return null;
  return { event, data: dataLines.join("\n") };
}

/**
 * Wraps a delta generator as a normalized SSE stream of `{"text": "..."}`
 * frames, terminated by `data: [DONE]`.
 *
 * `onComplete` runs once the provider stream ends, with whatever token counts
 * were seen. It is awaited inside the stream so the audit write cannot be
 * cancelled by the function shutting down early, and its failure is swallowed:
 * a broken audit log should not truncate a response the user already paid for.
 */
export function toNormalizedStream(
  deltas: AsyncGenerator<TStreamDelta>,
  onComplete?: (usage: { prompt_tokens: number; completion_tokens: number }) => Promise<void>
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const usage = { prompt_tokens: 0, completion_tokens: 0 };

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const delta of deltas) {
          if (delta.usage?.prompt_tokens) usage.prompt_tokens = delta.usage.prompt_tokens;
          if (delta.usage?.completion_tokens) usage.completion_tokens = delta.usage.completion_tokens;
          if (delta.text) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: delta.text })}\n\n`));
          }
        }
      } catch (err) {
        // The response has already been sent with a 200, so an error here can
        // only be reported in-band. The client surfaces it as a failed task.
        const message = err instanceof Error ? err.message : "AI provider stream failed";
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: message })}\n\n`));
      } finally {
        if (onComplete) {
          try {
            await onComplete(usage);
          } catch {
            // Audit logging is best-effort.
          }
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      }
    },
  });
}
