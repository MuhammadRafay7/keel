import { describe, it, expect } from "vitest";
import { SupabaseImportService, type ProjectImportContext, type RawImportItem } from "../src/supabase/import.service";

describe("SupabaseImportService - Name to UUID Resolver & Priority Normalization", () => {
  const service = new SupabaseImportService();

  const mockContext: ProjectImportContext = {
    projectId: "11111111-1111-1111-1111-111111111111",
    workspaceId: "22222222-2222-2222-2222-222222222222",
    defaultStateId: "state-default-uuid",
    states: [
      { id: "state-backlog-uuid", name: "Backlog", isDefault: false },
      { id: "state-default-uuid", name: "To Do", isDefault: true },
      { id: "state-inprogress-uuid", name: "In Progress", isDefault: false },
      { id: "state-done-uuid", name: "Done", isDefault: false },
    ],
    labels: [
      { id: "label-bug-uuid", name: "Bug" },
      { id: "label-feature-uuid", name: "Feature" },
      { id: "label-security-uuid", name: "Security" },
    ],
    members: [
      {
        id: "user-sam-uuid",
        name: "Sam Developer",
        email: "sam@company.com",
        display_name: "Sam Developer",
      },
      {
        id: "user-alice-uuid",
        name: "Alice Architect",
        email: "alice@company.com",
        display_name: "Alice Architect",
      },
    ],
  };

  describe("normalizePriority", () => {
    it("normalizes standard and alias priority values", () => {
      expect(service.normalizePriority("urgent")).toBe("urgent");
      expect(service.normalizePriority("CRITICAL")).toBe("urgent");
      expect(service.normalizePriority("blocker")).toBe("urgent");
      expect(service.normalizePriority("p0")).toBe("urgent");

      expect(service.normalizePriority("high")).toBe("high");
      expect(service.normalizePriority("Major")).toBe("high");
      expect(service.normalizePriority("p1")).toBe("high");

      expect(service.normalizePriority("medium")).toBe("medium");
      expect(service.normalizePriority("Normal")).toBe("medium");
      expect(service.normalizePriority("med")).toBe("medium");

      expect(service.normalizePriority("low")).toBe("low");
      expect(service.normalizePriority("minor")).toBe("low");

      expect(service.normalizePriority("none")).toBe("none");
      expect(service.normalizePriority("")).toBe("none");
      expect(service.normalizePriority(undefined)).toBe("none");
      expect(service.normalizePriority("unknown_val")).toBe("none");
    });
  });

  describe("resolveRows", () => {
    it("resolves clean rows with exact and case-insensitive names to UUIDs", () => {
      const rawItems: RawImportItem[] = [
        {
          name: "Fix login redirect",
          description: "Details on login bug",
          priority: "urgent",
          state: "in progress",
          assignees: ["sam@company.com"],
          labels: ["bug"],
        },
        {
          name: "Add user profile settings",
          priority: "high",
          state: "To Do",
          assignees: "Alice Architect",
          labels: "Feature, Security",
        },
      ];

      const result = service.resolveRows(rawItems, mockContext);

      expect(result.totalRows).toBe(2);
      expect(result.resolvableCount).toBe(2);
      expect(result.unresolvedCount).toBe(0);
      expect(result.unresolvedIssues).toHaveLength(0);

      // Row 0
      expect(result.resolvedItems[0].name).toBe("Fix login redirect");
      expect(result.resolvedItems[0].priority).toBe("urgent");
      expect(result.resolvedItems[0].state_id).toBe("state-inprogress-uuid");
      expect(result.resolvedItems[0].assignees).toEqual(["user-sam-uuid"]);
      expect(result.resolvedItems[0].labels).toEqual(["label-bug-uuid"]);

      // Row 1
      expect(result.resolvedItems[1].name).toBe("Add user profile settings");
      expect(result.resolvedItems[1].priority).toBe("high");
      expect(result.resolvedItems[1].state_id).toBe("state-default-uuid");
      expect(result.resolvedItems[1].assignees).toEqual(["user-alice-uuid"]);
      expect(result.resolvedItems[1].labels).toEqual(["label-feature-uuid", "label-security-uuid"]);
    });

    it("falls back to default state when state is omitted", () => {
      const rawItems: RawImportItem[] = [
        {
          name: "Task with no state",
        },
      ];

      const result = service.resolveRows(rawItems, mockContext);
      expect(result.resolvedItems[0].state_id).toBe("state-default-uuid");
      expect(result.unresolvedCount).toBe(0);
    });

    it("flags unresolved states, members, and labels with suggestions", () => {
      const rawItems: RawImportItem[] = [
        {
          name: "Task with bad references",
          state: "Nonexistent State",
          assignees: ["unknown@external.com"],
          labels: ["UnrecognizedLabel"],
        },
      ];

      const result = service.resolveRows(rawItems, mockContext);

      expect(result.totalRows).toBe(1);
      expect(result.unresolvedCount).toBe(3);
      expect(result.unresolvedIssues).toHaveLength(3);

      const stateIssue = result.unresolvedIssues.find((i) => i.fieldName === "state");
      expect(stateIssue).toBeDefined();
      expect(stateIssue?.rawValue).toBe("Nonexistent State");
      expect(stateIssue?.suggestedOptions?.length).toBe(4);

      const assigneeIssue = result.unresolvedIssues.find((i) => i.fieldName === "assignees");
      expect(assigneeIssue).toBeDefined();
      expect(assigneeIssue?.rawValue).toBe("unknown@external.com");

      const labelIssue = result.unresolvedIssues.find((i) => i.fieldName === "labels");
      expect(labelIssue).toBeDefined();
      expect(labelIssue?.rawValue).toBe("UnrecognizedLabel");
    });
  });
});
