import { Switch } from '@ark-ui/react/switch'
import type { ReactNode } from 'react'
import type { CheckedChangeDetails, ToggleContract } from '@demo/ui-core'

export interface HToggleProps extends ToggleContract {
  onCheckedChange?: (details: CheckedChangeDetails) => void
  children?: ReactNode
}

/** React renderer: Ark UI owns the interaction state machine. */
export function HToggle({ children, onCheckedChange, ...props }: HToggleProps) {
  return (
    <Switch.Root {...props} onCheckedChange={onCheckedChange}>
      <Switch.Control><Switch.Thumb /></Switch.Control>
      <Switch.Label>{children}</Switch.Label>
      <Switch.HiddenInput />
    </Switch.Root>
  )
}
