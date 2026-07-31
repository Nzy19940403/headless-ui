import { useLayoutEffect, useRef, type FocusEvent } from 'react'
import { NumberInput } from '@ark-ui/react/number-input'
import type { NumberInputContract } from '@demo/ui-core'

export interface HNumberInputProps extends NumberInputContract {}

function pinCaretToEnd(input: HTMLInputElement | null | undefined) {
  if (!input || typeof document === 'undefined') return
  if (document.activeElement !== input) return
  const len = input.value.length
  try {
    input.setSelectionRange(len, len)
  } catch {
    /* ignore */
  }
}

function onInputFocus(event: FocusEvent<HTMLInputElement>) {
  const input = event.currentTarget
  requestAnimationFrame(() => {
    const len = input.value.length
    try {
      input.setSelectionRange(len, len)
    } catch {
      /* ignore */
    }
  })
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
  formatOptions,
  allowMouseWheel,
  scrubber,
  onValueChange,
}: HNumberInputProps) {
  const invalid = Boolean(error)
  const rootRef = useRef<HTMLDivElement>(null)

  // Controlled re-renders rewrite the DOM value; keep caret at the end while focused.
  useLayoutEffect(() => {
    const input = rootRef.current?.querySelector<HTMLInputElement>('.ui-number-input__input')
    pinCaretToEnd(input)
  }, [value])

  return (
    <div ref={rootRef} className="ui-number-input-host">
      <NumberInput.Root
        className="ui-number-input"
        value={value === undefined ? undefined : String(value)}
        defaultValue={defaultValue === undefined ? undefined : String(defaultValue)}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        name={name}
        invalid={invalid}
        formatOptions={formatOptions}
        allowMouseWheel={allowMouseWheel}
        onValueChange={details => onValueChange?.({ value: details.value })}
      >
        {label ? <NumberInput.Label className="ui-field__label">{label}</NumberInput.Label> : null}
        <NumberInput.Control className="ui-number-input__control">
          {scrubber ? (
            <NumberInput.Scrubber className="ui-number-input__scrubber" aria-hidden="true">
              ⇄
            </NumberInput.Scrubber>
          ) : null}
          <NumberInput.Input className="ui-number-input__input" onFocus={onInputFocus} />
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
    </div>
  )
}
