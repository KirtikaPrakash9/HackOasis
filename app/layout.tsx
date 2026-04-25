import type { Metadata } from 'next'
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
      <body>{children}</body>
    </html>
  )
}
