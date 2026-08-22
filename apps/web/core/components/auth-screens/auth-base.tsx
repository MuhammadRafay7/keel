/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import React from "react";
import { AuthRoot } from "@/components/account/auth-forms/auth-root";
import type { EAuthModes } from "@/helpers/authentication.helper";
import { AuthFooter } from "./footer";
import { AuthHeader } from "./header";

type AuthBaseProps = {
  authType: EAuthModes;
};

/**
 * The signed-out shell.
 *
 * This was the least-designed surface in the product: a bare form on a flat
 * ground, with the eye given nothing to land on. It now gets the same material
 * as the rest of the app — a tinted canvas, a soft accent wash behind the
 * content, and the form itself lifted onto a glass card so it reads as an
 * object rather than as text that happens to be centred.
 *
 * The wash is drawn with two radial gradients rather than an image so it
 * re-tints for free when the user picks a different accent, and costs nothing
 * to load on the first screen anyone sees.
 */
export function AuthBase({ authType }: AuthBaseProps) {
  return (
    <div className="relative z-10 flex h-screen w-screen flex-col items-center overflow-hidden overflow-y-auto bg-canvas px-8 pt-6 pb-10">
      {/* Accent wash. Decorative and inert — never intercepts a click. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60rem 40rem at 50% -10%, color-mix(in srgb, var(--brand-default) 14%, transparent), transparent 70%), " +
            "radial-gradient(40rem 30rem at 85% 110%, color-mix(in srgb, var(--brand-default) 10%, transparent), transparent 70%)",
        }}
      />

      <AuthHeader type={authType} />

      <div className="flex w-full flex-grow items-center justify-center">
        <div className="w-full max-w-[26rem] rounded-2xl border border-subtle bg-surface-1 px-7 py-8 shadow-overlay-100">
          <AuthRoot authMode={authType} />
        </div>
      </div>

      <AuthFooter />
    </div>
  );
}
