# Keel Supabase Edge Functions

This directory contains server-side Supabase Edge Functions powering Keel's server-executed capabilities, including AI proxies and transactional email invitations.

---

## Directory Structure

```
supabase/
  functions/
    _shared/             # Shared helpers, types, and CORS handlers
      auth.ts            # JWT authentication helper (requireAuth)
      cors.ts            # Standard CORS headers & preflight handler
      types.ts           # Shared TypeScript interfaces & model allow-lists
    ai-proxy/            # Vertical slice: AI Proxy Edge Function
      index.ts           # Server entrypoint with system prompt, DB rate limiting, key decryption
      adapters/          # Provider adapters extension point
        types.ts         # AIProviderAdapter interface
        openai.ts        # OpenAI streaming adapter
    send-workspace-invite/ # Vertical slice: Transactional Email Invitations Edge Function
    send-notification-email/ # Vertical slice: Notification Emails Edge Function
      index.ts           # Server entrypoint for Resend invitation dispatch, HTML escaping, and status updates
    README.md            # This guide
```

---

## Edge Functions Overview

### 1. `ai-proxy`

- **Purpose**: Proxies requests to AI providers (e.g. OpenAI) using the user's encrypted API key.
- **Security**: Verifies JWT authentication, enforces server-side system prompts, validates models against an allow-list, enforces per-user DB rate limits (`check_ai_rate_limit`), and logs usage in `ai_usage_logs`.
- **Environment Variables**:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `ENCRYPTION_SECRET` / `JWT_SECRET` (configured in Postgres GUC `app.settings.encryption_secret` / `app.settings.jwt_secret`)

### 2. `send-workspace-invite`

- **Purpose**: Sends transactional workspace invitation emails via Resend API when invoked directly or via `pg_net` Postgres trigger.
- **Security**: Verifies Authorization token against Service Role Key, Anon Key, or authenticated User JWT. Escapes HTML inputs (`escapeHtml`) to prevent HTML injection attacks.
- **Fault Tolerance**: On send failure, updates `workspace_member_invites.send_status = 'failed'` and logs `send_error` without deleting the invitation row. On success, marks `send_status = 'sent'`.
- **Environment Variables**:
  - `RESEND_API_KEY` (Required for Resend API dispatch)
  - `RESEND_FROM_EMAIL` (Optional sender email, defaults to `Keel Invitations <onboarding@resend.dev>`)
  - `SITE_URL` / `APP_URL` (Frontend URL base for invitation link)
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`

### 3. `send-notification-email`

- **Purpose**: Emails a single notification row. Invoked by the `on_notification_send_email` trigger (migration 0017) through `pg_net` for every row inserted into `public.notifications`.
- **Why the decision lives here**: whether a notification should be emailed depends on the recipient's `user_notification_preferences` and on their address — both need the same round trip, so the trigger stays ignorant of what is mailable and this function decides.
- **Skips, not failures**: a preference that is turned off, a user with no email, and a deactivated account all return `200` with a `skipped` reason. Only a genuine send failure returns `500`.
- **Entity → preference mapping**: `issue_mention`/`chat_mention` → `mention`, `issue_comment` → `comment`, `issue_assigned` → `property_change`, `issue_completed` → `issue_completed`, `issue_state` → `state_change`. A missing preferences row means defaults, and the defaults are on.
- **Environment Variables**:
  - `RESEND_API_KEY` (Required)
  - `RESEND_FROM_EMAIL` (Optional, defaults to `Keel <onboarding@resend.dev>`)
  - `SITE_URL` / `APP_URL` (Frontend URL base for the deep link)
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`

---

## Database settings the email triggers require

Both email triggers dispatch through `pg_net`, and both read the target URL and key from `public.app_settings`. Without those rows the triggers run, find no target, and return quietly — no error, no email.

They originally read Postgres GUCs via `current_setting`, which cannot work on Supabase: setting one needs `ALTER DATABASE ... SET`, and the `postgres` role is not a superuser, so the statement is refused with `permission denied to set parameter`. Migration 0018 moved them into a table, which ordinary DML can write.

**In production these are set for you.** The `Deploy Supabase` workflow upserts them on every deploy, reading the anon key from the project itself via `supabase projects api-keys` rather than from a secret — so a fresh project or a rotated key cannot leave the triggers unconfigured, and there is no extra secret to keep in sync.

For a local stack, either insert the rows or set the GUCs — `app_setting()` falls back to `current_setting` when the table has no row, and a local Postgres does allow `ALTER DATABASE`:

```sql
insert into public.app_settings (key, value) values
  ('supabase_url', 'http://127.0.0.1:54321'),
  ('supabase_anon_key', '<local-anon-key>')
on conflict (key) do update set value = excluded.value;
```

Verify a trigger actually dispatched:

```sql
select id, url, created, status_code
from net._http_response
order by created desc
limit 10;
```

---

## Local Development & Testing Story

### 1. Prerequisites

Make sure the [Supabase CLI](https://supabase.com/docs/guides/cli) is installed and Docker is running.

```bash
# Install Supabase CLI (if not installed)
npm i -g supabase
```

### 2. Start Local Supabase Stack

From the workspace root:

```bash
# Start local Supabase containers (Postgres, Auth, Storage, Edge Runtime)
npx supabase start
```

This outputs local service keys and API URLs, including `SUPABASE_URL` (`http://127.0.0.1:54321`) and `SUPABASE_ANON_KEY`.

### 3. Apply Migrations Locally

```bash
# Apply database migrations including 0013_transactional_email_invitations.sql and 0014_user_ai_keys.sql
npx supabase db reset
```

### 4. Serve Edge Functions Locally

Run the Edge Function server with environment variables:

```bash
# Serve all Edge Functions locally
npx supabase functions serve --env-file ./supabase/.env.local
```

Example `./supabase/.env.local`:

```env
RESEND_API_KEY=re_123456789
RESEND_FROM_EMAIL=onboarding@resend.dev
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_ANON_KEY=your-local-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-local-service-role-key
```

### 5. Testing the Edge Functions

#### Testing `ai-proxy`:

```bash
JWT_TOKEN="your_user_jwt_access_token"

curl -i -X POST 'http://127.0.0.1:54321/functions/v1/ai-proxy' \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Summarize this issue: fix navigation bar overflow on mobile.",
    "model": "gpt-4o-mini"
  }'
```

#### Testing `send-workspace-invite`:

```bash
curl -i -X POST 'http://127.0.0.1:54321/functions/v1/send-workspace-invite' \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "invitation_id": "invitation-uuid-here",
    "email": "user@example.com",
    "token": "token123",
    "workspace_slug": "acme",
    "workspace_name": "Acme Corp",
    "inviter_name": "Alice"
  }'
```

#### Testing `send-notification-email`:

```bash
curl -i -X POST 'http://127.0.0.1:54321/functions/v1/send-notification-email' \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{ "notification_id": "notification-uuid-here" }'
```

To test the whole path rather than the function alone, post a comment that mentions
someone: the `on_issue_comment_notify` trigger raises the notification, and
`on_notification_send_email` hands it to this function.
