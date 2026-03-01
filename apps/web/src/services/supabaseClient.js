import { createClient } from '@supabase/supabase-js';

// Vite will replace these at build time. Populate them in a `.env` file
// at the project root (apps/web) or set them in your CI/CD environment.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
