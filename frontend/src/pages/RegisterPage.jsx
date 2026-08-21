import { SignUp } from '@clerk/react'

export function RegisterPage({ navigate }) {
  return <SignUp routing="hash" signInUrl="/login" fallbackRedirectUrl="/inicio" />
}
