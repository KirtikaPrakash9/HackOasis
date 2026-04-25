import { InputHTMLAttributes } from 'react'

export function BrutalInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className="input-brutal w-full" {...props} />
}
