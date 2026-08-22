import fs from "node:fs";
import path from "node:path";
import * as dotenv from "dotenv";
import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

dotenv.config({ path: path.resolve(__dirname, ".env") });

// Expose only vars starting with VITE_
const viteEnv = Object.keys(process.env)
  .filter((k) => k.startsWith("VITE_"))
  .reduce<Record<string, string>>((a, k) => {
    a[k] = process.env[k] ?? "";
    return a;
  }, {});

/**
 * In dev, resolve `@keel/*` workspace packages to their TypeScript sources
 * instead of their built `dist/`.
 *
 * Two reasons, one of them a real bug:
 *
 *  1. `turbo.json` gives `check:types` (and `dev`) `dependsOn: ["^build"]`, so
 *     running `pnpm check` rebuilds every upstream `dist/`. A dev server that is
 *     already holding those files in its SSR module graph then fails with
 *     "Failed to load url .../dist/index.js. Does the file exist?" and serves a
 *     500 — the page stops at its HydrateFallback skeleton and never recovers.
 *     Taking `dist/` out of the dev path entirely removes that failure mode.
 *  2. Editing a component in `@keel/propel` or `@keel/ui` currently requires a
 *     package rebuild before the app sees it. Pointing at source gives HMR.
 *
 * The aliases are derived from each package's own `exports` map rather than
 * hand-listed, so a new subpath export is picked up automatically and a stale
 * hand-written list can never drift. An entry is only rewritten when the
 * corresponding source file actually exists on disk; anything else falls
 * through to normal node resolution.
 *
 * Dev only. Production builds resolve through `exports` to `dist/` as published.
 */
function workspaceSourceAliases(): { find: RegExp; replacement: string }[] {
  const packagesDir = path.resolve(__dirname, "../../packages");
  const aliases: { find: RegExp; replacement: string }[] = [];
  if (!fs.existsSync(packagesDir)) return aliases;

  const escape = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  for (const dir of fs.readdirSync(packagesDir)) {
    const pkgPath = path.join(packagesDir, dir, "package.json");
    if (!fs.existsSync(pkgPath)) continue;

    let pkg: { name?: string; exports?: Record<string, unknown> };
    try {
      pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    } catch {
      continue;
    }
    if (!pkg.name?.startsWith("@keel/") || !pkg.exports) continue;

    for (const [subpath, target] of Object.entries(pkg.exports)) {
      if (typeof target !== "string" || !target.startsWith("./dist/")) continue;

      // ./dist/button/index.js -> src/button/index.{ts,tsx}
      // ./dist/index.mjs       -> src/index.{ts,tsx}
      // ./dist/styles/x.css    -> src/styles/x.css
      const rest = target.slice("./dist/".length);
      const candidates = rest.endsWith(".css")
        ? [rest]
        : [".ts", ".tsx"].map((ext) => rest.replace(/\.(m|c)?js$/, ext));

      const hit = candidates
        .map((candidate) => path.join(packagesDir, dir, "src", candidate))
        .find((candidate) => fs.existsSync(candidate));
      if (!hit) continue;

      const specifier = subpath === "." ? pkg.name : `${pkg.name}/${subpath.slice(2)}`;
      aliases.push({ find: new RegExp(`^${escape(specifier)}$`), replacement: hit });
    }
  }
  return aliases;
}

export default defineConfig(({ command }) => ({
  define: {
    "process.env": JSON.stringify(viteEnv),
  },
  build: {
    assetsInlineLimit: 0,
    // Without maps, every production stack trace names a minified chunk and a
    // column number, which is unreadable. There is no error tracking yet, so
    // these maps are the only way an error reported from production can be
    // traced back to a line. The repository is public, so they reveal nothing
    // the source does not.
    sourcemap: true,
  },
  plugins: [reactRouter(), tsconfigPaths({ projects: [path.resolve(__dirname, "tsconfig.json")] })],
  resolve: {
    alias: [
      // Next.js compatibility shims used within web
      { find: /^next\/link$/, replacement: path.resolve(__dirname, "app/compat/next/link.tsx") },
      { find: /^next\/navigation$/, replacement: path.resolve(__dirname, "app/compat/next/navigation.ts") },
      { find: /^next\/script$/, replacement: path.resolve(__dirname, "app/compat/next/script.tsx") },
      // Source resolution for workspace packages — dev only. See the note above.
      ...(command === "serve" ? workspaceSourceAliases() : []),
    ],
    dedupe: ["react", "react-dom", "@headlessui/react"],
  },
  server: {
    host: "127.0.0.1",
  },
  // No SSR-specific overrides needed; alias resolves to ESM build
}));
