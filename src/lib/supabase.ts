// Live Supabase client. Only used when VITE_DATA_MODE=live (Phase 8).
// A SupabaseProvider implementing DataProvider will wrap this; not built yet.
import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = url && anonKey ? createClient(url, anonKey) : null
