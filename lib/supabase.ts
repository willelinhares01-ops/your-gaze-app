import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

// ─── Validação de ambiente (falha rápida e visível) ───────────────────────────

const supabaseUrl     = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // Aviso no console — não lança exceção para não quebrar SSG em CI sem .env
  console.error(
    '⚠️  [Supabase] Variáveis de ambiente ausentes.\n' +
    '   Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no .env.local',
  )
}

// ─── Cliente Singleton Tipado ─────────────────────────────────────────────────
//
// Tipado com `Database` para que todas as queries via `.from()` retornem
// os tipos corretos de Row, Insert e Update automaticamente.
//
// Uso:
//   const { data } = await supabase.from('profiles').select('*')
//   // data é ProfileRow[] | null — sem necessidade de cast manual

export const supabase = createClient<Database>(
  supabaseUrl     ?? 'https://placeholder.supabase.co',
  supabaseAnonKey ?? 'placeholder-anon-key',
  {
    auth: {
      // Persiste sessão no localStorage do browser (padrão)
      persistSession: true,
      // Detecta automaticamente o token de recuperação de senha e magic link na URL
      detectSessionInUrl: true,
    },
  },
)

// ─── Helpers de conveniência ──────────────────────────────────────────────────

/**
 * Retorna o perfil do usuário autenticado atualmente.
 * Retorna `null` se não houver sessão ativa.
 */
export async function getCurrentProfile() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) {
    console.error('[Supabase] getCurrentProfile:', error.message)
    return null
  }

  return data
}

/**
 * Busca um perfil público pelo handle (case-insensitive).
 * Usado pelas rotas dinâmicas `/[handle]`.
 */
export async function getProfileByHandle(handle: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .ilike('handle', handle)   // LOWER(handle) via índice btree
    .single()

  if (error) return null
  return data
}

/**
 * Busca posts públicos de um Maker (is_locked = false ou tipo POLL/MIMO_GOAL).
 * Usado na vitrine pública `/[handle]`.
 */
export async function getPublicPostsByMaker(makerId: string) {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('maker_id', makerId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[Supabase] getPublicPostsByMaker:', error.message)
    return []
  }

  return data
}
