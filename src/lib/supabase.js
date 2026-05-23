import { createClient } from '@supabase/supabase-js'

const supabaseUrl     = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '[BambuCalc] Variables d\'environnement Supabase manquantes.\n' +
    'Vérifiez que VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY sont définies\n' +
    'dans .env.local (dev) ou dans les variables Netlify (prod).'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
