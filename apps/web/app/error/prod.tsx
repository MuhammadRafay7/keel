/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useTheme } from "next-themes";
import { isRouteErrorResponse } from "react-router";
// keel imports
import { Button } from "@keel/propel/button";
// assets
import maintenanceModeDarkModeImage from "@/app/assets/instance/maintenance-mode-dark.svg?url";
import maintenanceModeLightModeImage from "@/app/assets/instance/maintenance-mode-light.svg?url";
// layouts
import DefaultLayout from "@/layouts/default-layout";

const linkMap = [
  {
    key: "mail_to",
    label: "Contact Support",
    value: "mailto:support@ostenmark.com",
  },
  {
    key: "status",
    label: "Status Page",
    value: "https://keel.ostenmark.com",
  },
  {
    key: "twitter_handle",
    label: "@ostenmark",
    value: "https://x.com/planepowers",
  },
];

/**
 * The message and stack, when there is one to show.
 *
 * There is no error tracking in production, so an error that reaches this page
 * leaves no trace anywhere. Until that exists, the page itself is the only
 * report: it stays a friendly wall by default and keeps the detail one click
 * away, which is the difference between "a lot of pages are broken" and knowing
 * which call broke them.
 */
function errorDetail(error: unknown): string | undefined {
  if (isRouteErrorResponse(error)) return `${error.status} ${error.statusText}\n${String(error.data ?? "")}`.trim();
  if (error instanceof Error) return [error.message, error.stack].filter(Boolean).join("\n\n");
  if (error === undefined || error === null) return undefined;
  return String(error);
}

// Production Error Component
interface ProdErrorComponentProps {
  error?: unknown;
  onGoHome: () => void;
}

export function ProdErrorComponent({ error, onGoHome }: ProdErrorComponentProps) {
  // hooks
  const { resolvedTheme } = useTheme();

  // derived values
  const detail = errorDetail(error);

  // derived values
  const maintenanceModeImage = resolvedTheme === "dark" ? maintenanceModeDarkModeImage : maintenanceModeLightModeImage;

  return (
    <DefaultLayout>
      <div className="relative container mx-auto flex h-full w-full max-w-xl flex-col items-center justify-center gap-2 gap-y-6 bg-surface-1 px-6 text-center">
        <div className="relative w-full">
          <img
            src={maintenanceModeImage}
            height="176"
            width="288"
            alt="ProjectSettingImg"
            className="h-full w-full object-fill object-center"
          />
        </div>
        <div className="relative mt-4 flex w-full flex-col gap-4">
          <div className="flex flex-col gap-2.5">
            <h1 className="text-left text-18 font-semibold text-primary">&#x1F6A7; Looks like something went wrong!</h1>
            <span className="text-left text-14 font-medium text-secondary">
              We track these errors automatically and working on getting things back up and running. If the problem
              persists feel free to contact us. In the meantime, try refreshing.
            </span>
          </div>

          <div className="mt-1 flex items-center justify-start gap-6">
            {linkMap.map((link) => (
              <div key={link.key}>
                <a
                  href={link.value}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-13 text-accent-primary hover:underline"
                >
                  {link.label}
                </a>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-start gap-6">
            <Button variant="primary" size="lg" onClick={onGoHome}>
              Go to home
            </Button>
          </div>

          {detail && (
            <details className="text-left">
              <summary className="cursor-pointer text-13 text-tertiary hover:text-secondary">Technical details</summary>
              <div className="mt-2 max-h-64 overflow-auto rounded-md border border-subtle bg-layer-1">
                <pre className="p-4 font-code text-11 break-words whitespace-pre-wrap text-secondary">{detail}</pre>
              </div>
            </details>
          )}
        </div>
      </div>
    </DefaultLayout>
  );
}
