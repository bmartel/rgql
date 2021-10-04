import type { ReactNode } from 'react'
import type { AppProps } from 'next/app'
import { createClient, dedupExchange, cacheExchange, fetchExchange, Provider } from 'urql'
import { refocusExchange } from '@urql/exchange-refocus'
import globalStyles from '@/styles/globalStyles'

const client = createClient({
  url: process.env.NEXT_PUBLIC_GRAPHQL_URL,
  exchanges: [dedupExchange, refocusExchange(), cacheExchange, fetchExchange],
})

export default function App({ Component, pageProps }: AppProps): ReactNode {
  globalStyles()
  return (
    <Provider value={client}>
      <Component {...pageProps} />
    </Provider>
  )
}
