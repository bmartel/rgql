import type { ReactNode } from 'react'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { SessionProvider } from 'next-auth/react'
import { createClient, dedupExchange, cacheExchange, fetchExchange, Provider } from 'urql'
import { refocusExchange } from '@urql/exchange-refocus'
import globalStyles from '@/styles/globalStyles'

const client = createClient({
  url: process.env.NEXT_PUBLIC_GRAPHQL_URL!,
  exchanges: [dedupExchange, refocusExchange(), cacheExchange, fetchExchange],
})

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps): ReactNode {
  globalStyles()
  return (
    <SessionProvider session={session}>
      <Provider value={client}>
        <Head>
          <meta
            name="viewport"
            content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, user-scalable=yes, viewport-fit=cover"
          />
        </Head>
        <Component {...pageProps} />
      </Provider>
    </SessionProvider>
  )
}
