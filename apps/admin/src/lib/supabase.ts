import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://qowinnmfdkaampgpovqb.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_xUjdYpeyOEDCGBPPMQN6mw_nKBdCkgy";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
