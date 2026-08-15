/**
 * Shared JWT authentication helper for Keel Supabase Edge Functions.
 */

import { createClient, type User } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "./cors.ts";

export interface AuthContext {
  user: User;
  token: string;
}

/**
 * Validates the incoming Request's Authorization header against Supabase Auth.
 * Returns the authenticated User context or throws an HTTP Response if invalid.
 */
export async function requireAuth(req: Request): Promise<AuthContext> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    throw new Response(JSON.stringify({ error: "Missing Authorization header" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) {
    throw new Response(JSON.stringify({ error: "Invalid Authorization token format" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Response(JSON.stringify({ error: "Server configuration missing: SUPABASE_URL / SUPABASE_ANON_KEY" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    throw new Response(JSON.stringify({ error: `Unauthorized: ${error?.message || "Invalid token"}` }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return { user: data.user, token };
}
