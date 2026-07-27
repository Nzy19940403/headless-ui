import type { DetailedHTMLProps, HTMLAttributes } from 'react'

type CustomElementProps = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
  checked?: boolean
  'default-checked'?: boolean
  multiple?: boolean
  open?: boolean
  'default-open'?: boolean
  value?: string | number
  'default-value'?: string
  label?: string
  placeholder?: string
  disabled?: boolean
  items?: string
  src?: string
  alt?: string
  fallback?: string
  size?: string
  tone?: string
  content?: string
  title?: string
  description?: string
  orientation?: string
  width?: string
  height?: string
  circle?: boolean
  dot?: boolean
  animated?: boolean
  indeterminate?: boolean
  min?: string | number
  max?: string | number
  'helper-text'?: string
  error?: string
  /** React-aligned property callbacks (set via ref); not HTML attributes */
  onValueChange?: (detail: { value: string | string[] | number }) => void
  onCheckedChange?: (detail: { checked: boolean }) => void
  onOpenChange?: (detail: { open: boolean }) => void
  rows?: number | string
  step?: number | string
  padded?: boolean
  center?: boolean
  gap?: string
  align?: string
  justify?: string
  wrap?: boolean
  reverse?: boolean
  columns?: string | number
  'min-child-width'?: string
  'row-gap'?: string
  'column-gap'?: string
  'equal-height'?: boolean
  ratio?: string
  'collapse-below'?: string
  'sidebar-width'?: string
  grow?: boolean
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'h-button': CustomElementProps
      'h-card': CustomElementProps
      'h-tag': CustomElementProps
      'h-toggle': CustomElementProps
      'h-checkbox': CustomElementProps
      'h-dialog': CustomElementProps
      'h-drawer': CustomElementProps
      'h-tabs': CustomElementProps
      'h-accordion': CustomElementProps
      'h-input': CustomElementProps
      'h-textarea': CustomElementProps
      'h-number-input': CustomElementProps
      'h-password-input': CustomElementProps
      'h-select': CustomElementProps
      'h-combobox': CustomElementProps
      'h-radio-group': CustomElementProps
      'h-segment-group': CustomElementProps
      'h-slider': CustomElementProps
      'h-date-picker': CustomElementProps
      'h-table': CustomElementProps
      'h-badge': CustomElementProps
      'h-avatar': CustomElementProps
      'h-tooltip': CustomElementProps
      'h-progress': CustomElementProps
      'h-skeleton': CustomElementProps
      'h-empty': CustomElementProps
      'h-separator': CustomElementProps
      'h-container': CustomElementProps
      'h-stack': CustomElementProps
      'h-v-stack': CustomElementProps
      'h-grid': CustomElementProps
      'h-split': CustomElementProps
      'h-spacer': CustomElementProps
    }
  }
}

export {}
