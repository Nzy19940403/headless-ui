import { NumberInput } from '@ark-ui/react/number-input'
import type { NumberInputContract, ValueChangeDetails } from '@demo/ui-core'

export interface HNumberInputProps extends NumberInputContract {
  onValueChange?: (details: ValueChangeDetails) => void
}

export function HNumberInput({
  label,
  value,
  defaultValue,
  min,
  max,
  step,
  disabled,
  readOnly,
  required,
  name,
  error,
  helperText,
  onValueChange,
}: HNumberInputProps) {
  const invalid = Boolean(error)
  return (
    <NumberInput.Root
      className="ui-number-input"
      value={value}
      defaultValue={defaultValue}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      readOnly={readOnly}
      required={required}
      name={name}
      invalid={invalid}
      onValueChange={details => onValueChange?.({ value: details.value })}
    >
      {label ? <NumberInput.Label className="ui-field__label">{label}</NumberInput.Label> : null}
      <NumberInput.Control className="ui-number-input__control">
        <NumberInput.Input className="ui-number-input__input" />
        <div className="ui-number-input__triggers">
          <NumberInput.IncrementTrigger className="ui-number-input__trigger" type="button">
            +
          </NumberInput.IncrementTrigger>
          <NumberInput.DecrementTrigger className="ui-number-input__trigger" type="button">
            −
          </NumberInput.DecrementTrigger>
        </div>
      </NumberInput.Control>
      {helperText && !error ? <span className="ui-field__helper">{helperText}</span> : null}
      {error ? <span className="ui-field__error">{error}</span> : null}
    </NumberInput.Root>
  )
}
