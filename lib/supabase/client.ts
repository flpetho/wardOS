import { createBrowserClient } from "@supabase/ssr";
import { supabaseEnv } from "./env";

/**
 * Supabase client for Client Components. Used only by the sign-in form, which
 * needs to request a magic link from the browser. Everything else reads through
 * the server client.
 */
export function createSupabaseBrowserClient() {
  const { url, anonKey } = supabaseEnv();
  return createBrowserClient(url, anonKey);
}
