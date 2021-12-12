import { useEffect, useCallback } from 'react'
import { createClient, SupabaseClient, AuthUser, Provider } from '@supabase/supabase-js'
import { atom, useAtom } from 'jotai'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY
export const client = createClient(supabaseUrl!, supabaseKey!)

export const supabaseAtom = atom<SupabaseClient>(client)
export const userAtom = atom<AuthUser | null>(null)
export const userLoadingAtom = atom<boolean>(true)

export interface UseAuthReturn {
  user: AuthUser | null
  login: (config: { email?: string; password?: string; provider?: Provider }) => Promise<void>
  logout: () => Promise<void>
  loading: boolean
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useAtom(userAtom)
  const [loading, setLoading] = useAtom(userLoadingAtom)

  const refreshUser = useCallback(() => {
    setUser(client.auth.user())
    setLoading(false)
    // eslint-disable-next-line
  }, [])

  // @ts-ignore
  useEffect(() => {
    refreshUser()
    return client.auth.onAuthStateChange(refreshUser)
    // eslint-disable-next-line
  }, [])

  const login = useCallback(async ({ email, password, provider } = {}) => {
    const { user: loginUser, error } = await client.auth.signIn({
      email,
      password,
      provider,
    })
    if (!error) {
      setUser(loginUser)
    }
    // eslint-disable-next-line
  }, [])

  const logout = useCallback(async () => {
    const { error } = await client.auth.signOut()
    if (!error) {
      setUser(null)
    }
    // eslint-disable-next-line
  }, [])

  return { user, login, logout, loading }
}
