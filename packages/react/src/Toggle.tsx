import { Switch } from '@ark-ui/react/switch'

export interface ToggleProps {
  checked?: boolean
  defaultChecked?: boolean
  disabled?: boolean
  onCheckedChange?: (checked: boolean) => void
  children?: React.ReactNode
}

/** React Renderer: Ark UI owns the interaction state machine. */
export function Toggle({ children, onCheckedChange, ...props }: ToggleProps) {
  return (
    <Switch.Root {...props} onCheckedChange={(details) => onCheckedChange?.(details.checked)}>
      <Switch.Control><Switch.Thumb /></Switch.Control>
      <Switch.Label>{children}</Switch.Label>
      <Switch.HiddenInput />
    </Switch.Root>
  )
}
