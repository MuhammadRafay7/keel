/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

/**
 * The vars this package reads off `import.meta.env`.
 *
 * The bundler of whichever app imports these services inlines them at build
 * time. This package is not built by Vite and does not depend on it, so it
 * declares the shape it relies on rather than pulling in `vite/client`.
 */
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
