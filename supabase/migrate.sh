#!/usr/bin/env bash
#
# Run Supabase migrations against the live project.
#
#   ./supabase/migrate.sh list      # what is applied vs. pending (default)
#   ./supabase/migrate.sh push      # apply everything pending
#   ./supabase/migrate.sh dry-run   # show what push would do, change nothing
#
# Credentials come from supabase/.env.local, which is gitignored. The Supabase
# CLI is fetched by npx, so nothing has to be installed globally.
#
# This talks to PRODUCTION. There is no staging project. `push` is the only
# subcommand here that writes.

set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

ENV_FILE="supabase/.env.local"

if [ ! -f "$ENV_FILE" ]; then
  echo "Missing $ENV_FILE — it holds SUPABASE_DB_URL and is gitignored, so a" >&2
  echo "fresh clone will not have it. Copy it from a machine that does, or" >&2
  echo "rebuild it from the database password in the Supabase dashboard." >&2
  exit 1
fi

# shellcheck disable=SC1090
set -a; . "$ENV_FILE"; set +a

: "${SUPABASE_DB_URL:?SUPABASE_DB_URL is not set in '"$ENV_FILE"'}"

case "${1:-list}" in
  list)    args=(migration list) ;;
  push)    args=(db push) ;;
  dry-run) args=(db push --dry-run) ;;
  *)
    echo "Unknown command: $1 (expected: list, push, dry-run)" >&2
    exit 1
    ;;
esac

# --yes so a missing CLI installs without prompting; 2>&1 through grep because
# npx prints a wall of pnpm-config warnings that bury the actual output.
npx --yes supabase@latest "${args[@]}" --db-url "$SUPABASE_DB_URL" 2>&1 \
  | grep -v '^npm warn'
