/**
 * Supabase Bulk Import Service for Keel.
 *
 * Handles:
 * 1. Name -> UUID deterministic resolution (states, labels, members, cycles, modules)
 * 2. Case-insensitive normalization and priority mapping
 * 3. Flagging unresolved items for user preview & mapping
 * 4. Chunked execution of `create_work_items_bulk` (cap 500 per batch)
 * 5. Structured text/PDF task extraction using Keel AI
 */

import type { TIssue } from "@keel/types";
import { getSupabase } from "./client";
import { supabaseAIService } from "./ai.service";

export interface RawImportItem {
  name: string;
  description?: string;
  description_html?: string;
  priority?: string;
  state?: string;
  state_id?: string;
  assignees?: string[] | string;
  labels?: string[] | string;
  start_date?: string;
  target_date?: string;
  parent_id?: string;
}

export interface BulkWorkItemPayload {
  name: string;
  description_html?: string;
  priority?: "urgent" | "high" | "medium" | "low" | "none";
  state_id?: string;
  parent_id?: string;
  start_date?: string;
  target_date?: string;
  assignees?: string[];
  labels?: string[];
}

export interface UnresolvedItem {
  rowIndex: number;
  fieldName: "state" | "assignees" | "labels" | "name";
  rawValue: string;
  suggestedOptions?: { label: string; value: string }[];
}

export interface ResolutionResult {
  totalRows: number;
  resolvableCount: number;
  unresolvedCount: number;
  resolvedItems: BulkWorkItemPayload[];
  unresolvedIssues: UnresolvedItem[];
  rawPreview: (RawImportItem & { resolved: BulkWorkItemPayload; errors: string[] })[];
}

export interface ProjectImportContext {
  projectId: string;
  workspaceId: string;
  states: { id: string; name: string; isDefault: boolean }[];
  labels: { id: string; name: string }[];
  members: { id: string; name: string; email: string; display_name: string }[];
  defaultStateId: string;
}

export class SupabaseImportService {
  /**
   * Loads all target project reference entities for deterministic resolution.
   */
  async loadProjectContext(projectId: string): Promise<ProjectImportContext> {
    const supabase = getSupabase();

    const [projectRes, statesRes, labelsRes, membersRes] = await Promise.all([
      supabase.from("projects").select("id, workspace_id").eq("id", projectId).single(),
      supabase.from("states").select("id, name, default").eq("project_id", projectId).is("deleted_at", null),
      supabase.from("labels").select("id, name").eq("project_id", projectId).is("deleted_at", null),
      supabase
        .from("project_members")
        .select("member_id, users:member_id (id, email, display_name, first_name, last_name)")
        .eq("project_id", projectId)
        .is("deleted_at", null),
    ]);

    if (projectRes.error || !projectRes.data) {
      throw new Error(`Project ${projectId} not found or access denied.`);
    }

    const workspaceId = projectRes.data.workspace_id;
    const states = (statesRes.data ?? []).map((s: any) => ({
      id: s.id,
      name: s.name,
      isDefault: Boolean(s.default),
    }));

    const defaultState = states.find((s) => s.isDefault) ?? states[0];
    if (!defaultState) {
      throw new Error("Target project has no active workflow states.");
    }

    const labels = (labelsRes.data ?? []).map((l: any) => ({ id: l.id, name: l.name }));

    const members = (membersRes.data ?? []).map((m: any) => {
      const u = m.users ?? {};
      const displayName = u.display_name || `${u.first_name || ""} ${u.last_name || ""}`.trim() || u.email || "";
      return {
        id: m.member_id,
        name: displayName,
        email: u.email || "",
        display_name: displayName,
      };
    });

    return {
      projectId,
      workspaceId,
      states,
      labels,
      members,
      defaultStateId: defaultState.id,
    };
  }

  /**
   * Normalizes a string priority value into one of the 5 schema-accepted levels.
   */
  normalizePriority(raw?: string): "urgent" | "high" | "medium" | "low" | "none" {
    if (!raw) return "none";
    const cleaned = raw.trim().toLowerCase();

    switch (cleaned) {
      case "urgent":
      case "critical":
      case "blocker":
      case "p0":
      case "highest":
        return "urgent";
      case "high":
      case "major":
      case "p1":
        return "high";
      case "medium":
      case "normal":
      case "p2":
      case "med":
        return "medium";
      case "low":
      case "minor":
      case "lowest":
      case "p3":
        return "low";
      case "none":
      case "p4":
      default:
        return "none";
    }
  }

  /**
   * Deterministically resolves names in raw import rows to UUIDs for the target project.
   */
  resolveRows(rawItems: RawImportItem[], context: ProjectImportContext): ResolutionResult {
    const resolvedItems: BulkWorkItemPayload[] = [];
    const unresolvedIssues: UnresolvedItem[] = [];
    const rawPreview: (RawImportItem & { resolved: BulkWorkItemPayload; errors: string[] })[] = [];

    // Pre-build lowercase lookups
    const stateMap = new Map<string, string>();
    for (const state of context.states) {
      stateMap.set(state.name.trim().toLowerCase(), state.id);
      stateMap.set(state.id.toLowerCase(), state.id);
    }

    const labelMap = new Map<string, string>();
    for (const label of context.labels) {
      labelMap.set(label.name.trim().toLowerCase(), label.id);
      labelMap.set(label.id.toLowerCase(), label.id);
    }

    const memberMap = new Map<string, string>();
    for (const member of context.members) {
      memberMap.set(member.name.trim().toLowerCase(), member.id);
      if (member.email) memberMap.set(member.email.trim().toLowerCase(), member.id);
      memberMap.set(member.id.toLowerCase(), member.id);
    }

    for (let index = 0; index < rawItems.length; index++) {
      const raw = rawItems[index];
      const errors: string[] = [];

      // 1. Name validation
      const name = (raw.name || "").trim();
      if (!name) {
        errors.push("Missing work item name");
        unresolvedIssues.push({
          rowIndex: index,
          fieldName: "name",
          rawValue: "",
        });
      }

      // 2. State Resolution
      let stateId: string | undefined;
      const rawState = (raw.state_id || raw.state || "").trim();
      if (rawState) {
        const found = stateMap.get(rawState.toLowerCase());
        if (found) {
          stateId = found;
        } else {
          errors.push(`Unknown state: "${rawState}"`);
          unresolvedIssues.push({
            rowIndex: index,
            fieldName: "state",
            rawValue: rawState,
            suggestedOptions: context.states.map((s) => ({ label: s.name, value: s.id })),
          });
        }
      } else {
        stateId = context.defaultStateId;
      }

      // 3. Priority Resolution
      const priority = this.normalizePriority(raw.priority);

      // 4. Assignees Resolution
      const resolvedAssignees: string[] = [];
      const rawAssignees = Array.isArray(raw.assignees)
        ? raw.assignees
        : typeof raw.assignees === "string" && raw.assignees.trim()
          ? raw.assignees.split(/[,;]/).map((a) => a.trim())
          : [];

      for (const rawAssignee of rawAssignees) {
        if (!rawAssignee) continue;
        const found = memberMap.get(rawAssignee.toLowerCase());
        if (found) {
          if (!resolvedAssignees.includes(found)) resolvedAssignees.push(found);
        } else {
          errors.push(`Unknown member: "${rawAssignee}"`);
          unresolvedIssues.push({
            rowIndex: index,
            fieldName: "assignees",
            rawValue: rawAssignee,
            suggestedOptions: context.members.map((m) => ({ label: `${m.name} (${m.email})`, value: m.id })),
          });
        }
      }

      // 5. Labels Resolution
      const resolvedLabels: string[] = [];
      const rawLabels = Array.isArray(raw.labels)
        ? raw.labels
        : typeof raw.labels === "string" && raw.labels.trim()
          ? raw.labels.split(/[,;]/).map((l) => l.trim())
          : [];

      for (const rawLabel of rawLabels) {
        if (!rawLabel) continue;
        const found = labelMap.get(rawLabel.toLowerCase());
        if (found) {
          if (!resolvedLabels.includes(found)) resolvedLabels.push(found);
        } else {
          errors.push(`Unknown label: "${rawLabel}"`);
          unresolvedIssues.push({
            rowIndex: index,
            fieldName: "labels",
            rawValue: rawLabel,
            suggestedOptions: context.labels.map((l) => ({ label: l.name, value: l.id })),
          });
        }
      }

      // 6. Dates
      const startDate = raw.start_date ? this.sanitizeDate(raw.start_date) : undefined;
      const targetDate = raw.target_date ? this.sanitizeDate(raw.target_date) : undefined;

      const resolved: BulkWorkItemPayload = {
        name,
        description_html: raw.description_html || (raw.description ? `<p>${raw.description}</p>` : "<p></p>"),
        priority,
        state_id: stateId || context.defaultStateId,
        assignees: resolvedAssignees,
        labels: resolvedLabels,
        start_date: startDate,
        target_date: targetDate,
        parent_id: raw.parent_id || undefined,
      };

      resolvedItems.push(resolved);
      rawPreview.push({
        ...raw,
        resolved,
        errors,
      });
    }

    return {
      totalRows: rawItems.length,
      resolvableCount: rawItems.length - unresolvedIssues.length,
      unresolvedCount: unresolvedIssues.length,
      resolvedItems,
      unresolvedIssues,
      rawPreview,
    };
  }

  private sanitizeDate(dateStr: string): string | undefined {
    const parsed = new Date(dateStr);
    if (isNaN(parsed.getTime())) return undefined;
    return parsed.toISOString().split("T")[0];
  }

  /**
   * Executes chunked bulk creation via RPC `create_work_items_bulk`.
   * Batches are kept <= 500 rows to satisfy sequence lock constraints.
   */
  async executeBulkImport(
    projectId: string,
    items: BulkWorkItemPayload[],
    onProgress?: (progress: { completed: number; total: number; percentage: number }) => void
  ): Promise<TIssue[]> {
    const supabase = getSupabase();
    const CHUNK_SIZE = 500;
    const total = items.length;
    let completed = 0;
    const createdIssues: TIssue[] = [];

    for (let i = 0; i < total; i += CHUNK_SIZE) {
      const chunk = items.slice(i, i + CHUNK_SIZE);
      // eslint-disable-next-line no-await-in-loop
      const { data, error } = await supabase.rpc("create_work_items_bulk", {
        p_project_id: projectId,
        p_items: chunk,
      });

      if (error) {
        throw new Error(`Bulk import failed on items ${i + 1}-${i + chunk.length}: ${error.message}`);
      }

      if (data && Array.isArray(data)) {
        createdIssues.push(...(data as unknown as TIssue[]));
      }

      completed += chunk.length;
      onProgress?.({
        completed,
        total,
        percentage: Math.round((completed / total) * 100),
      });
    }

    return createdIssues;
  }

  /**
   * Extracts structured tasks from unstructured plain text or extracted PDF content using Keel AI.
   */
  async extractTasksFromText(text: string): Promise<RawImportItem[]> {
    if (!text?.trim()) return [];

    const prompt =
      "Analyze the following text/document and extract all actionable tasks and work items. " +
      "Return ONLY a valid JSON array of objects with the exact keys:\n" +
      '- "name" (required string, task title)\n' +
      '- "description" (optional string, task details)\n' +
      '- "priority" (optional string: "urgent" | "high" | "medium" | "low" | "none")\n' +
      '- "state" (optional string, e.g. "To Do", "In Progress", "Done")\n' +
      '- "assignees" (optional array of names/emails)\n' +
      '- "labels" (optional array of label strings)\n' +
      '- "target_date" (optional date string YYYY-MM-DD)\n\n' +
      "Text to extract from:\n" +
      text.slice(0, 12000);

    const { response } = await supabaseAIService.prompt({
      prompt,
      task: "ASK_ANYTHING",
    });

    try {
      // Find JSON block or parse directly
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      const jsonStr = jsonMatch ? jsonMatch[0] : response;
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed)) {
        return parsed.filter((item) => item && typeof item.name === "string" && item.name.trim() !== "");
      }
    } catch {
      throw new Error(
        "Keel AI could not parse structured work items from the provided text. Please verify or use CSV import."
      );
    }

    return [];
  }
}

export const supabaseImportService = new SupabaseImportService();
