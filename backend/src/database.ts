import { createClient } from "@supabase/supabase-js";
import { config } from "./config";

export const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey, {
  auth: { persistSession: false },
});
export const supabaseAnon = createClient(config.supabaseUrl, config.supabaseAnonKey, {
  auth: { persistSession: false },
});
