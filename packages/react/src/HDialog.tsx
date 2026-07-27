import type { ReactNode } from 'react'
import { Dialog as ArkDialog } from '@ark-ui/react/dialog'
import type { DialogContract, OpenChangeDetails } from '@demo/ui-core'

export interface HDialogProps extends DialogContract<ReactNode> {
  onOpenChange?: (details: OpenChangeDetails) => void
}

/**
 * Ark Dialog + Presence. Theme CSS animates [data-state=open|closed]
 * (fade backdrop + scale/fade content).
 */
export function HDialog({
  trigger,
  title,
  description,
  children,
  onOpenChange,
  ...props
}: HDialogProps) {
  return (
    <ArkDialog.Root
      {...props}
      onOpenChange={onOpenChange}
      lazyMount
      unmountOnExit
      skipAnimationOnMount={false}
    >
      <ArkDialog.Trigger className="ui-button ui-button--secondary">{trigger}</ArkDialog.Trigger>
      <ArkDialog.Backdrop className="ui-dialog__backdrop" />
      <ArkDialog.Positioner className="ui-dialog__positioner">
        <ArkDialog.Content className="dialog-content ui-dialog__content">
          <ArkDialog.Title className="ui-dialog__title">{title}</ArkDialog.Title>
          {description ? (
            <ArkDialog.Description className="ui-dialog__description">{description}</ArkDialog.Description>
          ) : null}
          {children}
          <ArkDialog.CloseTrigger className="ui-button ui-button--secondary">Close</ArkDialog.CloseTrigger>
        </ArkDialog.Content>
      </ArkDialog.Positioner>
    </ArkDialog.Root>
  )
}
