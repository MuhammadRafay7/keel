#!/usr/bin/env bash
#
# Vercel build command for Keel.
#
# Runs database migrations during deployment if targeting production and database
# credentials are provided in the environment (matching the Occuin deployment model).
#
# Migrations run when:
#   1. VERCEL_ENV=production (or MIGRATE_ON_BUILD=1)
#   2. SUPABASE_DB_URL or DATABASE_URL is set in environment
#
# In preview environments or when database credentials are unset, migrations are
# skipped so previews cannot mutate the live database.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

BUILD_CMD="${BUILD_CMD:-pnpm turbo run build --filter=web}"
MIGRATE_CMD="${MIGRATE_CMD:-./supabase/migrate.sh push}"

DB_URL="${SUPABASE_DB_URL:-${DATABASE_URL:-}}"
IS_PROD_ENV=false

if [ "${VERCEL_ENV:-}" = "production" ] || [ "${MIGRATE_ON_BUILD:-0}" = "1" ]; then
  IS_PROD_ENV=true
fi

if [ "$IS_PROD_ENV" = true ] && [ -n "$DB_URL" ]; then
  echo "[build] Applying Supabase migrations before build..."
  $MIGRATE_CMD
elif [ "$IS_PROD_ENV" = true ] && [ -z "$DB_URL" ]; then
  echo "[build] VERCEL_ENV=production but SUPABASE_DB_URL / DATABASE_URL is not set; skipping database migrations."
else
  echo "[build] VERCEL_ENV=${VERCEL_ENV:-unset} — skipping database migrations."
fi

echo "[build] Running build command: $BUILD_CMD"
$BUILD_CMD
