import { Checkbox as ArkCheckbox } from '@ark-ui/react/checkbox'
import type { CheckedChangeDetails, CheckboxContract } from '@demo/ui-core'

export interface HCheckboxProps extends CheckboxContract {
  onCheckedChange?: (details: CheckedChangeDetails) => void
}

export function HCheckbox({ label, onCheckedChange, ...props }: HCheckboxProps) {
  return (
    <ArkCheckbox.Root {...props} onCheckedChange={details => onCheckedChange?.({ checked: Boolean(details.checked) })}>
      <ArkCheckbox.Control>
        <ArkCheckbox.Indicator>✓</ArkCheckbox.Indicator>
      </ArkCheckbox.Control>
      <ArkCheckbox.Label>{label}</ArkCheckbox.Label>
      <ArkCheckbox.HiddenInput />
    </ArkCheckbox.Root>
  )
}
