import type { InputHTMLAttributes } from 'react'
import { Field } from '@ark-ui/react/field'
import type { InputContract, ValueChangeDetails } from '@demo/ui-core'

export interface HInputProps extends InputContract, Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'value' | 'defaultValue' | 'type'> {
  onValueChange?: (details: ValueChangeDetails) => void
}

export function HInput({
  label,
  helperText,
  error,
  size = 'md',
  onValueChange,
  className,
  required,
  ...props
}: HInputProps) {
  const invalid = Boolean(error)
  return (
    <Field.Root className={['ui-field', `ui-field--${size}`, className].filter(Boolean).join(' ')} invalid={invalid} required={required} disabled={props.disabled}>
      {label ? <Field.Label className="ui-field__label">{label}{required ? <span className="ui-field__required">*</span> : null}</Field.Label> : null}
      <Field.Input
        className="ui-input"
        {...props}
        onChange={event => {
          props.onChange?.(event)
          onValueChange?.({ value: event.target.value })
        }}
      />
      {helperText && !error ? <Field.HelperText className="ui-field__helper">{helperText}</Field.HelperText> : null}
      {error ? <Field.ErrorText className="ui-field__error">{error}</Field.ErrorText> : null}
    </Field.Root>
  )
}
