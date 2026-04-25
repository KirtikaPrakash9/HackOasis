import { ButtonHTMLAttributes } from 'react'

export function Button(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className="btn-brutal px-4 py-2 text-sm font-mono font-bold uppercase" {...props} />
}
