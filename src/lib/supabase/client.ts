import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/supabase'

type BrowserClient = ReturnType<typeof createBrowserClient<Database>>

let client: BrowserClient | undefined

export function getBrowserClient(): BrowserClient {
  if (!client) {
    client = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return client
}
