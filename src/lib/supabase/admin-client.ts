import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Uses the SERVICE ROLE key — this bypasses RLS entirely, so it must
 * never be imported into a Client Component or exposed to the browser
 * (the "server-only" import above makes that a build-time error if it
 * happens by mistake). Only use this for the specific admin-only
 * operations that the regular client can't do, like creating another
 * user's auth account.
 */
export function createServiceRoleClient() {
  return createSupabaseClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
