import { SigninWithGoogle } from '@/components/SigninWithGoogle'
import type { NextPage, NextPageContext } from 'next'
import { getSession } from 'next-auth/react'

export async function getServerSideProps(ctx: NextPageContext) {
  return {
    props: {
      session: await getSession(ctx),
    },
  }
}

const Home: NextPage = () => {
  return (
    <div>
      <SigninWithGoogle />
    </div>
  )
}

export default Home
