/**
 * Shared CORS headers and preflight handling for Keel Supabase Edge Functions.
 */

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  // `x-user-ai-key` carries a key the browser holds locally. It has to be
  // listed here or the preflight rejects the request before the function is
  // ever reached — which looks exactly like the function being down.
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-user-ai-key",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

/**
 * Returns a Response for CORS preflight OPTIONS requests.
 */
export function handleCors(req: Request): Response | null {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  return null;
}
