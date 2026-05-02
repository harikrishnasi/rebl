import { createClient } from '@supabase/supabase-js'

// Extract only the origin (scheme + host) — strips any accidental /rest/v1 or trailing slashes
const rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim()
const supabaseUrl = rawUrl ? new URL(rawUrl).origin : ''
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim()

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
