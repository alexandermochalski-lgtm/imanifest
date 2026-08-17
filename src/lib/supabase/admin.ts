import { createClient } from "@supabase/supabase-js";
import { supabaseSecretKey, supabaseUrl } from "@/lib/supabase/env";

export function createAdminSupabase() {
  const secret = supabaseSecretKey();
  if (!supabaseUrl() || !secret) return null;
  return createClient(supabaseUrl(), secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
