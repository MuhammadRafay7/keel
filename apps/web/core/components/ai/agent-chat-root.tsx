/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { EIssuesStoreType } from "@keel/types";
import { useIssues } from "@/hooks/store/use-issues";
import { useProject } from "@/hooks/store/use-project";
import { AgentChatPanel } from "./agent-chat-panel";

/**
 * The event the top navigation's AI button fires to open the panel.
 *
 * A window event rather than a React context because the trigger and the panel
 * sit in different branches of the tree — the button is inside the workspace
 * navigation, the panel is mounted at the root so it can overlay everything.
 * Threading a provider between them would mean touching every layout in
 * between to carry state that only two components care about.
 */
export const AGENT_CHAT_TOGGLE_EVENT = "keel:toggle-agent-chat";

export const toggleAgentChat = () => window.dispatchEvent(new CustomEvent(AGENT_CHAT_TOGGLE_EVENT));

export function AgentChatRoot() {
  const [isOpen, setIsOpen] = useState(false);
  const params = useParams();
  const workspaceSlug = params?.workspaceSlug?.toString();
  const projectId = params?.projectId?.toString();

  const {
    issues: { fetchIssuesWithExistingPagination },
  } = useIssues(EIssuesStoreType.PROJECT);
  const { currentProjectDetails } = useProject();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "j") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    const handleToggle = () => setIsOpen((prev) => !prev);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener(AGENT_CHAT_TOGGLE_EVENT, handleToggle);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener(AGENT_CHAT_TOGGLE_EVENT, handleToggle);
    };
  }, []);

  /*
   * No workspace means no signed-in session, so there is nothing for the agent
   * to act on. It used to mount unconditionally at the root, which put a "Keel
   * AI" affordance on the sign-in and onboarding screens — offering an
   * assistant to someone who has not logged in yet.
   */
  if (!workspaceSlug) return null;

  const handleDataMutated = () => {
    if (workspaceSlug && projectId) {
      fetchIssuesWithExistingPagination(workspaceSlug, projectId, "mutation");
    }
  };

  return (
    <AgentChatPanel
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      workspaceSlug={workspaceSlug}
      projectId={projectId}
      projectName={currentProjectDetails?.name}
      onDataMutated={handleDataMutated}
    />
  );
}
