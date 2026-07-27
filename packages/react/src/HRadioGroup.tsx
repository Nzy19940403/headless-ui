import { RadioGroup } from '@ark-ui/react/radio-group'
import type { RadioGroupContract, ValueChangeDetails } from '@demo/ui-core'

export interface HRadioGroupProps extends RadioGroupContract {
  onValueChange?: (details: ValueChangeDetails) => void
}

export function HRadioGroup({
  items,
  value,
  defaultValue,
  disabled,
  name,
  label,
  onValueChange,
}: HRadioGroupProps) {
  return (
    <RadioGroup.Root
      className="ui-radio-group"
      value={value}
      defaultValue={defaultValue}
      disabled={disabled}
      name={name}
      onValueChange={details => onValueChange?.({ value: details.value ?? '' })}
    >
      {label ? <RadioGroup.Label className="ui-field__label">{label}</RadioGroup.Label> : null}
      <div className="ui-radio-group__items">
        {items.map(item => (
          <RadioGroup.Item key={item.value} value={item.value} disabled={item.disabled} className="ui-radio">
            <RadioGroup.ItemControl className="ui-radio__control" />
            <RadioGroup.ItemText className="ui-radio__label">{item.label}</RadioGroup.ItemText>
            <RadioGroup.ItemHiddenInput />
          </RadioGroup.Item>
        ))}
      </div>
    </RadioGroup.Root>
  )
}
