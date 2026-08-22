/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

/**
 * Converts the Markdown subset that language models actually emit into the
 * HTML the rich text editor expects.
 *
 * This is deliberately not a full CommonMark implementation. The AI surfaces
 * take a short answer and drop it into a document — headings, emphasis, code,
 * lists and links cover it, and a real parser would add ~100KB to the bundle
 * for the sake of reference links and setext headings no model produces.
 *
 * Everything is escaped before any tag is emitted, so model output cannot
 * inject markup into the editor.
 */

const escapeHtml = (value: string): string =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// A NUL-delimited sentinel: NUL cannot occur in model output, so prose that
// happens to look like a placeholder is never swallowed by the restore pass.
const SENTINEL = "\u0000";

/** Inline spans: code first, so emphasis inside a code span is left alone. */
const renderInline = (text: string): string => {
  const codeSpans: string[] = [];
  // Stash code spans behind a sentinel so escaping and emphasis leave them alone.
  let working = text.replace(/`([^`\n]+)`/g, (_match, code: string) => {
    codeSpans.push(`<code>${escapeHtml(code)}</code>`);
    return `${SENTINEL}${codeSpans.length - 1}${SENTINEL}`;
  });

  working = escapeHtml(working);

  working = working
    .replace(/\*\*\*([^*]+)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>")
    .replace(/__([^_]+)__/g, "<strong>$1</strong>")
    .replace(/~~([^~]+)~~/g, "<s>$1</s>");

  // Only http(s) and mailto links become anchors; anything else stays as plain
  // text so a javascript: URL cannot reach the editor.
  working = working.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (match, label: string, href: string) => {
    if (!/^(https?:\/\/|mailto:)/i.test(href)) return match;
    return `<a href="${href.replace(/"/g, "&quot;")}" target="_blank" rel="noopener noreferrer">${label}</a>`;
  });

  // eslint-disable-next-line no-control-regex
  return working.replace(/\u0000(\d+)\u0000/g, (_match, index: string) => codeSpans[Number(index)] ?? "");
};

/**
 * Renders a Markdown string as an HTML fragment.
 *
 * @param markdown raw model output
 * @returns HTML safe to hand to the editor, or an empty string for empty input
 */
export const markdownToHtml = (markdown: string): string => {
  if (!markdown?.trim()) return "";

  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];

  let paragraph: string[] = [];
  let listType: "ul" | "ol" | null = null;
  let codeFence: { lang: string; lines: string[] } | null = null;

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    out.push(`<p>${renderInline(paragraph.join(" "))}</p>`);
    paragraph = [];
  };

  const closeList = () => {
    if (!listType) return;
    out.push(`</${listType}>`);
    listType = null;
  };

  const openList = (type: "ul" | "ol") => {
    if (listType === type) return;
    closeList();
    out.push(`<${type}>`);
    listType = type;
  };

  for (const line of lines) {
    const fence = /^\s*```(\w*)\s*$/.exec(line);
    if (fence) {
      if (codeFence) {
        const languageAttribute = codeFence.lang ? ` class="language-${escapeHtml(codeFence.lang)}"` : "";
        out.push(`<pre><code${languageAttribute}>${escapeHtml(codeFence.lines.join("\n"))}</code></pre>`);
        codeFence = null;
      } else {
        flushParagraph();
        closeList();
        codeFence = { lang: fence[1] ?? "", lines: [] };
      }
      continue;
    }

    if (codeFence) {
      codeFence.lines.push(line);
      continue;
    }

    if (!line.trim()) {
      flushParagraph();
      closeList();
      continue;
    }

    const heading = /^(#{1,6})\s+(.*)$/.exec(line);
    if (heading) {
      flushParagraph();
      closeList();
      const level = heading[1].length;
      out.push(`<h${level}>${renderInline(heading[2].trim())}</h${level}>`);
      continue;
    }

    if (/^\s*(?:[-*_]\s*){3,}$/.test(line)) {
      flushParagraph();
      closeList();
      out.push("<hr />");
      continue;
    }

    const blockquote = /^\s*>\s?(.*)$/.exec(line);
    if (blockquote) {
      flushParagraph();
      closeList();
      out.push(`<blockquote><p>${renderInline(blockquote[1])}</p></blockquote>`);
      continue;
    }

    const unordered = /^\s*[-*+]\s+(.*)$/.exec(line);
    if (unordered) {
      flushParagraph();
      openList("ul");
      out.push(`<li>${renderInline(unordered[1])}</li>`);
      continue;
    }

    const ordered = /^\s*\d+[.)]\s+(.*)$/.exec(line);
    if (ordered) {
      flushParagraph();
      openList("ol");
      out.push(`<li>${renderInline(ordered[1])}</li>`);
      continue;
    }

    closeList();
    paragraph.push(line.trim());
  }

  // An unterminated fence still has content worth keeping.
  if (codeFence) {
    out.push(`<pre><code>${escapeHtml(codeFence.lines.join("\n"))}</code></pre>`);
  }
  flushParagraph();
  closeList();

  return out.join("");
};
