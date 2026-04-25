import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'

export const metadata: Metadata = {
  title: 'HackOasis',
  description: 'AI-powered hackathon management and talent hub for MENA',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <header className="border-b-4 border-hack-black px-6 py-4">
          <nav className="mx-auto flex w-full max-w-6xl items-center justify-between">
            <Link href="/" className="font-mono text-sm font-bold uppercase tracking-wide">
              HackOasis
            </Link>
            <div className="flex items-center gap-4 text-sm">
              <Link href="/events">Events</Link>
              <Link href="/organise/events">Organise</Link>
              <Link href="/profile/setup">Profile</Link>
              <Link href="/signin">Sign in</Link>
            </div>
          </nav>
        </header>
        {children}
      </body>
    </html>
  )
}
