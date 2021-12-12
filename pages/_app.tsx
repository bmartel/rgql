import type { ReactNode } from 'react'
import type { AppProps } from 'next/app'
import globalStyles from '@/styles/globalStyles'
import { useSession } from '@/hooks/supabase'

export default function App({ Component, pageProps }: AppProps): ReactNode {
  globalStyles()
  useSession()
  return <Component {...pageProps} />
}
