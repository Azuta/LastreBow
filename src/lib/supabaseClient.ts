// src/lib/supabaseClient.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Dejamos la configuración simple, sin las opciones extras
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}