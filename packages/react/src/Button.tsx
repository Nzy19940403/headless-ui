import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'
import type { ButtonSize, ButtonVariant } from '@demo/ui-core'
export interface ButtonProps extends PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> { variant?: ButtonVariant; size?: ButtonSize }
export function Button({ variant = 'primary', size = 'md', className, ...props }: ButtonProps) { return <button {...props} className={['ui-button', `ui-button--${variant}`, `ui-button--${size}`, className].filter(Boolean).join(' ')} /> }
