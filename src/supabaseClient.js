import { createClient } from '@supabase/supabase-js';

// Replace with your actual Supabase project URL and public anon key
// You can find these in your Supabase project settings under API.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log("Supabase Client Initialized:", supabaseUrl ? "Yes" : "No (URL missing)");