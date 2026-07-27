import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'
import type { ButtonContract } from '@demo/ui-core'

export interface HButtonProps extends ButtonContract, PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> {}

export function HButton({ variant = 'primary', size = 'md', className, ...props }: HButtonProps) {
  return <button {...props} className={['ui-button', `ui-button--${variant}`, `ui-button--${size}`, className].filter(Boolean).join(' ')} />
}
