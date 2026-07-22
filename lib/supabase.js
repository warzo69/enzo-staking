import { createClient } from '@supabase/supabase-js';

// Ces deux valeurs viennent de ton projet Supabase.
// Elles sont mises dans le fichier .env.local (en local) et dans Vercel (en ligne).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// On crée un seul client réutilisé partout dans le site.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
