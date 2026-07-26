import type { DetailedHTMLProps, HTMLAttributes } from 'react'

type CustomElementProps = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
  checked?: boolean
  multiple?: boolean
  open?: boolean
  'default-value'?: string
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'ui-button': CustomElementProps & {
        variant?: 'primary' | 'secondary'
        size?: 'sm' | 'md'
        disabled?: boolean
      }
      'ui-card': CustomElementProps & { variant?: 'surface' | 'muted' }
      'ui-tag': CustomElementProps & { tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info' }
      'ui-toggle': CustomElementProps
      'ui-checkbox': CustomElementProps
      'ui-dialog': CustomElementProps
      'ui-tabs': CustomElementProps
      'ui-accordion': CustomElementProps
    }
  }
}

export {}
