import { FC } from 'react'
import { signIn, signOut, useSession } from 'next-auth/react'
import tw, { styled } from 'twin.macro'

const Button = styled.button({
  // Spread the base styles
  ...tw`bg-purple-500 hover:bg-purple-600 text-white transition-colors duration-200 ease-out  font-bold py-2 px-4 rounded`,
  // Add conditional styling in the variants object
  // https://stitches.dev/docs/variants
  variants: {
    google: { true: tw`bg-gray-200 hover:bg-gray-300 text-black` },
  },
})

export const SigninWithGoogle: FC = () => {
  const { data: session, status } = useSession()

  if (status === 'authenticated') {
    return (
      <Button google onClick={() => signOut()}>
        Sign out {session?.user?.email}
      </Button>
    )
  }
  return (
    <Button google onClick={() => signIn('google')}>
      Sign in with Google
    </Button>
  )
}
