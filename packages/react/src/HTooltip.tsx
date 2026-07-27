import type { ReactNode } from 'react'
import { Tooltip } from '@ark-ui/react/tooltip'
import type { OpenChangeDetails, TooltipContract } from '@demo/ui-core'

export interface HTooltipProps extends TooltipContract<ReactNode> {
  children: ReactNode
  onOpenChange?: (details: OpenChangeDetails) => void
}

export function HTooltip({
  content,
  children,
  open,
  defaultOpen,
  disabled,
  positioning = 'top',
  onOpenChange,
}: HTooltipProps) {
  return (
    <Tooltip.Root
      open={open}
      defaultOpen={defaultOpen}
      disabled={disabled}
      positioning={{ placement: positioning }}
      onOpenChange={details => onOpenChange?.({ open: details.open })}
    >
      <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
      <Tooltip.Positioner>
        <Tooltip.Content className="ui-tooltip">{content}</Tooltip.Content>
      </Tooltip.Positioner>
    </Tooltip.Root>
  )
}
