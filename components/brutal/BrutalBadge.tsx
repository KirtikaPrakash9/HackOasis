import { ReactNode } from 'react'

export function BrutalBadge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'primary' | 'orange' }) {
  const toneClass =
    tone === 'primary' ? 'bg-hack-yellow' : tone === 'orange' ? 'bg-hack-orange text-hack-cream' : 'bg-hack-concrete'

  return <span className={`inline-block border-2 border-hack-black px-2 py-0.5 text-xs font-mono uppercase ${toneClass}`}>{children}</span>
}
