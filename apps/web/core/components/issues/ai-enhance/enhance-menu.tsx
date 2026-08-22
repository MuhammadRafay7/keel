import React, { useState, useRef } from "react";
import {
  Sparkles,
  Check,
  X,
  RefreshCcw,
  Type,
  FileText,
  Maximize2,
  FileSearch,
  CheckSquare,
  Minimize2,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";
import { AI_EDITOR_TASKS, LOADING_TEXTS } from "@keel/constants";
import { useTranslation } from "@keel/i18n";
import { Button } from "@keel/propel/button";
import { setToast, TOAST_TYPE } from "@keel/propel/toast";
import { cn } from "@keel/utils";
import { AIService } from "@/services/ai.service";

const aiService = new AIService();

export interface EnhanceWorkItemProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceSlug: string;
  projectId?: string;
  initialTitle: string;
  initialDescriptionHtml?: string;
  onAcceptTitle: (newTitle: string) => void;
  onAcceptDescription: (newDescriptionHtml: string) => void;
}

interface TaskItem {
  key: AI_EDITOR_TASKS;
  labelKey: string;
  defaultLabel: string;
  target: "title" | "description";
  icon: React.ElementType;
}

const ENHANCE_TASKS: TaskItem[] = [
  {
    key: AI_EDITOR_TASKS.IMPROVE_TITLE,
    labelKey: "ai.enhance.tasks.improve_title",
    defaultLabel: "Improve Title",
    target: "title",
    icon: Type,
  },
  {
    key: AI_EDITOR_TASKS.IMPROVE_DESCRIPTION,
    labelKey: "ai.enhance.tasks.improve_description",
    defaultLabel: "Improve Description",
    target: "description",
    icon: FileText,
  },
  {
    key: AI_EDITOR_TASKS.EXPAND_DESCRIPTION,
    labelKey: "ai.enhance.tasks.expand_description",
    defaultLabel: "Expand Description",
    target: "description",
    icon: Maximize2,
  },
  {
    key: AI_EDITOR_TASKS.SUMMARIZE,
    labelKey: "ai.enhance.tasks.summarize",
    defaultLabel: "Summarize",
    target: "description",
    icon: FileSearch,
  },
  {
    key: AI_EDITOR_TASKS.ADD_ACCEPTANCE_CRITERIA,
    labelKey: "ai.enhance.tasks.add_acceptance_criteria",
    defaultLabel: "Add Acceptance Criteria",
    target: "description",
    icon: CheckSquare,
  },
  {
    key: AI_EDITOR_TASKS.MAKE_CONCISE,
    labelKey: "ai.enhance.tasks.make_concise",
    defaultLabel: "Make Concise",
    target: "description",
    icon: Minimize2,
  },
];

const TONE_OPTIONS = [
  {
    key: "default",
    label: "Default",
    casual_score: 5,
    formal_score: 5,
  },
  {
    key: "professional",
    label: "💼 Professional",
    casual_score: 0,
    formal_score: 10,
  },
  {
    key: "casual",
    label: "😃 Casual",
    casual_score: 10,
    formal_score: 0,
  },
];

export function EnhanceWorkItemModal(props: EnhanceWorkItemProps) {
  const {
    isOpen,
    onClose,
    workspaceSlug,
    initialTitle,
    initialDescriptionHtml = "",
    onAcceptTitle,
    onAcceptDescription,
  } = props;

  const { t } = useTranslation();
  const [selectedTask, setSelectedTask] = useState<AI_EDITOR_TASKS | null>(null);
  const [selectedTone, setSelectedTone] = useState("default");
  const [loading, setLoading] = useState(false);
  const [generatedText, setGeneratedText] = useState<string | null>(null);
  const [generatedHtml, setGeneratedHtml] = useState<string | null>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const activeTaskConfig = ENHANCE_TASKS.find((task) => task.key === selectedTask);
  const isTargetTitle = activeTaskConfig?.target === "title";

  const executeEnhancement = async (taskKey: AI_EDITOR_TASKS, toneKey: string) => {
    setSelectedTask(taskKey);
    setLoading(true);
    setGeneratedText(null);
    setGeneratedHtml(null);

    const tone = TONE_OPTIONS.find((opt) => opt.key === toneKey) || TONE_OPTIONS[0];

    try {
      const res = await aiService.enhanceWorkItem(workspaceSlug, {
        task: taskKey,
        title: initialTitle,
        description: initialDescriptionHtml,
        casual_score: tone.casual_score,
        formal_score: tone.formal_score,
      });

      setGeneratedText(res.response);
      setGeneratedHtml(res.response_html);
      previewContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to enhance work item. Please try again.";
      setToast({
        type: TOAST_TYPE.ERROR,
        title: "Enhancement failed",
        message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTaskClick = (taskKey: AI_EDITOR_TASKS) => {
    executeEnhancement(taskKey, selectedTone);
  };

  const handleToneChange = (toneKey: string) => {
    setSelectedTone(toneKey);
    if (selectedTask) {
      executeEnhancement(selectedTask, toneKey);
    }
  };

  const handleAccept = () => {
    if (!generatedText && !generatedHtml) return;

    if (isTargetTitle && generatedText) {
      onAcceptTitle(generatedText.trim());
      setToast({
        type: TOAST_TYPE.SUCCESS,
        title: "Title updated",
        message: "Work item title has been enhanced.",
      });
    } else if (generatedHtml) {
      onAcceptDescription(generatedHtml);
      setToast({
        type: TOAST_TYPE.SUCCESS,
        title: "Description updated",
        message: "Work item description has been enhanced.",
      });
    }

    handleClose();
  };

  const handleClose = () => {
    setSelectedTask(null);
    setGeneratedText(null);
    setGeneratedHtml(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="animate-in fade-in zoom-in-95 flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-subtle bg-surface-1 shadow-overlay-200 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-subtle bg-surface-1 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-xl bg-accent-primary/10 text-accent-primary">
              <Sparkles className="size-4" />
            </span>
            <div>
              <h2 className="text-15 font-semibold text-primary">Improve with Keel AI</h2>
              <p className="text-12 text-tertiary">Select an action to enhance this work item</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="grid size-8 place-items-center rounded-lg text-tertiary transition-colors hover:bg-layer-1 hover:text-primary"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="grid max-h-[calc(85vh-140px)] min-h-[420px] grid-cols-12 divide-x divide-subtle overflow-hidden">
          {/* Left: Task List & Tones */}
          <div className="col-span-4 flex flex-col justify-between overflow-y-auto bg-surface-2/40 p-4">
            <div className="space-y-1.5">
              <p className="tracking-wider px-2 pb-1 text-11 font-semibold text-tertiary uppercase">Actions</p>
              {ENHANCE_TASKS.map((task) => {
                const Icon = task.icon;
                const isSelected = selectedTask === task.key;
                return (
                  <button
                    key={task.key}
                    type="button"
                    onClick={() => handleTaskClick(task.key)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-13 font-medium text-secondary transition-all",
                      "hover:bg-layer-1 hover:text-primary",
                      isSelected && "bg-accent-primary/10 font-semibold text-accent-primary shadow-raised-100"
                    )}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className={cn("size-4 shrink-0", isSelected ? "text-accent-primary" : "text-tertiary")} />
                      <span className="truncate">{t(task.labelKey, task.defaultLabel)}</span>
                    </div>
                    <ChevronRight
                      className={cn("size-3.5 shrink-0 opacity-40", isSelected && "text-accent-primary opacity-100")}
                    />
                  </button>
                );
              })}
            </div>

            {/* Tone Selector */}
            <div className="mt-4 border-t border-subtle pt-4">
              <div className="tracking-wider flex items-center gap-1.5 px-2 pb-2 text-11 font-semibold text-tertiary uppercase">
                <SlidersHorizontal className="size-3" />
                <span>Tone</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-xl border border-subtle bg-surface-1 p-1">
                {TONE_OPTIONS.map((tone) => (
                  <button
                    key={tone.key}
                    type="button"
                    onClick={() => handleToneChange(tone.key)}
                    className={cn(
                      "flex-1 rounded-lg py-1.5 text-11 font-medium text-secondary transition-all",
                      selectedTone === tone.key
                        ? "shadow-2xs bg-accent-primary/10 font-semibold text-accent-primary"
                        : "hover:bg-layer-1"
                    )}
                  >
                    {tone.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Before & After Preview */}
          <div
            ref={previewContainerRef}
            className="col-span-8 flex flex-col justify-between overflow-y-auto bg-surface-1 p-6"
          >
            {!selectedTask ? (
              <div className="flex h-full flex-col items-center justify-center py-12 text-center text-tertiary">
                <div className="mb-3 grid size-12 place-items-center rounded-2xl bg-layer-1 text-secondary">
                  <Sparkles className="size-6" />
                </div>
                <p className="text-14 font-medium text-secondary">Choose an action from the left</p>
                <p className="mt-1 max-w-sm text-12">
                  Keel AI will analyze the current content and generate an improved version for review.
                </p>
              </div>
            ) : loading ? (
              <div className="flex h-full flex-col items-center justify-center py-12 text-center">
                <RefreshCcw className="mb-3 size-7 animate-spin text-accent-primary" />
                <p className="text-13 font-medium text-primary">
                  {LOADING_TEXTS[selectedTask] || "Keel AI is writing"}...
                </p>
                <p className="mt-1 text-11 text-tertiary">
                  Applying {TONE_OPTIONS.find((t) => t.key === selectedTone)?.label} tone
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Before / After Sections */}
                <div>
                  <div className="flex items-center justify-between border-b border-subtle pb-2">
                    <span className="tracking-wider text-11 font-semibold text-tertiary uppercase">
                      Original {isTargetTitle ? "Title" : "Description"}
                    </span>
                  </div>
                  <div className="mt-2 max-h-32 overflow-x-auto rounded-xl border border-subtle/60 bg-surface-2/50 p-3 text-13 text-secondary">
                    {isTargetTitle ? (
                      <p className="font-medium text-primary">{initialTitle || <i>(No title)</i>}</p>
                    ) : (
                      <div
                        className="prose-sm dark:prose-invert max-w-none text-13 prose"
                        dangerouslySetInnerHTML={{ __html: initialDescriptionHtml || "<p><i>(No description)</i></p>" }}
                      />
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between border-b border-subtle pb-2">
                    <div className="flex items-center gap-2">
                      <span className="tracking-wider text-11 font-semibold text-accent-primary uppercase">
                        Improved by Keel AI
                      </span>
                      <span className="inline-flex items-center rounded-full bg-accent-primary/10 px-1.5 py-0.5 text-10 font-medium text-accent-primary">
                        Preview
                      </span>
                    </div>
                  </div>
                  <div className="border-accent-primary/20 mt-2 max-h-64 overflow-y-auto rounded-xl border bg-layer-1 p-4 text-13 text-primary shadow-raised-100">
                    {isTargetTitle ? (
                      <p className="text-14 leading-snug font-semibold text-primary">{generatedText}</p>
                    ) : (
                      <div
                        className="prose-sm dark:prose-invert max-w-none text-13 prose"
                        dangerouslySetInnerHTML={{ __html: generatedHtml || `<p>${generatedText}</p>` }}
                      />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-subtle bg-surface-2/40 px-6 py-3.5">
          <p className="text-11 text-tertiary">Changes will only apply when you click Accept.</p>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={handleClose}>
              <X className="mr-1 size-3.5" />
              Discard
            </Button>
            {selectedTask && (
              <Button
                variant="secondary"
                onClick={() => executeEnhancement(selectedTask, selectedTone)}
                disabled={loading}
              >
                <RefreshCcw className={cn("mr-1 size-3.5", loading && "animate-spin")} />
                Regenerate
              </Button>
            )}
            <Button variant="primary" onClick={handleAccept} disabled={loading || (!generatedText && !generatedHtml)}>
              <Check className="mr-1 size-3.5" />
              Accept
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
