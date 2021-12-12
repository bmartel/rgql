import { useEffect, useCallback } from 'react'
import {
  createClient,
  SupabaseClient,
  AuthUser as BaseAuthUser,
  Provider,
} from '@supabase/supabase-js'
import { atom, useAtom } from 'jotai'
import { useUpdateAtom, useAtomValue, atomWithStorage } from 'jotai/utils'
import { useRouter } from 'next/router'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY
export const client = createClient(supabaseUrl!, supabaseKey!)

export interface AuthUser extends BaseAuthUser {
  username: string
  avatar_url: string
}

export const supabaseAtom = atom<SupabaseClient>(client)
export const redirectToAtom = atomWithStorage<string | null>('redirecTo', null)
export const userAtom = atomWithStorage<AuthUser | null>('user', null)
export const userLoadingAtom = atomWithStorage<boolean>('userLoading', true)

export interface UseAuthReturn {
  user: AuthUser | null
  login: (config: { email?: string; password?: string; provider?: Provider }) => Promise<void>
  logout: () => Promise<void>
  loading: boolean
}

export const useSession = () => {
  const router = useRouter()
  const setUser = useUpdateAtom(userAtom)
  const setLoading = useUpdateAtom(userLoadingAtom)
  const [redirectTo, setRedirectTo] = useAtom(redirectToAtom)

  const refreshUser = useCallback(
    async (event?: string) => {
      let u = client.auth.user()
      if (u) {
        const { data } = await client
          .from('profiles')
          .select('username,avatar_url')
          .eq('id', u.id)
          .single()
        u = { ...u, ...data }
      }
      setUser(u as AuthUser | null)
      setLoading(false)
      if (event === 'SIGNED_IN' && redirectTo) {
        setRedirectTo(null)
        router.replace(redirectTo)
      }
      // eslint-disable-next-line
    },
    [redirectTo, setRedirectTo],
  )

  // @ts-ignore
  useEffect(() => {
    refreshUser()
    const { data } = client.auth.onAuthStateChange(refreshUser)
    if (data?.unsubscribe) {
      return data?.unsubscribe
    }
    // eslint-disable-next-line
  }, [])
}

export const useAuth = (): UseAuthReturn => {
  const router = useRouter()
  const [user, setUser] = useAtom(userAtom)
  const loading = useAtomValue(userLoadingAtom)
  const setRedirectTo = useUpdateAtom(redirectToAtom)

  const login = useCallback(async ({ email, password, provider } = {}) => {
    setRedirectTo(router.asPath)
    const redirectTo = new URL(window.location.href)
    redirectTo.pathname = '/auth/callback'
    await client.auth.signIn(
      {
        email,
        password,
        provider,
      },
      {
        redirectTo: redirectTo.toString(),
      },
    )
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
