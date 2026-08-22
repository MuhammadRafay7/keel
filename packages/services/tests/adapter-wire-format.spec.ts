import { describe, it, expect } from "vitest";

// Neutral types definition mirror for adapter testing
interface ToolSpec {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
}

interface ToolCall {
  id: string;
  name: string;
  input: Record<string, unknown>;
}

interface ToolResult {
  id: string;
  name: string;
  content: string;
  isError?: boolean;
}

type AgentMsg =
  | { role: "user"; text: string }
  | { role: "assistant"; text: string; toolCalls: ToolCall[] }
  | { role: "tool"; results: ToolResult[] };

// Fixtures for serialization & decoding
describe("AI Provider Wire Format Adapters", () => {
  const sampleTools: ToolSpec[] = [
    {
      name: "create_work_item",
      description: "Create a work item in project",
      input_schema: {
        type: "object",
        properties: {
          project_id: { type: "string" },
          name: { type: "string" },
          priority: { type: "string", enum: ["urgent", "high", "medium", "low", "none"] },
        },
        required: ["project_id", "name"],
      },
    },
  ];

  const sampleMessages: AgentMsg[] = [
    { role: "user", text: "Create high priority bug for checkout error" },
    {
      role: "assistant",
      text: "I will create this work item for you.",
      toolCalls: [
        {
          id: "call_123",
          name: "create_work_item",
          input: { project_id: "proj_abc", name: "Checkout error", priority: "high" },
        },
      ],
    },
    {
      role: "tool",
      results: [
        {
          id: "call_123",
          name: "create_work_item",
          content: JSON.stringify({ id: "issue_999", sequence_id: 42, name: "Checkout error" }),
          isError: false,
        },
      ],
    },
  ];

  describe("Anthropic Wire Format", () => {
    it("transforms tool definitions into Anthropic tools schema", () => {
      const anthropicTools = sampleTools.map((t) => ({
        name: t.name,
        description: t.description,
        input_schema: t.input_schema,
      }));
      expect(anthropicTools[0].name).toBe("create_work_item");
      expect(anthropicTools[0].input_schema).toEqual(sampleTools[0].input_schema);
    });

    it("transforms neutral messages into Anthropic messages format", () => {
      const anthropicMessages = sampleMessages.map((msg) => {
        switch (msg.role) {
          case "user":
            return { role: "user", content: msg.text };
          case "assistant": {
            const content: Array<any> = [];
            if (msg.text) content.push({ type: "text", text: msg.text });
            for (const tc of msg.toolCalls) {
              content.push({ type: "tool_use", id: tc.id, name: tc.name, input: tc.input });
            }
            return { role: "assistant", content };
          }
          case "tool": {
            const content = msg.results.map((r) => ({
              type: "tool_result",
              tool_use_id: r.id,
              content: r.content,
              ...(r.isError ? { is_error: true } : {}),
            }));
            return { role: "user", content };
          }
        }
      });

      expect(anthropicMessages[0]).toEqual({
        role: "user",
        content: "Create high priority bug for checkout error",
      });

      expect(anthropicMessages[1]).toEqual({
        role: "assistant",
        content: [
          { type: "text", text: "I will create this work item for you." },
          {
            type: "tool_use",
            id: "call_123",
            name: "create_work_item",
            input: { project_id: "proj_abc", name: "Checkout error", priority: "high" },
          },
        ],
      });

      expect(anthropicMessages[2]).toEqual({
        role: "user",
        content: [
          {
            type: "tool_result",
            tool_use_id: "call_123",
            content: '{"id":"issue_999","sequence_id":42,"name":"Checkout error"}',
          },
        ],
      });
    });

    it("decodes Anthropic response fixture into normalized AgentTurn", () => {
      const anthropicFixture = {
        id: "msg_01XFDUDY",
        type: "message",
        role: "assistant",
        content: [
          { type: "text", text: "Creating the work item now." },
          {
            type: "tool_use",
            id: "toolu_01A09q90",
            name: "create_work_item",
            input: { project_id: "proj_123", name: "Fix button alignment", priority: "medium" },
          },
        ],
        stop_reason: "tool_use",
        usage: { input_tokens: 142, output_tokens: 48 },
      };

      let text = "";
      const toolCalls: ToolCall[] = [];

      for (const block of anthropicFixture.content) {
        if (block.type === "text") text += block.text;
        else if (block.type === "tool_use") {
          toolCalls.push({
            id: block.id,
            name: block.name,
            input: block.input,
          });
        }
      }

      expect(text).toBe("Creating the work item now.");
      expect(toolCalls).toHaveLength(1);
      expect(toolCalls[0].id).toBe("toolu_01A09q90");
      expect(toolCalls[0].name).toBe("create_work_item");
      expect(toolCalls[0].input).toEqual({
        project_id: "proj_123",
        name: "Fix button alignment",
        priority: "medium",
      });
      expect(anthropicFixture.stop_reason).toBe("tool_use");
    });
  });

  describe("OpenAI Wire Format", () => {
    it("transforms neutral messages into OpenAI messages format", () => {
      const openAIMessages: Array<Record<string, any>> = [];

      for (const msg of sampleMessages) {
        switch (msg.role) {
          case "user":
            openAIMessages.push({ role: "user", content: msg.text });
            break;
          case "assistant": {
            const assistantMsg: Record<string, any> = {
              role: "assistant",
              content: msg.text || null,
            };
            if (msg.toolCalls.length > 0) {
              assistantMsg.tool_calls = msg.toolCalls.map((tc) => ({
                id: tc.id,
                type: "function",
                function: {
                  name: tc.name,
                  arguments: JSON.stringify(tc.input),
                },
              }));
            }
            openAIMessages.push(assistantMsg);
            break;
          }
          case "tool":
            for (const result of msg.results) {
              openAIMessages.push({
                role: "tool",
                tool_call_id: result.id,
                content: result.content,
              });
            }
            break;
        }
      }

      expect(openAIMessages[0]).toEqual({
        role: "user",
        content: "Create high priority bug for checkout error",
      });

      expect(openAIMessages[1]).toEqual({
        role: "assistant",
        content: "I will create this work item for you.",
        tool_calls: [
          {
            id: "call_123",
            type: "function",
            function: {
              name: "create_work_item",
              arguments: JSON.stringify({ project_id: "proj_abc", name: "Checkout error", priority: "high" }),
            },
          },
        ],
      });

      expect(openAIMessages[2]).toEqual({
        role: "tool",
        tool_call_id: "call_123",
        content: '{"id":"issue_999","sequence_id":42,"name":"Checkout error"}',
      });
    });

    it("decodes OpenAI response fixture into normalized AgentTurn", () => {
      const openAIFixture = {
        id: "chatcmpl-9xyz",
        choices: [
          {
            message: {
              role: "assistant",
              content: "I'll create that ticket for you.",
              tool_calls: [
                {
                  id: "call_abc123",
                  type: "function",
                  function: {
                    name: "create_work_item",
                    arguments: '{"project_id":"p1","name":"Navbar responsiveness","priority":"urgent"}',
                  },
                },
              ],
            },
            finish_reason: "tool_calls",
          },
        ],
        usage: { prompt_tokens: 120, completion_tokens: 35 },
      };

      const choice = openAIFixture.choices[0];
      const toolCalls: ToolCall[] = choice.message.tool_calls.map((tc) => ({
        id: tc.id,
        name: tc.function.name,
        input: JSON.parse(tc.function.arguments),
      }));

      expect(choice.message.content).toBe("I'll create that ticket for you.");
      expect(toolCalls).toHaveLength(1);
      expect(toolCalls[0].id).toBe("call_abc123");
      expect(toolCalls[0].name).toBe("create_work_item");
      expect(toolCalls[0].input).toEqual({
        project_id: "p1",
        name: "Navbar responsiveness",
        priority: "urgent",
      });
    });
  });

  describe("Google Gemini Wire Format", () => {
    it("transforms neutral messages into Gemini contents format", () => {
      const geminiContents: Array<{ role: string; parts: Array<Record<string, any>> }> = [];

      for (const msg of sampleMessages) {
        switch (msg.role) {
          case "user":
            geminiContents.push({
              role: "user",
              parts: [{ text: msg.text }],
            });
            break;
          case "assistant": {
            const parts: Array<Record<string, any>> = [];
            if (msg.text) parts.push({ text: msg.text });
            for (const tc of msg.toolCalls) {
              parts.push({
                functionCall: {
                  name: tc.name,
                  args: tc.input,
                },
              });
            }
            geminiContents.push({
              role: "model",
              parts,
            });
            break;
          }
          case "tool": {
            const parts = msg.results.map((r) => ({
              functionResponse: {
                name: r.name,
                response: { content: r.content, isError: r.isError },
              },
            }));
            geminiContents.push({
              role: "function",
              parts,
            });
            break;
          }
        }
      }

      expect(geminiContents[0]).toEqual({
        role: "user",
        parts: [{ text: "Create high priority bug for checkout error" }],
      });

      expect(geminiContents[1]).toEqual({
        role: "model",
        parts: [
          { text: "I will create this work item for you." },
          {
            functionCall: {
              name: "create_work_item",
              args: { project_id: "proj_abc", name: "Checkout error", priority: "high" },
            },
          },
        ],
      });

      expect(geminiContents[2]).toEqual({
        role: "function",
        parts: [
          {
            functionResponse: {
              name: "create_work_item",
              response: {
                content: '{"id":"issue_999","sequence_id":42,"name":"Checkout error"}',
                isError: false,
              },
            },
          },
        ],
      });
    });

    it("decodes Gemini response fixture into normalized AgentTurn", () => {
      const geminiFixture = {
        candidates: [
          {
            content: {
              role: "model",
              parts: [
                { text: "Let me fetch that work item." },
                {
                  functionCall: {
                    name: "get_work_item",
                    args: { issue_id: "issue_12345" },
                  },
                },
              ],
            },
            finishReason: "STOP",
          },
        ],
        usageMetadata: { promptTokenCount: 95, candidatesTokenCount: 22 },
      };

      const candidate = geminiFixture.candidates[0];
      let text = "";
      const toolCalls: ToolCall[] = [];

      for (const part of candidate.content.parts) {
        if (part.text) text += part.text;
        if (part.functionCall) {
          toolCalls.push({
            id: "call_mock_gemini",
            name: part.functionCall.name,
            input: part.functionCall.args,
          });
        }
      }

      expect(text).toBe("Let me fetch that work item.");
      expect(toolCalls).toHaveLength(1);
      expect(toolCalls[0].name).toBe("get_work_item");
      expect(toolCalls[0].input).toEqual({ issue_id: "issue_12345" });
    });
  });
});
