import { ButtonHTMLAttributes } from 'react'

type BrutalButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'orange' | 'neutral'
}

export function BrutalButton({ variant = 'neutral', className = '', ...props }: BrutalButtonProps) {
  const variantClass =
    variant === 'primary'
      ? 'bg-hack-yellow'
      : variant === 'orange'
        ? 'bg-hack-orange text-hack-cream'
        : 'bg-hack-cream'

  return (
    <button
      className={`btn-brutal px-4 py-2 text-sm font-mono font-bold uppercase tracking-wide ${variantClass} ${className}`}
      {...props}
    />
  )
}
