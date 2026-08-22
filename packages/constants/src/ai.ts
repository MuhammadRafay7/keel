/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

export enum AI_EDITOR_TASKS {
  ASK_ANYTHING = "ASK_ANYTHING",
  IMPROVE_TITLE = "IMPROVE_TITLE",
  IMPROVE_DESCRIPTION = "IMPROVE_DESCRIPTION",
  EXPAND_DESCRIPTION = "EXPAND_DESCRIPTION",
  SUMMARIZE = "SUMMARIZE",
  ADD_ACCEPTANCE_CRITERIA = "ADD_ACCEPTANCE_CRITERIA",
  MAKE_CONCISE = "MAKE_CONCISE",
}

export const LOADING_TEXTS = {
  [AI_EDITOR_TASKS.ASK_ANYTHING]: "Keel AI is generating a response",
  [AI_EDITOR_TASKS.IMPROVE_TITLE]: "Keel AI is improving the title",
  [AI_EDITOR_TASKS.IMPROVE_DESCRIPTION]: "Keel AI is improving the description",
  [AI_EDITOR_TASKS.EXPAND_DESCRIPTION]: "Keel AI is expanding the description",
  [AI_EDITOR_TASKS.SUMMARIZE]: "Keel AI is summarizing the work item",
  [AI_EDITOR_TASKS.ADD_ACCEPTANCE_CRITERIA]: "Keel AI is adding acceptance criteria",
  [AI_EDITOR_TASKS.MAKE_CONCISE]: "Keel AI is making the description concise",
} satisfies { [key in AI_EDITOR_TASKS]: string };
