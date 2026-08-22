import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Sparkles } from "lucide-react";
import { useIssues } from "@/hooks/store/use-issues";
import { useProject } from "@/hooks/store/use-project";
import { AgentChatPanel } from "./agent-chat-panel";

export function AgentChatFloatingToggle() {
  const [isOpen, setIsOpen] = useState(false);
  const params = useParams();
  const workspaceSlug = params?.workspaceSlug?.toString();
  const projectId = params?.projectId?.toString();

  const { fetchIssues } = useIssues();
  const { currentProjectDetails } = useProject();

  // Keyboard shortcut: Cmd/Ctrl + Shift + A or Cmd + J to toggle Keel AI Agent
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "j") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleDataMutated = () => {
    if (workspaceSlug && projectId) {
      fetchIssues(workspaceSlug, projectId);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="border-accent-primary/30 shadow-lg hover:border-accent-primary fixed right-5 bottom-5 z-40 flex items-center gap-2 rounded-full border bg-surface-1/90 px-3.5 py-2 text-12 font-medium text-primary backdrop-blur-xl transition-all duration-200 hover:bg-accent-primary/10 hover:text-accent-primary"
        title="Open Keel AI Agent (Cmd+J)"
      >
        <span className="shadow-2xs grid size-5 place-items-center rounded-full bg-accent-primary text-white">
          <Sparkles className="size-3" />
        </span>
        <span className="font-semibold">Keel AI</span>
        <kbd className="font-mono hidden rounded border border-subtle bg-surface-2 px-1 py-0.5 text-10 text-tertiary sm:inline-block">
          ⌘J
        </kbd>
      </button>

      <AgentChatPanel
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        workspaceSlug={workspaceSlug}
        projectId={projectId}
        projectName={currentProjectDetails?.name}
        onDataMutated={handleDataMutated}
      />
    </>
  );
}
