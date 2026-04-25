import { SignInForm } from './SignInForm'

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const params = await searchParams
  const nextPath = params.next && params.next.startsWith('/') ? params.next : '/events'

  return (
    <main className="mx-auto min-h-screen w-full max-w-md px-6 py-10">
      <h1 className="text-3xl font-black">SIGN IN</h1>
      <hr className="hr-brutal my-6" />
      <SignInForm nextPath={nextPath} />
    </main>
  )
}
