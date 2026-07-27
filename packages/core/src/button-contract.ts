export type ButtonVariant = 'primary' | 'secondary' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonContract {
  variant?: ButtonVariant
  size?: ButtonSize
  disabled?: boolean
}
