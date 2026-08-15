/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

/**
 * Loading indicator built from the Keel mark — the ribs pulse in sequence along
 * the keel line. Drawn in `currentColor` so it needs no light/dark variants.
 */
export function LogoSpinner() {
  return (
    <div className="flex items-center justify-center">
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Loading"
        className="h-6 w-auto sm:h-11"
      >
        <style>{`
          @keyframes keel-rib-pulse {
            0%, 100% { opacity: 0.2; }
            50% { opacity: 1; }
          }
          .keel-rib { animation: keel-rib-pulse 1.2s ease-in-out infinite; }
          .keel-rib-2 { animation-delay: 0.15s; }
          .keel-rib-3 { animation-delay: 0.3s; }
          @media (prefers-reduced-motion: reduce) {
            .keel-rib { animation: none; opacity: 1; }
          }
        `}</style>
        <path d="M14 7V41" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" />
        <path className="keel-rib" d="M14 15H33" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" />
        <path
          className="keel-rib keel-rib-2"
          d="M14 24H41"
          stroke="currentColor"
          strokeWidth="5.5"
          strokeLinecap="round"
        />
        <path
          className="keel-rib keel-rib-3"
          d="M14 33H27"
          stroke="currentColor"
          strokeWidth="5.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
