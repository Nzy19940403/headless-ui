import type { TextareaHTMLAttributes } from 'react'
import { Field } from '@ark-ui/react/field'
import type { TextareaContract, ValueChangeDetails } from '@demo/ui-core'

export interface HTextareaProps
  extends TextareaContract,
    Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'defaultValue' | 'size'> {
  onValueChange?: (details: ValueChangeDetails) => void
}

export function HTextarea({
  label,
  helperText,
  error,
  size = 'md',
  rows = 3,
  onValueChange,
  className,
  required,
  ...props
}: HTextareaProps) {
  const invalid = Boolean(error)
  return (
    <Field.Root
      className={['ui-field', `ui-field--${size}`, className].filter(Boolean).join(' ')}
      invalid={invalid}
      required={required}
      disabled={props.disabled}
    >
      {label ? (
        <Field.Label className="ui-field__label">
          {label}
          {required ? <span className="ui-field__required">*</span> : null}
        </Field.Label>
      ) : null}
      <Field.Textarea
        className="ui-textarea"
        rows={rows}
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
