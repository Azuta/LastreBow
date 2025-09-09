// src/lib/supabaseClient.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // --- AÑADE ESTA OPCIÓN ---
      // Transforma automáticamente los nombres de columna snake_case a camelCase
      db: {
        schema: 'public',
      },
      global: {
        // @ts-ignore
        fetch: (...args) => fetch(...args),
      },
    }
  )
}