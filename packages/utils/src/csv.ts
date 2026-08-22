/**
 * RFC 4180 compliant CSV parser and serializer.
 *
 * Handles:
 * - UTF-8 Byte Order Mark (BOM)
 * - CRLF (\r\n), CR (\r), and LF (\n) line endings
 * - Quoted fields with embedded commas, quotes (""), and newlines
 * - Ragged rows (fewer or more values than headers)
 * - Empty line trimming and whitespace normalization
 */

export interface CSVParseResult {
  headers: string[];
  rows: Record<string, string>[];
  rawRows: string[][];
}

export interface CSVParseOptions {
  skipEmptyLines?: boolean;
  trimWhitespace?: boolean;
}

/**
 * Parses raw CSV text into a 2D array of string cells.
 */
export function parseCSVRows(input: string, options: CSVParseOptions = {}): string[][] {
  const { skipEmptyLines = true, trimWhitespace = true } = options;
  if (!input || typeof input !== "string") return [];

  // Strip BOM if present
  let cleanInput = input.charCodeAt(0) === 0xfeff ? input.slice(1) : input;
  // Normalize line breaks
  cleanInput = cleanInput.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = "";
  let inQuotes = false;
  let i = 0;

  while (i < cleanInput.length) {
    const char = cleanInput[i];
    const nextChar = cleanInput[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          // Escaped quote: "" -> "
          currentCell += '"';
          i += 2;
          continue;
        }
        // Closing quote
        inQuotes = false;
        i++;
        continue;
      }
      currentCell += char;
      i++;
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      i++;
      continue;
    }

    if (char === ",") {
      currentRow.push(trimWhitespace ? currentCell.trim() : currentCell);
      currentCell = "";
      i++;
      continue;
    }

    if (char === "\n") {
      currentRow.push(trimWhitespace ? currentCell.trim() : currentCell);
      currentCell = "";

      // Check if entire row is empty
      const isRowEmpty = currentRow.every((cell) => cell === "");
      if (!skipEmptyLines || !isRowEmpty) {
        rows.push(currentRow);
      }
      currentRow = [];
      i++;
      continue;
    }

    currentCell += char;
    i++;
  }

  // Finalize trailing cell and row
  if (currentCell !== "" || currentRow.length > 0) {
    currentRow.push(trimWhitespace ? currentCell.trim() : currentCell);
    const isRowEmpty = currentRow.every((cell) => cell === "");
    if (!skipEmptyLines || !isRowEmpty) {
      rows.push(currentRow);
    }
  }

  return rows;
}

/**
 * Parses CSV text with headers into structured objects.
 */
export function parseCSV(input: string, options: CSVParseOptions = {}): CSVParseResult {
  const rawRows = parseCSVRows(input, options);
  if (rawRows.length === 0) {
    return { headers: [], rows: [], rawRows: [] };
  }

  const headers = rawRows[0].map((h, idx) => (h ? h : `Column_${idx + 1}`));
  const dataRows = rawRows.slice(1);

  const rows: Record<string, string>[] = [];
  for (const rawRow of dataRows) {
    const rowObj: Record<string, string> = {};
    for (let colIdx = 0; colIdx < headers.length; colIdx++) {
      const headerName = headers[colIdx];
      rowObj[headerName] = rawRow[colIdx] ?? "";
    }
    rows.push(rowObj);
  }

  return { headers, rows, rawRows };
}

/**
 * Escapes a cell according to RFC 4180 rules.
 */
export function escapeCSVCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes('"') || str.includes(",") || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Serializes an array of records to RFC 4180 CSV string.
 */
export function serializeCSV(headers: string[], rows: Record<string, unknown>[]): string {
  if (headers.length === 0) return "";
  const headerLine = headers.map(escapeCSVCell).join(",");
  const rowLines = rows.map((row) => headers.map((header) => escapeCSVCell(row[header])).join(","));
  return [headerLine, ...rowLines].join("\r\n");
}
