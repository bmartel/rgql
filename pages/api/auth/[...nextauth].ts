import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

import { DgraphClient, DgraphAdapter } from '@lib/dgraph'
const dgraph = new DgraphClient({
  endpoint: process.env.NEXT_PUBLIC_GRAPHQL_URL!,
  apiKey: process.env.GRAPHQL_API_KEY!,
  adminSecret: process.env.ADMIN_SECRET,
  authHeader: process.env.AUTH_HEADER,
  jwtSecret: process.env.JWT_SECRET,
})

// For more information on each option (and a full list of options) go to
// https://next-auth.js.org/configuration/options
export default NextAuth({
  adapter: DgraphAdapter(dgraph),
  // https://next-auth.js.org/configuration/providers
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
})
