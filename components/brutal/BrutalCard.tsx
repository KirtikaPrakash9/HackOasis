import { ReactNode } from 'react'

export function BrutalCard({ children, className = '' }: { children?: ReactNode; className?: string }) {
  return <div className={`card-brutal p-5 ${className}`}>{children}</div>
}
