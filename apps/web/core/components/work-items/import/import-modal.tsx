import React, { useState, useEffect } from "react";
import {
  UploadCloud,
  FileSpreadsheet,
  FileText,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  X,
  RefreshCcw,
  Sparkles,
  Layers,
  Users,
  Tag,
} from "@keel/propel/icons";
import { useTranslation } from "@keel/i18n";
import { Button } from "@keel/propel/button";
import { setToast, TOAST_TYPE } from "@keel/propel/toast";
import { cn, parseCSV } from "@keel/utils";
import type { ProjectImportContext, RawImportItem, ResolutionResult, BulkWorkItemPayload } from "@keel/services";
import { supabaseImportService } from "@keel/services";

export interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceSlug: string;
  projectId: string;
  projectName?: string;
  onSuccess?: () => void;
}

type ImportStage = "upload" | "mapping" | "preview" | "importing" | "complete";
type ImportType = "csv" | "text" | "pdf";

export function BulkImportModal(props: BulkImportModalProps) {
  const { isOpen, onClose, projectId, projectName = "Project", onSuccess } = props;
  const { t } = useTranslation();

  // Stages
  const [stage, setStage] = useState<ImportStage>("upload");
  const [importType, setImportType] = useState<ImportType>("csv");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Raw file/text data
  const [rawText, setRawText] = useState("");
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvRows, setCsvRows] = useState<Record<string, string>[]>([]);

  // Column mapping (field -> csvHeader)
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({
    name: "",
    description: "",
    priority: "",
    state: "",
    assignees: "",
    labels: "",
    start_date: "",
    target_date: "",
  });

  // Project context & resolved data
  const [projectContext, setProjectContext] = useState<ProjectImportContext | null>(null);
  const [rawItems, setRawItems] = useState<RawImportItem[]>([]);
  const [resolution, setResolution] = useState<ResolutionResult | null>(null);

  // Manual overrides for unresolved values: key is `${fieldName}:${rawValue}` -> targetUUID/Value
  const [unresolvedOverrides, setUnresolvedOverrides] = useState<Record<string, string>>({});

  // Import execution progress
  const [importProgress, setImportProgress] = useState({ completed: 0, total: 0, percentage: 0 });
  const [createdCount, setCreatedCount] = useState(0);

  // Load project context on mount / open
  useEffect(() => {
    if (isOpen && projectId) {
      supabaseImportService
        .loadProjectContext(projectId)
        .then(setProjectContext)
        .catch((err) => {
          setError(err.message || "Failed to load project configuration.");
        });
    }
  }, [isOpen, projectId]);

  if (!isOpen) return null;

  // Auto-guess CSV column mappings
  const autoMapHeaders = (headers: string[]) => {
    const mapping: Record<string, string> = {
      name: "",
      description: "",
      priority: "",
      state: "",
      assignees: "",
      labels: "",
      start_date: "",
      target_date: "",
    };

    for (const h of headers) {
      const lower = h.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (
        !mapping.name &&
        (lower.includes("title") || lower.includes("name") || lower.includes("summary") || lower === "issue")
      ) {
        mapping.name = h;
      } else if (
        !mapping.description &&
        (lower.includes("description") ||
          lower.includes("details") ||
          lower.includes("body") ||
          lower.includes("notes"))
      ) {
        mapping.description = h;
      } else if (
        !mapping.priority &&
        (lower.includes("priority") || lower.includes("severity") || lower.includes("urgency"))
      ) {
        mapping.priority = h;
      } else if (
        !mapping.state &&
        (lower.includes("state") || lower.includes("status") || lower.includes("stage") || lower.includes("workflow"))
      ) {
        mapping.state = h;
      } else if (
        !mapping.assignees &&
        (lower.includes("assignee") ||
          lower.includes("assigned") ||
          lower.includes("owner") ||
          lower.includes("member"))
      ) {
        mapping.assignees = h;
      } else if (
        !mapping.labels &&
        (lower.includes("label") || lower.includes("tag") || lower.includes("category") || lower.includes("component"))
      ) {
        mapping.labels = h;
      } else if (
        !mapping.target_date &&
        (lower.includes("due") || lower.includes("target") || lower.includes("deadline"))
      ) {
        mapping.target_date = h;
      } else if (!mapping.start_date && (lower.includes("start") || lower.includes("begin"))) {
        mapping.start_date = h;
      }
    }

    // Default first column to name if nothing matched
    if (!mapping.name && headers.length > 0) {
      mapping.name = headers[0];
    }

    setColumnMapping(mapping);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    const fileName = file.name.toLowerCase();

    if (fileName.endsWith(".csv") || fileName.endsWith(".txt")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = (event.target?.result as string) || "";
        setRawText(text);

        if (fileName.endsWith(".csv")) {
          setImportType("csv");
          const { headers, rows } = parseCSV(text);
          if (headers.length === 0 || rows.length === 0) {
            setError("The CSV file is empty or could not be parsed.");
            return;
          }
          setCsvHeaders(headers);
          setCsvRows(rows);
          autoMapHeaders(headers);
          setStage("mapping");
        } else {
          setImportType("text");
        }
      };
      reader.readAsText(file);
    } else if (fileName.endsWith(".pdf")) {
      setImportType("pdf");
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = (event.target?.result as string) || "";
        setRawText(text);
      };
      reader.readAsText(file);
    } else {
      setError("Supported file types are .csv, .txt, and .pdf.");
    }
  };

  const handleProcessText = async () => {
    if (!rawText.trim()) {
      setError("Please paste or upload text content first.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const extracted = await supabaseImportService.extractTasksFromText(rawText);
      if (extracted.length === 0) {
        throw new Error("No tasks could be extracted. Please check the text formatting or use CSV.");
      }
      setRawItems(extracted);
      runResolution(extracted, unresolvedOverrides);
      setStage("preview");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to extract tasks using Keel AI.");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyMapping = () => {
    if (!columnMapping.name) {
      setError("Please map at least the 'Name / Title' column.");
      return;
    }

    const items: RawImportItem[] = csvRows.map((row) => ({
      name: row[columnMapping.name] || "",
      description: columnMapping.description ? row[columnMapping.description] : undefined,
      priority: columnMapping.priority ? row[columnMapping.priority] : undefined,
      state: columnMapping.state ? row[columnMapping.state] : undefined,
      assignees: columnMapping.assignees ? row[columnMapping.assignees] : undefined,
      labels: columnMapping.labels ? row[columnMapping.labels] : undefined,
      start_date: columnMapping.start_date ? row[columnMapping.start_date] : undefined,
      target_date: columnMapping.target_date ? row[columnMapping.target_date] : undefined,
    }));

    setRawItems(items);
    runResolution(items, unresolvedOverrides);
    setStage("preview");
  };

  const runResolution = (items: RawImportItem[], overrides: Record<string, string>) => {
    if (!projectContext) return;

    // Apply manual overrides to raw items
    const adjustedItems = items.map((item) => {
      const copy = { ...item };
      if (copy.state && overrides[`state:${copy.state.toLowerCase()}`]) {
        copy.state_id = overrides[`state:${copy.state.toLowerCase()}`];
      }
      return copy;
    });

    const res = supabaseImportService.resolveRows(adjustedItems, projectContext);
    setResolution(res);
  };

  const handleOverride = (key: string, value: string) => {
    const newOverrides = { ...unresolvedOverrides, [key]: value };
    setUnresolvedOverrides(newOverrides);
    runResolution(rawItems, newOverrides);
  };

  const handleStartImport = async () => {
    if (!resolution || !projectContext) return;

    setLoading(true);
    setError(null);
    setStage("importing");
    setImportProgress({ completed: 0, total: resolution.resolvedItems.length, percentage: 0 });

    try {
      const created = await supabaseImportService.executeBulkImport(
        projectContext.projectId,
        resolution.resolvedItems,
        (p) => setImportProgress(p)
      );

      setCreatedCount(created.length);
      setStage("complete");
      onSuccess?.();
      setToast({
        type: TOAST_TYPE.SUCCESS,
        title: "Import complete",
        message: `Successfully imported ${created.length} work items into ${projectName}.`,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Bulk import encountered an error.");
      setStage("preview");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="animate-in fade-in zoom-in-95 flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-subtle bg-surface-1 shadow-overlay-200 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-subtle bg-surface-1 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-xl bg-accent-primary/10 text-accent-primary">
              <UploadCloud className="size-4" />
            </span>
            <div>
              <h2 className="text-15 font-semibold text-primary">Import Work Items</h2>
              <p className="text-12 text-tertiary">
                Target Project: <span className="font-medium text-secondary">{projectName}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-8 place-items-center rounded-lg text-tertiary transition-colors hover:bg-layer-1 hover:text-primary"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="border-danger-primary/30 mx-6 mt-4 flex items-center gap-2.5 rounded-xl border bg-danger-primary/10 px-4 py-3 text-12 font-medium text-danger-primary">
            <AlertTriangle className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Body */}
        <div className="min-h-[380px] flex-1 overflow-y-auto p-6">
          {/* Stage 1: Upload */}
          {stage === "upload" && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => setImportType("csv")}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-2xl border p-5 text-center transition-all",
                    importType === "csv"
                      ? "border-accent-primary bg-accent-primary/5 text-primary shadow-raised-100"
                      : "border-subtle text-secondary hover:bg-layer-1"
                  )}
                >
                  <FileSpreadsheet className="size-6 text-accent-primary" />
                  <span className="text-13 font-semibold">CSV File</span>
                  <span className="text-11 text-tertiary">Fast & structured</span>
                </button>
                <button
                  type="button"
                  onClick={() => setImportType("text")}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-2xl border p-5 text-center transition-all",
                    importType === "text"
                      ? "border-accent-primary bg-accent-primary/5 text-primary shadow-raised-100"
                      : "border-subtle text-secondary hover:bg-layer-1"
                  )}
                >
                  <FileCode className="size-6 text-accent-primary" />
                  <span className="text-13 font-semibold">Paste Text</span>
                  <span className="text-11 text-tertiary">AI-extracted</span>
                </button>
                <button
                  type="button"
                  onClick={() => setImportType("pdf")}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-2xl border p-5 text-center transition-all",
                    importType === "pdf"
                      ? "border-accent-primary bg-accent-primary/5 text-primary shadow-raised-100"
                      : "border-subtle text-secondary hover:bg-layer-1"
                  )}
                >
                  <FileText className="size-6 text-accent-primary" />
                  <span className="text-13 font-semibold">PDF Document</span>
                  <span className="text-11 text-tertiary">AI document parser</span>
                </button>
              </div>

              {importType === "csv" ? (
                <label className="hover:border-accent-primary/50 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-subtle p-8 transition-all hover:bg-layer-1/50">
                  <UploadCloud className="mb-3 size-10 text-tertiary" />
                  <p className="text-13 font-medium text-primary">Click to upload or drag & drop a CSV file</p>
                  <p className="mt-1 text-11 text-tertiary">UTF-8 CSV with headers (comma or semicolon separated)</p>
                  <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
                </label>
              ) : (
                <div className="space-y-3">
                  <textarea
                    rows={8}
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    placeholder="Paste task lists, sprint notes, or exported tickets here..."
                    className="focus:border-accent-primary font-mono w-full rounded-xl border border-subtle bg-surface-2 p-4 text-13 text-primary transition-all outline-none"
                  />
                  <div className="flex justify-end">
                    <Button variant="primary" onClick={handleProcessText} loading={loading} disabled={!rawText.trim()}>
                      <Sparkles className="mr-1.5 size-3.5" />
                      Extract with Keel AI
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Stage 2: Column Mapping */}
          {stage === "mapping" && (
            <div className="space-y-5">
              <div>
                <h3 className="text-14 font-semibold text-primary">Map CSV Columns</h3>
                <p className="text-12 text-tertiary">Match your CSV column headers to Keel work item fields.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { field: "name", label: "Name / Title *", icon: FileText, required: true },
                  { field: "description", label: "Description", icon: FileCode },
                  { field: "priority", label: "Priority (urgent/high/med/low)", icon: AlertTriangle },
                  { field: "state", label: "Workflow State", icon: Layers },
                  { field: "assignees", label: "Assignees (Name or Email)", icon: Users },
                  { field: "labels", label: "Labels", icon: Tag },
                  { field: "target_date", label: "Due Date", icon: CheckCircle2 },
                ].map(({ field, label, icon: Icon, required }) => (
                  <div
                    key={field}
                    className="flex flex-col gap-1.5 rounded-xl border border-subtle bg-surface-2/40 p-3"
                  >
                    <label className="flex items-center gap-1.5 text-12 font-medium text-secondary">
                      <Icon className="size-3.5 text-tertiary" />
                      <span>{label}</span>
                    </label>
                    <select
                      value={columnMapping[field] || ""}
                      onChange={(e) => setColumnMapping({ ...columnMapping, [field]: e.target.value })}
                      className="focus:border-accent-primary rounded-lg border border-subtle bg-surface-1 px-3 py-2 text-12 text-primary outline-none"
                    >
                      <option value="">-- {required ? "Select Column" : "Skip Field"} --</option>
                      {csvHeaders.map((header) => (
                        <option key={header} value={header}>
                          {header}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stage 3: Preview & Resolution */}
          {stage === "preview" && resolution && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-14 font-semibold text-primary">Review & Validate Rows</h3>
                  <p className="text-12 text-tertiary">
                    {resolution.totalRows} items ready for import. Unresolved names will fall back to project defaults.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-success-primary/10 px-2.5 py-1 text-11 font-medium text-success-primary">
                    <CheckCircle2 className="size-3" />
                    {resolution.resolvableCount} valid
                  </span>
                  {resolution.unresolvedCount > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-warning-primary/10 px-2.5 py-1 text-11 font-medium text-warning-primary">
                      <AlertTriangle className="size-3" />
                      {resolution.unresolvedCount} warnings
                    </span>
                  )}
                </div>
              </div>

              {/* Unresolved Mappings Alert & Quick Fix */}
              {resolution.unresolvedIssues.length > 0 && (
                <div className="border-warning-primary/30 space-y-3 rounded-xl border bg-warning-primary/5 p-4">
                  <p className="flex items-center gap-1.5 text-12 font-semibold text-warning-primary">
                    <AlertTriangle className="size-3.5" />
                    Unresolved values detected. You can map them to existing entities below:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {resolution.unresolvedIssues.slice(0, 6).map((issue, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-2 rounded-lg border border-subtle bg-surface-1 p-2 text-11"
                      >
                        <span className="truncate font-medium text-secondary">
                          {issue.fieldName}: &ldquo;{issue.rawValue}&rdquo;
                        </span>
                        {issue.suggestedOptions && (
                          <select
                            onChange={(e) =>
                              handleOverride(`${issue.fieldName}:${issue.rawValue.toLowerCase()}`, e.target.value)
                            }
                            className="rounded border border-subtle bg-surface-2 px-1.5 py-0.5 text-11 text-primary"
                          >
                            <option value="">Map to...</option>
                            {issue.suggestedOptions.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Preview Table */}
              <div className="max-h-72 overflow-hidden overflow-y-auto rounded-xl border border-subtle">
                <table className="w-full text-left text-12">
                  <thead className="sticky top-0 border-b border-subtle bg-surface-2 font-semibold text-tertiary">
                    <tr>
                      <th className="p-2.5">#</th>
                      <th className="p-2.5">Title</th>
                      <th className="p-2.5">Priority</th>
                      <th className="p-2.5">State</th>
                      <th className="p-2.5">Assignees</th>
                      <th className="p-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-subtle">
                    {resolution.rawPreview.slice(0, 100).map((row, idx) => (
                      <tr key={idx} className="transition-colors hover:bg-layer-1/50">
                        <td className="p-2.5 text-tertiary">{idx + 1}</td>
                        <td className="max-w-xs truncate p-2.5 font-medium text-primary">{row.name}</td>
                        <td className="p-2.5 text-secondary capitalize">{row.resolved.priority}</td>
                        <td className="p-2.5 text-secondary">
                          {projectContext?.states.find((s) => s.id === row.resolved.state_id)?.name || "Default"}
                        </td>
                        <td className="p-2.5 text-secondary">{row.resolved.assignees?.length || 0}</td>
                        <td className="p-2.5">
                          {row.errors.length > 0 ? (
                            <span className="text-11 text-warning-primary" title={row.errors.join(", ")}>
                              ⚠️ {row.errors[0]}
                            </span>
                          ) : (
                            <span className="text-11 text-success-primary">✓ Ready</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Stage 4: Importing */}
          {stage === "importing" && (
            <div className="flex h-full flex-col items-center justify-center space-y-4 py-12 text-center">
              <RefreshCcw className="size-10 animate-spin text-accent-primary" />
              <div>
                <h3 className="text-15 font-semibold text-primary">Importing Work Items</h3>
                <p className="mt-1 text-12 text-tertiary">
                  Creating {importProgress.completed} of {importProgress.total} items...
                </p>
              </div>
              <div className="h-2 w-64 overflow-hidden rounded-full border border-subtle bg-surface-2">
                <div
                  className="h-full bg-accent-primary transition-all duration-300"
                  style={{ width: `${importProgress.percentage}%` }}
                />
              </div>
            </div>
          )}

          {/* Stage 5: Complete */}
          {stage === "complete" && (
            <div className="flex h-full flex-col items-center justify-center space-y-4 py-12 text-center">
              <div className="grid size-14 place-items-center rounded-2xl bg-success-primary/10 text-success-primary">
                <CheckCircle2 className="size-8" />
              </div>
              <div>
                <h3 className="text-16 font-semibold text-primary">Import Successful</h3>
                <p className="mt-1 text-13 text-secondary">
                  Created <b>{createdCount}</b> work items in <b>{projectName}</b>.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-subtle bg-surface-2/40 px-6 py-3.5">
          <div>
            {stage === "mapping" && (
              <Button variant="secondary" onClick={() => setStage("upload")}>
                <ArrowLeft className="mr-1 size-3.5" />
                Back to Upload
              </Button>
            )}
            {stage === "preview" && (
              <Button
                variant="secondary"
                onClick={() => (importType === "csv" ? setStage("mapping") : setStage("upload"))}
              >
                <ArrowLeft className="mr-1 size-3.5" />
                Back
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {stage !== "complete" && (
              <Button variant="secondary" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
            )}
            {stage === "mapping" && (
              <Button variant="primary" onClick={handleApplyMapping}>
                Preview & Validate
                <ArrowRight className="ml-1 size-3.5" />
              </Button>
            )}
            {stage === "preview" && (
              <Button variant="primary" onClick={handleStartImport} loading={loading}>
                Import {resolution?.resolvedItems.length || 0} Items
                <ArrowRight className="ml-1 size-3.5" />
              </Button>
            )}
            {stage === "complete" && (
              <Button variant="primary" onClick={onClose}>
                Done
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
