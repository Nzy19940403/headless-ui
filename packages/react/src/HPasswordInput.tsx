import { PasswordInput } from '@ark-ui/react/password-input'
import type { PasswordInputContract, ValueChangeDetails } from '@demo/ui-core'

export interface HPasswordInputProps extends PasswordInputContract {
  onValueChange?: (details: ValueChangeDetails) => void
}

/**
 * Password field with visibility toggle.
 * Zag PasswordInput owns visibility only; value is controlled via the input (MeshFlow-ready).
 */
export function HPasswordInput({
  label,
  value,
  defaultValue,
  placeholder,
  disabled,
  readOnly,
  required,
  name,
  error,
  helperText,
  autoComplete = 'current-password',
  onValueChange,
}: HPasswordInputProps) {
  const invalid = Boolean(error)
  return (
    <PasswordInput.Root
      className="ui-password-input"
      disabled={disabled}
      readOnly={readOnly}
      required={required}
      invalid={invalid}
      name={name}
      autoComplete={autoComplete}
    >
      {label ? <PasswordInput.Label className="ui-field__label">{label}</PasswordInput.Label> : null}
      <PasswordInput.Control className="ui-password-input__control">
        <PasswordInput.Input
          className="ui-password-input__input"
          value={value}
          defaultValue={defaultValue}
          placeholder={placeholder}
          onChange={event => onValueChange?.({ value: event.target.value })}
        />
        <PasswordInput.VisibilityTrigger className="ui-password-input__trigger" type="button">
          <PasswordInput.Indicator className="ui-password-input__indicator" fallback="Show">
            Hide
          </PasswordInput.Indicator>
        </PasswordInput.VisibilityTrigger>
      </PasswordInput.Control>
      {helperText && !error ? <span className="ui-field__helper">{helperText}</span> : null}
      {error ? <span className="ui-field__error">{error}</span> : null}
    </PasswordInput.Root>
  )
}
