import { Checkbox as ArkCheckbox } from '@ark-ui/react/checkbox'

export interface CheckboxProps {
  label: string
  checked?: boolean
  defaultChecked?: boolean
  disabled?: boolean
  onCheckedChange?: (checked: boolean) => void
}

export function Checkbox({ label, onCheckedChange, ...props }: CheckboxProps) {
  return (
    <ArkCheckbox.Root {...props} onCheckedChange={details => onCheckedChange?.(Boolean(details.checked))}>
      <ArkCheckbox.Control>
        <ArkCheckbox.Indicator>✓</ArkCheckbox.Indicator>
      </ArkCheckbox.Control>
      <ArkCheckbox.Label>{label}</ArkCheckbox.Label>
      <ArkCheckbox.HiddenInput />
    </ArkCheckbox.Root>
  )
}
