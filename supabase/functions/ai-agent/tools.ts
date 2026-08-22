/**
 * Keel AI Agent Tool Registry.
 *
 * Every tool handler strictly executes using the user-scoped Supabase client.
 * Destructive tools are flagged with `destructive: true` to require client confirmation.
 */

import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import type { ToolSpec, ToolResult } from "../_shared/agent-types.ts";

export interface AgentToolContext {
  userId: string;
}

export interface AgentToolDefinition {
  spec: ToolSpec;
  destructive?: boolean;
  execute: (client: SupabaseClient, input: Record<string, any>, context: AgentToolContext) => Promise<string>;
}

export const AGENT_TOOLS: Record<string, AgentToolDefinition> = {
  // =========================================================================
  // READ-ONLY TOOLS
  // =========================================================================

  list_projects: {
    spec: {
      name: "list_projects",
      description: "List all accessible projects in the current workspace.",
      input_schema: {
        type: "object",
        properties: {
          workspace_id: { type: "string", description: "Optional workspace UUID filter" },
        },
      },
    },
    execute: async (client, input) => {
      let query = client
        .from("projects")
        .select("id, name, identifier, description, workspace_id, created_at")
        .is("deleted_at", null)
        .order("name");

      if (input.workspace_id) {
        query = query.eq("workspace_id", input.workspace_id);
      }

      const { data, error } = await query;
      if (error) throw new Error(`Failed to list projects: ${error.message}`);
      return JSON.stringify(data ?? []);
    },
  },

  list_states: {
    spec: {
      name: "list_states",
      description: "List workflow states (e.g. Backlog, Todo, In Progress, Done) for a given project.",
      input_schema: {
        type: "object",
        properties: {
          project_id: { type: "string", description: "The project UUID" },
        },
        required: ["project_id"],
      },
    },
    execute: async (client, input) => {
      const { data, error } = await client
        .from("states")
        .select("id, name, color, group, default, sequence, project_id")
        .eq("project_id", input.project_id)
        .is("deleted_at", null)
        .order("sequence");

      if (error) throw new Error(`Failed to list states: ${error.message}`);
      return JSON.stringify(data ?? []);
    },
  },

  list_labels: {
    spec: {
      name: "list_labels",
      description: "List all labels available for a given project.",
      input_schema: {
        type: "object",
        properties: {
          project_id: { type: "string", description: "The project UUID" },
        },
        required: ["project_id"],
      },
    },
    execute: async (client, input) => {
      const { data, error } = await client
        .from("labels")
        .select("id, name, color, description, project_id")
        .eq("project_id", input.project_id)
        .is("deleted_at", null)
        .order("name");

      if (error) throw new Error(`Failed to list labels: ${error.message}`);
      return JSON.stringify(data ?? []);
    },
  },

  list_members: {
    spec: {
      name: "list_members",
      description: "List all team members for a given project.",
      input_schema: {
        type: "object",
        properties: {
          project_id: { type: "string", description: "The project UUID" },
        },
        required: ["project_id"],
      },
    },
    execute: async (client, input) => {
      const { data, error } = await client
        .from("project_members")
        .select("member_id, role, users:member_id(id, email, display_name, first_name, last_name)")
        .eq("project_id", input.project_id)
        .is("deleted_at", null);

      if (error) throw new Error(`Failed to list members: ${error.message}`);
      const formatted = (data ?? []).map((m: any) => ({
        id: m.member_id,
        role: m.role,
        email: m.users?.email ?? "",
        display_name: m.users?.display_name || `${m.users?.first_name || ""} ${m.users?.last_name || ""}`.trim(),
      }));
      return JSON.stringify(formatted);
    },
  },

  list_cycles: {
    spec: {
      name: "list_cycles",
      description: "List all cycles (sprints) for a project.",
      input_schema: {
        type: "object",
        properties: {
          project_id: { type: "string", description: "The project UUID" },
        },
        required: ["project_id"],
      },
    },
    execute: async (client, input) => {
      const { data, error } = await client
        .from("cycles")
        .select("id, name, description, start_date, end_date, sort_order, project_id")
        .eq("project_id", input.project_id)
        .is("deleted_at", null)
        .order("sort_order");

      if (error) throw new Error(`Failed to list cycles: ${error.message}`);
      return JSON.stringify(data ?? []);
    },
  },

  list_modules: {
    spec: {
      name: "list_modules",
      description: "List all modules (epics/features) for a project.",
      input_schema: {
        type: "object",
        properties: {
          project_id: { type: "string", description: "The project UUID" },
        },
        required: ["project_id"],
      },
    },
    execute: async (client, input) => {
      const { data, error } = await client
        .from("modules")
        .select("id, name, description, status, start_date, target_date, sort_order, project_id")
        .eq("project_id", input.project_id)
        .is("deleted_at", null)
        .order("sort_order");

      if (error) throw new Error(`Failed to list modules: ${error.message}`);
      return JSON.stringify(data ?? []);
    },
  },

  search_work_items: {
    spec: {
      name: "search_work_items",
      description:
        "Search and filter work items across projects. Supports text query, state, priority, and pagination.",
      input_schema: {
        type: "object",
        properties: {
          query: { type: "string", description: "Text to search in work item name or description" },
          project_id: { type: "string", description: "Optional project UUID filter" },
          state_id: { type: "string", description: "Optional state UUID filter" },
          priority: {
            type: "string",
            enum: ["urgent", "high", "medium", "low", "none"],
            description: "Optional priority filter",
          },
          limit: { type: "number", description: "Maximum rows to return (default 20, max 50)" },
        },
      },
    },
    execute: async (client, input) => {
      const limit = Math.min(Math.max(Number(input.limit) || 20, 1), 50);

      let query = client
        .from("issues")
        .select(
          "id, sequence_id, name, priority, state_id, project_id, start_date, target_date, created_at, projects(identifier)"
        )
        .is("deleted_at", null)
        .is("archived_at", null)
        .order("updated_at", { ascending: false })
        .limit(limit);

      if (input.project_id) query = query.eq("project_id", input.project_id);
      if (input.state_id) query = query.eq("state_id", input.state_id);
      if (input.priority) query = query.eq("priority", input.priority);
      if (input.query) query = query.ilike("name", `%${input.query}%`);

      const { data, error } = await query;
      if (error) throw new Error(`Failed to search work items: ${error.message}`);

      const results = (data ?? []).map((row: any) => ({
        id: row.id,
        key: row.projects?.identifier ? `${row.projects.identifier}-${row.sequence_id}` : `KEEL-${row.sequence_id}`,
        name: row.name,
        priority: row.priority,
        state_id: row.state_id,
        project_id: row.project_id,
        start_date: row.start_date,
        target_date: row.target_date,
      }));

      return JSON.stringify(results);
    },
  },

  get_work_item: {
    spec: {
      name: "get_work_item",
      description:
        "Retrieve complete detail for a specific work item including description, comments, assignees, and labels.",
      input_schema: {
        type: "object",
        properties: {
          issue_id: { type: "string", description: "The work item UUID" },
        },
        required: ["issue_id"],
      },
    },
    execute: async (client, input) => {
      const [issueRes, assigneesRes, labelsRes, commentsRes] = await Promise.all([
        client
          .from("issues")
          .select("*, projects(name, identifier), states(name, color, group)")
          .eq("id", input.issue_id)
          .is("deleted_at", null)
          .single(),
        client
          .from("issue_assignees")
          .select("assignee_id, users:assignee_id(display_name, email)")
          .eq("issue_id", input.issue_id),
        client.from("issue_labels").select("label_id, labels:label_id(name, color)").eq("issue_id", input.issue_id),
        client
          .from("issue_comments")
          .select("id, comment_html, created_at, created_by_id, users:created_by_id(display_name)")
          .eq("issue_id", input.issue_id)
          .is("deleted_at", null)
          .order("created_at", { ascending: true }),
      ]);

      if (issueRes.error || !issueRes.data) {
        throw new Error(`Work item ${input.issue_id} not found or access denied.`);
      }

      const issue = issueRes.data;
      const key = issue.projects?.identifier
        ? `${issue.projects.identifier}-${issue.sequence_id}`
        : `KEEL-${issue.sequence_id}`;

      return JSON.stringify({
        id: issue.id,
        key,
        name: issue.name,
        description_html: issue.description_html,
        priority: issue.priority,
        state: issue.states?.name ?? issue.state_id,
        project: issue.projects?.name ?? issue.project_id,
        start_date: issue.start_date,
        target_date: issue.target_date,
        created_at: issue.created_at,
        assignees: (assigneesRes.data ?? []).map((a: any) => a.users?.display_name || a.users?.email || a.assignee_id),
        labels: (labelsRes.data ?? []).map((l: any) => l.labels?.name || l.label_id),
        comments: (commentsRes.data ?? []).map((c: any) => ({
          id: c.id,
          author: c.users?.display_name ?? "User",
          comment_html: c.comment_html,
          created_at: c.created_at,
        })),
      });
    },
  },

  get_cycle_progress: {
    spec: {
      name: "get_cycle_progress",
      description: "Get progress counts (total, completed, started, backlog) for cycles in a project.",
      input_schema: {
        type: "object",
        properties: {
          project_id: { type: "string", description: "The project UUID" },
        },
        required: ["project_id"],
      },
    },
    execute: async (client, input) => {
      const { data, error } = await client.rpc("cycle_progress", { p_project_id: input.project_id });
      if (error) throw new Error(`Failed to get cycle progress: ${error.message}`);
      return JSON.stringify(data ?? []);
    },
  },

  // =========================================================================
  // WRITE TOOLS
  // =========================================================================

  create_work_item: {
    spec: {
      name: "create_work_item",
      description: "Create a single new work item in a project.",
      input_schema: {
        type: "object",
        properties: {
          project_id: { type: "string", description: "Target project UUID" },
          name: { type: "string", description: "Work item title" },
          description_html: { type: "string", description: "Optional description HTML/text" },
          priority: {
            type: "string",
            enum: ["urgent", "high", "medium", "low", "none"],
            description: "Priority level",
          },
          state_id: { type: "string", description: "Optional workflow state UUID" },
          parent_id: { type: "string", description: "Optional parent work item UUID" },
          start_date: { type: "string", description: "Optional start date YYYY-MM-DD" },
          target_date: { type: "string", description: "Optional target/due date YYYY-MM-DD" },
          assignees: { type: "array", items: { type: "string" }, description: "Array of assignee user UUIDs" },
          labels: { type: "array", items: { type: "string" }, description: "Array of label UUIDs" },
        },
        required: ["project_id", "name"],
      },
    },
    execute: async (client, input) => {
      const { data, error } = await client.rpc("create_work_item", {
        p_project_id: input.project_id,
        p_name: input.name,
        p_description_html: input.description_html || "<p></p>",
        p_priority: input.priority || "none",
        p_state_id: input.state_id || null,
        p_parent_id: input.parent_id || null,
        p_start_date: input.start_date || null,
        p_target_date: input.target_date || null,
        p_assignees: input.assignees || [],
        p_labels: input.labels || [],
      });

      if (error) throw new Error(`Failed to create work item: ${error.message}`);
      return JSON.stringify(data);
    },
  },

  create_work_items_bulk: {
    spec: {
      name: "create_work_items_bulk",
      description: "Create multiple work items in a single transaction (up to 500 items).",
      input_schema: {
        type: "object",
        properties: {
          project_id: { type: "string", description: "Target project UUID" },
          items: {
            type: "array",
            description: "Array of work item objects to create",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                description_html: { type: "string" },
                priority: { type: "string" },
                state_id: { type: "string" },
                assignees: { type: "array", items: { type: "string" } },
                labels: { type: "array", items: { type: "string" } },
                start_date: { type: "string" },
                target_date: { type: "string" },
              },
              required: ["name"],
            },
          },
        },
        required: ["project_id", "items"],
      },
    },
    execute: async (client, input) => {
      const { data, error } = await client.rpc("create_work_items_bulk", {
        p_project_id: input.project_id,
        p_items: input.items,
      });

      if (error) throw new Error(`Bulk creation failed: ${error.message}`);
      return JSON.stringify({ created_count: Array.isArray(data) ? data.length : 0, items: data });
    },
  },

  update_work_item: {
    spec: {
      name: "update_work_item",
      description:
        "Update an existing work item's fields (name, description, priority, state, dates, assignees, labels).",
      input_schema: {
        type: "object",
        properties: {
          issue_id: { type: "string", description: "The work item UUID to update" },
          name: { type: "string", description: "New title" },
          description_html: { type: "string", description: "New description" },
          priority: { type: "string", enum: ["urgent", "high", "medium", "low", "none"] },
          state_id: { type: "string", description: "New workflow state UUID" },
          parent_id: { type: "string", description: "New parent work item UUID" },
          start_date: { type: "string", description: "Start date YYYY-MM-DD" },
          target_date: { type: "string", description: "Target date YYYY-MM-DD" },
          assignees: { type: "array", items: { type: "string" }, description: "Replacement assignee user UUIDs" },
          labels: { type: "array", items: { type: "string" }, description: "Replacement label UUIDs" },
        },
        required: ["issue_id"],
      },
    },
    execute: async (client, input, context) => {
      const updates: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
        updated_by_id: context.userId,
      };

      if (input.name !== undefined) updates.name = input.name;
      if (input.description_html !== undefined) updates.description_html = input.description_html;
      if (input.priority !== undefined) updates.priority = input.priority;
      if (input.state_id !== undefined) updates.state_id = input.state_id;
      if (input.parent_id !== undefined) updates.parent_id = input.parent_id;
      if (input.start_date !== undefined) updates.start_date = input.start_date;
      if (input.target_date !== undefined) updates.target_date = input.target_date;

      const { data: updated, error: updateError } = await client
        .from("issues")
        .update(updates)
        .eq("id", input.issue_id)
        .select()
        .single();

      if (updateError) throw new Error(`Failed to update work item: ${updateError.message}`);

      // Handle assignees replacement if provided
      if (Array.isArray(input.assignees)) {
        await client.from("issue_assignees").delete().eq("issue_id", input.issue_id);
        if (input.assignees.length > 0) {
          const rows = input.assignees.map((assigneeId: string) => ({
            issue_id: input.issue_id,
            project_id: updated.project_id,
            workspace_id: updated.workspace_id,
            assignee_id: assigneeId,
            created_by_id: context.userId,
            updated_by_id: context.userId,
          }));
          await client.from("issue_assignees").insert(rows);
        }
      }

      // Handle labels replacement if provided
      if (Array.isArray(input.labels)) {
        await client.from("issue_labels").delete().eq("issue_id", input.issue_id);
        if (input.labels.length > 0) {
          const rows = input.labels.map((labelId: string) => ({
            issue_id: input.issue_id,
            project_id: updated.project_id,
            workspace_id: updated.workspace_id,
            label_id: labelId,
            created_by_id: context.userId,
            updated_by_id: context.userId,
          }));
          await client.from("issue_labels").insert(rows);
        }
      }

      return JSON.stringify(updated);
    },
  },

  move_work_item: {
    spec: {
      name: "move_work_item",
      description: "Move a work item to a cycle, module, or state.",
      input_schema: {
        type: "object",
        properties: {
          issue_id: { type: "string", description: "The work item UUID" },
          cycle_id: { type: "string", description: "Optional target cycle UUID" },
          module_id: { type: "string", description: "Optional target module UUID" },
          state_id: { type: "string", description: "Optional target state UUID" },
        },
        required: ["issue_id"],
      },
    },
    execute: async (client, input, context) => {
      const { data: issue, error: issueErr } = await client
        .from("issues")
        .select("id, project_id, workspace_id")
        .eq("id", input.issue_id)
        .single();

      if (issueErr || !issue) throw new Error(`Work item ${input.issue_id} not found.`);

      if (input.state_id) {
        await client
          .from("issues")
          .update({ state_id: input.state_id, updated_at: new Date().toISOString(), updated_by_id: context.userId })
          .eq("id", input.issue_id);
      }

      if (input.cycle_id) {
        await client.from("cycle_issues").delete().eq("issue_id", input.issue_id);
        await client.from("cycle_issues").insert({
          cycle_id: input.cycle_id,
          issue_id: input.issue_id,
          project_id: issue.project_id,
          workspace_id: issue.workspace_id,
          created_by_id: context.userId,
          updated_by_id: context.userId,
        });
      }

      if (input.module_id) {
        await client.from("module_issues").delete().eq("issue_id", input.issue_id);
        await client.from("module_issues").insert({
          module_id: input.module_id,
          issue_id: input.issue_id,
          project_id: issue.project_id,
          workspace_id: issue.workspace_id,
          created_by_id: context.userId,
          updated_by_id: context.userId,
        });
      }

      const { data: refreshed } = await client.from("issues").select().eq("id", input.issue_id).single();
      return JSON.stringify(refreshed);
    },
  },

  add_comment: {
    spec: {
      name: "add_comment",
      description: "Post a comment on a work item.",
      input_schema: {
        type: "object",
        properties: {
          issue_id: { type: "string", description: "The work item UUID" },
          comment_html: { type: "string", description: "The comment HTML or text" },
        },
        required: ["issue_id", "comment_html"],
      },
    },
    execute: async (client, input, context) => {
      const { data: issue, error: issueErr } = await client
        .from("issues")
        .select("project_id, workspace_id")
        .eq("id", input.issue_id)
        .single();

      if (issueErr || !issue) throw new Error(`Work item ${input.issue_id} not found.`);

      const { data, error } = await client
        .from("issue_comments")
        .insert({
          issue_id: input.issue_id,
          project_id: issue.project_id,
          workspace_id: issue.workspace_id,
          comment_html: input.comment_html,
          comment_json: {},
          comment_stripped: input.comment_html.replace(/<[^>]*>?/gm, ""),
          created_by_id: context.userId,
          updated_by_id: context.userId,
        })
        .select()
        .single();

      if (error) throw new Error(`Failed to add comment: ${error.message}`);
      return JSON.stringify(data);
    },
  },

  create_saved_view: {
    spec: {
      name: "create_saved_view",
      description: "Create a saved filter view for a project.",
      input_schema: {
        type: "object",
        properties: {
          project_id: { type: "string", description: "The project UUID" },
          name: { type: "string", description: "Name of the view" },
          description: { type: "string", description: "Optional description" },
          rich_filters: {
            type: "object",
            description: "Filter definitions (e.g. { and: [{ priority__in: 'urgent,high' }] })",
          },
        },
        required: ["project_id", "name"],
      },
    },
    execute: async (client, input, context) => {
      const { data: project } = await client
        .from("projects")
        .select("workspace_id")
        .eq("id", input.project_id)
        .single();

      const { data, error } = await client
        .from("issue_views")
        .insert({
          name: input.name,
          description: input.description || "",
          project_id: input.project_id,
          workspace_id: project?.workspace_id,
          rich_filters: input.rich_filters || {},
          query: {},
          filters: {},
          display_filters: {},
          display_properties: {},
          access: 1,
          sort_order: 65535,
          owned_by_id: context.userId,
          created_by_id: context.userId,
          updated_by_id: context.userId,
        })
        .select()
        .single();

      if (error) throw new Error(`Failed to create saved view: ${error.message}`);
      return JSON.stringify(data);
    },
  },

  // =========================================================================
  // DESTRUCTIVE TOOLS (Require User Confirmation)
  // =========================================================================

  delete_work_item: {
    destructive: true,
    spec: {
      name: "delete_work_item",
      description: "Delete (soft-delete) a work item. (DESTRUCTIVE - requires user confirmation).",
      input_schema: {
        type: "object",
        properties: {
          issue_id: { type: "string", description: "The work item UUID to delete" },
        },
        required: ["issue_id"],
      },
    },
    execute: async (client, input, context) => {
      const { data, error } = await client
        .from("issues")
        .update({ deleted_at: new Date().toISOString(), updated_by_id: context.userId })
        .eq("id", input.issue_id)
        .select("id, name, sequence_id")
        .single();

      if (error) throw new Error(`Failed to delete work item: ${error.message}`);
      return JSON.stringify({ deleted: true, issue: data });
    },
  },

  bulk_delete_work_items: {
    destructive: true,
    spec: {
      name: "bulk_delete_work_items",
      description: "Delete multiple work items by ID. (DESTRUCTIVE - requires user confirmation).",
      input_schema: {
        type: "object",
        properties: {
          issue_ids: { type: "array", items: { type: "string" }, description: "Array of work item UUIDs to delete" },
        },
        required: ["issue_ids"],
      },
    },
    execute: async (client, input, context) => {
      const { data, error } = await client
        .from("issues")
        .update({ deleted_at: new Date().toISOString(), updated_by_id: context.userId })
        .in("id", input.issue_ids)
        .select("id, sequence_id");

      if (error) throw new Error(`Failed to bulk delete work items: ${error.message}`);
      return JSON.stringify({ deleted_count: data?.length || 0, issues: data });
    },
  },

  archive_work_item: {
    destructive: true,
    spec: {
      name: "archive_work_item",
      description: "Archive a work item. (DESTRUCTIVE - requires user confirmation).",
      input_schema: {
        type: "object",
        properties: {
          issue_id: { type: "string", description: "The work item UUID to archive" },
        },
        required: ["issue_id"],
      },
    },
    execute: async (client, input, context) => {
      const { data, error } = await client
        .from("issues")
        .update({ archived_at: new Date().toISOString(), updated_by_id: context.userId })
        .eq("id", input.issue_id)
        .select("id, name, sequence_id")
        .single();

      if (error) throw new Error(`Failed to archive work item: ${error.message}`);
      return JSON.stringify({ archived: true, issue: data });
    },
  },
};

/**
 * Safely executes a tool call using the user-scoped client.
 * Catches any thrown error and formats it as an isError: true result so the model can self-correct.
 */
export async function executeAgentTool(
  toolName: string,
  toolInput: Record<string, unknown>,
  userClient: SupabaseClient,
  context: AgentToolContext
): Promise<ToolResult> {
  const tool = AGENT_TOOLS[toolName];
  if (!tool) {
    return {
      id: `err_${Math.random().toString(36).slice(2, 9)}`,
      name: toolName,
      content: `Error: Tool '${toolName}' is not recognized.`,
      isError: true,
    };
  }

  try {
    const result = await tool.execute(userClient, toolInput, context);
    return {
      id: `res_${Math.random().toString(36).slice(2, 9)}`,
      name: toolName,
      content: result,
      isError: false,
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return {
      id: `err_${Math.random().toString(36).slice(2, 9)}`,
      name: toolName,
      content: `Tool execution error: ${errorMessage}`,
      isError: true,
    };
  }
}
