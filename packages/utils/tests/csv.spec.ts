import { describe, it, expect } from "vitest";
import { parseCSV, parseCSVRows, serializeCSV, escapeCSVCell } from "../src/csv";

describe("CSV Parser & Serializer", () => {
  it("parses simple comma-separated rows with headers", () => {
    const csv = "name,priority,state\nBuild auth,high,In Progress\nFix bug,urgent,Todo";
    const result = parseCSV(csv);

    expect(result.headers).toEqual(["name", "priority", "state"]);
    expect(result.rows).toHaveLength(2);
    expect(result.rows[0]).toEqual({
      name: "Build auth",
      priority: "high",
      state: "In Progress",
    });
    expect(result.rows[1]).toEqual({
      name: "Fix bug",
      priority: "urgent",
      state: "Todo",
    });
  });

  it("parses raw 2D string grid with parseCSVRows", () => {
    const csv = "colA,colB\nval1,val2";
    const raw = parseCSVRows(csv);
    expect(raw).toEqual([
      ["colA", "colB"],
      ["val1", "val2"],
    ]);
  });

  it("handles quoted fields containing commas", () => {
    const csv = 'name,description\n"Project setup, phase 1","Initial repo, deps, and linting"';
    const result = parseCSV(csv);

    expect(result.headers).toEqual(["name", "description"]);
    expect(result.rows[0].name).toBe("Project setup, phase 1");
    expect(result.rows[0].description).toBe("Initial repo, deps, and linting");
  });

  it("handles escaped quotes inside quotes", () => {
    const csv = 'name,notes\n"Task with ""special"" mark","Note says ""Hello World"""';
    const result = parseCSV(csv);

    expect(result.rows[0].name).toBe('Task with "special" mark');
    expect(result.rows[0].notes).toBe('Note says "Hello World"');
  });

  it("handles embedded newlines within quotes", () => {
    const csv = 'name,description\nTask 1,"Line 1\nLine 2\nLine 3"\nTask 2,Simple';
    const result = parseCSV(csv);

    expect(result.rows).toHaveLength(2);
    expect(result.rows[0].name).toBe("Task 1");
    expect(result.rows[0].description).toBe("Line 1\nLine 2\nLine 3");
    expect(result.rows[1].name).toBe("Task 2");
    expect(result.rows[1].description).toBe("Simple");
  });

  it("handles CRLF (Windows) and CR (old Mac) line endings", () => {
    const csv = "name,priority\r\nTask A,high\r\nTask B,low\rTask C,none";
    const result = parseCSV(csv);

    expect(result.rows).toHaveLength(3);
    expect(result.rows[0].name).toBe("Task A");
    expect(result.rows[1].name).toBe("Task B");
    expect(result.rows[2].name).toBe("Task C");
  });

  it("strips UTF-8 Byte Order Mark (BOM) automatically", () => {
    const bomCsv = "\ufeffname,priority\nTask BOM,urgent";
    const result = parseCSV(bomCsv);

    expect(result.headers[0]).toBe("name");
    expect(result.rows[0].name).toBe("Task BOM");
  });

  it("handles ragged rows gracefully", () => {
    const csv = "col1,col2,col3\nval1,val2\nval3,val4,val5,val6";
    const result = parseCSV(csv);

    expect(result.rows[0]).toEqual({
      col1: "val1",
      col2: "val2",
      col3: "",
    });
    expect(result.rows[1]).toEqual({
      col1: "val3",
      col2: "val4",
      col3: "val5",
    });
  });

  it("escapes cells properly for serialization", () => {
    expect(escapeCSVCell("simple")).toBe("simple");
    expect(escapeCSVCell("with, comma")).toBe('"with, comma"');
    expect(escapeCSVCell('with "quotes"')).toBe('"with ""quotes"""');
    expect(escapeCSVCell("with\nnewline")).toBe('"with\nnewline"');
  });

  it("serializes rows to RFC 4180 CSV", () => {
    const headers = ["name", "priority", "description"];
    const rows = [
      { name: "Task 1", priority: "high", description: "Simple" },
      { name: "Task 2, special", priority: "urgent", description: 'Has "quotes" inside' },
    ];

    const serialized = serializeCSV(headers, rows);
    expect(serialized).toContain("name,priority,description");
    expect(serialized).toContain('"Task 2, special",urgent,"Has ""quotes"" inside"');
  });
});
