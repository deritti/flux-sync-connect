
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('Debug Supabase - URL:', supabaseUrl ? 'Definida' : 'Não definida')
console.log('Debug Supabase - Key:', supabaseAnonKey ? 'Definida' : 'Não definida')

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Variáveis de ambiente do Supabase não encontradas:', {
    VITE_SUPABASE_URL: supabaseUrl || 'undefined',
    VITE_SUPABASE_ANON_KEY: supabaseAnonKey ? 'definida' : 'undefined'
  })
  
  // Criar um cliente mock para evitar erro fatal
  const mockClient = {
    from: () => ({
      select: () => ({ data: [], error: null }),
      insert: () => ({ data: null, error: null }),
      update: () => ({ data: null, error: null }),
      delete: () => ({ data: null, error: null }),
      upsert: () => ({ data: null, error: null }),
      single: () => ({ data: null, error: null }),
      eq: () => ({ data: null, error: null }),
      neq: () => ({ data: null, error: null }),
      order: () => ({ data: null, error: null }),
      limit: () => ({ data: null, error: null })
    })
  }
  
  export const supabase = mockClient as any
} else {
  export const supabase = createClient(supabaseUrl, supabaseAnonKey)
}
