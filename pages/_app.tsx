import type { ReactNode } from 'react'
import type { AppProps } from 'next/app'
import globalStyles from '@/styles/globalStyles'

export default function App({ Component, pageProps }: AppProps): ReactNode {
  globalStyles()
  return <Component {...pageProps} />
}
