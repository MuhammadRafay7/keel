/**
 * Sends one notification as an email.
 *
 * Called by the trigger in migration 0017 for every notification row. The
 * decision about whether an email should actually go out lives here rather
 * than in the trigger: the per-user preference and the address lookup both
 * need the same round trip, and keeping them together means the database does
 * not have to know anything about what is or is not mailable.
 *
 * Returning 200 with `skipped` is the normal outcome for a notification the
 * recipient has turned off. That is not a failure, and pg_net should not see
 * it as one.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

interface NotificationPayload {
  notification_id: string;
}

/** Which preference column governs which notification kind. */
const PREFERENCE_BY_ENTITY: Record<string, string> = {
  issue_mention: "mention",
  chat_mention: "mention",
  issue_comment: "comment",
  issue_assigned: "property_change",
  issue_completed: "issue_completed",
  issue_state: "state_change",
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/** Strips the editor's markup down to something safe to put in an email. */
function toPlainText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function renderEmail(input: { title: string; body: string; link: string; workspaceName: string }): {
  html: string;
  text: string;
} {
  const title = escapeHtml(input.title);
  const body = escapeHtml(input.body);
  const link = escapeHtml(input.link);
  const workspace = escapeHtml(input.workspaceName);

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f4f5; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#18181b;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f4f4f5; padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:560px; background-color:#ffffff; border-radius:8px; border:1px solid #e4e4e7; padding:40px; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
          <tr>
            <td>
              <p style="margin:0 0 8px 0; font-size:12px; font-weight:600; letter-spacing:0.06em; text-transform:uppercase; color:#a1a1aa;">
                ${workspace}
              </p>
              <h1 style="margin:0 0 16px 0; font-size:22px; font-weight:700; color:#09090b; letter-spacing:-0.02em;">
                ${title}
              </h1>
              <div style="margin:0 0 24px 0; padding:16px; background-color:#f8fafc; border-left:4px solid #0f172a; border-radius:4px; font-size:14px; line-height:22px; color:#334155; white-space:pre-wrap;">${body}</div>
              <div style="margin:28px 0;">
                <a href="${link}" target="_blank" style="display:inline-block; background-color:#09090b; color:#ffffff; font-weight:600; font-size:15px; text-decoration:none; padding:12px 28px; border-radius:6px;">
                  Open in Keel
                </a>
              </div>
              <hr style="margin:32px 0 24px 0; border:none; border-top:1px solid #e4e4e7;">
              <p style="margin:0; font-size:12px; line-height:18px; color:#a1a1aa;">
                You are receiving this because of your notification settings in Keel.
                You can change them under Settings &rarr; Notifications.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const text = `${input.title}\n\n${input.body}\n\nOpen in Keel: ${input.link}`;

  return { html, text };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ error: "Missing Authorization header" }, 401);

  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");

  if (!token || (token !== anonKey && token !== serviceKey)) {
    return json({ error: "Unauthorized" }, 401);
  }

  if (!supabaseUrl || !serviceKey) {
    return json({ error: "Function is not configured with Supabase credentials." }, 500);
  }

  try {
    const payload: NotificationPayload = await req.json();
    if (!payload?.notification_id) return json({ error: "Missing notification_id" }, 400);

    const admin = createClient(supabaseUrl, serviceKey);

    const { data: notification, error } = await admin
      .from("notifications")
      .select(
        "id, title, message, message_html, entity_name, entity_identifier, receiver_id, " +
          "workspace_id, project_id, data"
      )
      .eq("id", payload.notification_id)
      .maybeSingle();

    if (error) return json({ error: error.message }, 500);
    if (!notification) return json({ error: "That notification no longer exists." }, 404);

    // Does this person want this kind of email?
    const preferenceColumn = PREFERENCE_BY_ENTITY[notification.entity_name] ?? "comment";

    const { data: preferences } = await admin
      .from("user_notification_preferences")
      .select("*")
      .eq("user_id", notification.receiver_id)
      .maybeSingle();

    // No row means defaults, and the defaults are on.
    if (preferences && preferences[preferenceColumn] === false) {
      return json({ skipped: "preference_off", preference: preferenceColumn });
    }

    const { data: receiver } = await admin
      .from("users")
      .select("email, is_active")
      .eq("id", notification.receiver_id)
      .maybeSingle();

    if (!receiver?.email) return json({ skipped: "no_email" });
    if (receiver.is_active === false) return json({ skipped: "inactive_user" });

    const { data: workspace } = await admin
      .from("workspaces")
      .select("slug, name")
      .eq("id", notification.workspace_id)
      .maybeSingle();

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) return json({ error: "RESEND_API_KEY is not configured." }, 500);

    const appUrl = Deno.env.get("SITE_URL") || Deno.env.get("APP_URL") || "https://keel.ostenmark.com";
    const slug = workspace?.slug ?? "";

    // Chat lands on the channel; everything else lands on the work item.
    const link =
      notification.entity_name === "chat_mention"
        ? `${appUrl}/${slug}/projects/${notification.project_id}/issues/`
        : `${appUrl}/${slug}/projects/${notification.project_id}/issues/${notification.entity_identifier}/`;

    const body = notification.message_html ? toPlainText(notification.message_html) : (notification.message ?? "");

    const { html, text } = renderEmail({
      title: notification.title ?? "New activity in Keel",
      body,
      link,
      workspaceName: workspace?.name ?? "Keel",
    });

    const from = Deno.env.get("RESEND_FROM_EMAIL") || "Keel <onboarding@resend.dev>";

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [receiver.email],
        subject: notification.title ?? "New activity in Keel",
        html,
        text,
      }),
    });

    const resData = await resendRes.json();

    if (!resendRes.ok) {
      console.error("Resend rejected the notification email:", resData);
      return json({ error: "Failed to send email.", details: resData }, 500);
    }

    return json({ success: true, id: resData.id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Unhandled error in send-notification-email:", message);
    return json({ error: message }, 500);
  }
});
