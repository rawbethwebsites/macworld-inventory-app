import { createClient } from '@supabase/supabase-js'

// Get Supabase credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Debug: Log what we're getting (we'll remove this after testing)
console.log('🔍 Environment check:')
console.log('VITE_SUPABASE_URL:', supabaseUrl ? '✅ Found' : '❌ Missing')
console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Found' : '❌ Missing')
console.log('Supabase URL value:', supabaseUrl)

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables. Please check your .env file.')
  console.error('Make sure variables start with VITE_ prefix (not NEXT_PUBLIC_)')
}

// Create Supabase client
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')

export default supabase
