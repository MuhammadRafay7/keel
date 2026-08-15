import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { requireAuth } from "../_shared/auth.ts";
import { corsHeaders } from "../_shared/cors.ts";

interface InvitePayload {
  invitation_id: string;
  email?: string;
  token?: string;
  workspace_slug?: string;
  workspace_name?: string;
  inviter_name?: string;
  message?: string;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Authentication check: verify token against Service Role Key, Anon Key, or User JWT
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!token) {
    return new Response(JSON.stringify({ error: "Invalid Authorization token" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (token !== supabaseAnonKey && token !== supabaseServiceKey) {
    try {
      await requireAuth(req);
    } catch (errRes) {
      if (errRes instanceof Response) return errRes;
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  try {
    const payload: InvitePayload = await req.json();
    let { invitation_id, email, token: inviteToken, workspace_slug, workspace_name, inviter_name, message } = payload;

    if (!invitation_id) {
      return new Response(JSON.stringify({ error: "Missing invitation_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    let supabaseAdmin = null;
    if (supabaseUrl && supabaseServiceKey) {
      supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    }

    // Fetch missing details from Supabase if necessary using column hint !created_by_id
    if (supabaseAdmin && (!email || !inviteToken || !workspace_slug || !workspace_name)) {
      const { data: inviteRow, error: inviteErr } = await supabaseAdmin
        .from("workspace_member_invites")
        .select(
          "*, workspace:workspaces(name, slug), inviter:users!created_by_id(display_name, first_name, last_name, email)"
        )
        .eq("id", invitation_id)
        .single();

      if (!inviteErr && inviteRow) {
        email ||= inviteRow.email;
        inviteToken ||= inviteRow.token;
        message ||= inviteRow.message;
        if (inviteRow.workspace) {
          workspace_name ||= inviteRow.workspace.name;
          workspace_slug ||= inviteRow.workspace.slug;
        }
        if (inviteRow.inviter) {
          const u = inviteRow.inviter;
          inviter_name ||= u.display_name || [u.first_name, u.last_name].filter(Boolean).join(" ") || u.email;
        }
      }
    }

    if (!email || !inviteToken || !workspace_slug) {
      return new Response(JSON.stringify({ error: "Insufficient invitation metadata to send email" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      if (supabaseAdmin) {
        await supabaseAdmin
          .from("workspace_member_invites")
          .update({ send_status: "failed", send_error: "RESEND_API_KEY is not configured in function environment." })
          .eq("id", invitation_id);
      }
      return new Response(
        JSON.stringify({
          error: "RESEND_API_KEY is not configured in function environment. Invitation marked as failed.",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const appUrl = Deno.env.get("SITE_URL") || Deno.env.get("APP_URL") || "https://keel.ostenmark.com";
    const rawInviteLink = `${appUrl}/workspace-invitations/?invitation_id=${invitation_id}&slug=${encodeURIComponent(workspace_slug)}&token=${encodeURIComponent(inviteToken)}&email=${encodeURIComponent(email)}`;
    const inviteLink = escapeHtml(rawInviteLink);

    const rawInviter = inviter_name || "A teammate";
    const rawWorkspace = workspace_name || workspace_slug;

    const inviterDisplay = escapeHtml(rawInviter);
    const workspaceDisplay = escapeHtml(rawWorkspace);
    const safeEmail = escapeHtml(email);
    const safeMessage = message ? escapeHtml(message) : "";

    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invitation to join ${workspaceDisplay} on Keel</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f4f5; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#18181b;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f4f4f5; padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="560" border="0" cellspacing="0" cellpadding="0" style="max-width:560px; background-color:#ffffff; border-radius:8px; border:1px solid #e4e4e7; padding:40px; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
          <tr>
            <td>
              <h1 style="margin:0 0 16px 0; font-size:24px; font-weight:700; color:#09090b; letter-spacing:-0.02em;">
                Join ${workspaceDisplay} on Keel
              </h1>
              <p style="margin:0 0 20px 0; font-size:16px; line-height:24px; color:#3f3f46;">
                <strong>${inviterDisplay}</strong> has invited you to collaborate in the <strong>${workspaceDisplay}</strong> workspace on Keel.
              </p>
              ${
                safeMessage
                  ? `<div style="margin:0 0 24px 0; padding:16px; background-color:#f8fafc; border-left:4px solid #0f172a; border-radius:4px; font-size:14px; line-height:20px; color:#334155; font-style:italic;">
                      "${safeMessage}"
                     </div>`
                  : ""
              }
              <div style="margin:28px 0;">
                <a href="${inviteLink}" target="_blank" style="display:inline-block; background-color:#09090b; color:#ffffff; font-weight:600; font-size:15px; text-decoration:none; padding:12px 28px; border-radius:6px; text-align:center;">
                  Accept Invitation
                </a>
              </div>
              <p style="margin:24px 0 0 0; font-size:13px; line-height:20px; color:#71717a; word-break:break-all;">
                Or copy and paste this link into your browser:<br>
                <a href="${inviteLink}" style="color:#2563eb; text-decoration:underline;">${inviteLink}</a>
              </p>
              <hr style="margin:32px 0 24px 0; border:none; border-top:1px solid #e4e4e7;">
              <p style="margin:0; font-size:12px; line-height:18px; color:#a1a1aa;">
                This invitation was sent to ${safeEmail}. If you were not expecting this invitation, you can safely ignore this email.
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

    const textBody = `
Join ${rawWorkspace} on Keel

${rawInviter} has invited you to collaborate in the ${rawWorkspace} workspace on Keel.

${message ? `Message: "${message}"\n\n` : ""}Accept your invitation by opening the following link in your browser:
${rawInviteLink}

This invitation was sent to ${email}. If you were not expecting this, you can safely ignore this email.
    `.trim();

    const fromEmail = Deno.env.get("RESEND_FROM_EMAIL") || "Keel Invitations <onboarding@resend.dev>";

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [email],
        subject: `${rawInviter} invited you to join ${rawWorkspace} on Keel`,
        html: htmlBody,
        text: textBody,
      }),
    });

    const resData = await resendRes.json();

    if (!resendRes.ok) {
      console.error("Resend API failed to send email:", resData);

      if (supabaseAdmin) {
        await supabaseAdmin
          .from("workspace_member_invites")
          .update({
            send_status: "failed",
            send_error: typeof resData === "object" ? JSON.stringify(resData) : String(resData),
          })
          .eq("id", invitation_id);
      }

      return new Response(
        JSON.stringify({
          error: "Failed to send email via Resend. Invitation status marked as failed.",
          details: resData,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (supabaseAdmin) {
      await supabaseAdmin
        .from("workspace_member_invites")
        .update({ send_status: "sent", send_error: null })
        .eq("id", invitation_id);
    }

    return new Response(JSON.stringify({ success: true, id: resData.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("Unhandled error in send-workspace-invite Edge Function:", errorMsg);

    return new Response(JSON.stringify({ error: errorMsg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
