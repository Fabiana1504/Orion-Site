import { createClient } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "./supabaseEnv";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = isSupabaseConfigured() ? createClient(supabaseUrl, supabaseAnonKey) : null;
