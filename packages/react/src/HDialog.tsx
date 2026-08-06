import type { ReactNode } from 'react'
import { Dialog as ArkDialog } from '@ark-ui/react/dialog'
import type { DialogContract, OpenChangeDetails } from '@demo/ui-core'

export interface HDialogProps extends DialogContract<ReactNode> {
  onOpenChange?: (details: OpenChangeDetails) => void
  /** Optional class for sizing/styling the dialog content surface. */
  contentClassName?: string
  /** Label rendered by the built-in close trigger. */
  closeLabel?: ReactNode
  /** Hide the built-in close trigger when the caller provides a custom footer. */
  showCloseTrigger?: boolean
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
  contentClassName,
  closeLabel = 'Close',
  showCloseTrigger = true,
  lazyMount = true,
  unmountOnExit = true,
  skipAnimationOnMount = false,
  ...props
}: HDialogProps) {
  return (
    <ArkDialog.Root
      {...props}
      onOpenChange={onOpenChange}
      lazyMount={lazyMount}
      unmountOnExit={unmountOnExit}
      skipAnimationOnMount={skipAnimationOnMount}
    >
      {trigger ? <ArkDialog.Trigger className="ui-button ui-button--secondary">{trigger}</ArkDialog.Trigger> : null}
      <ArkDialog.Backdrop className="ui-dialog__backdrop" />
      <ArkDialog.Positioner className="ui-dialog__positioner">
        <ArkDialog.Content className={['dialog-content ui-dialog__content', contentClassName].filter(Boolean).join(' ')}>
          <ArkDialog.Title className="ui-dialog__title">{title}</ArkDialog.Title>
          {description ? (
            <ArkDialog.Description className="ui-dialog__description">{description}</ArkDialog.Description>
          ) : null}
          {children}
          {showCloseTrigger ? (
            <ArkDialog.CloseTrigger className="ui-button ui-button--secondary">{closeLabel}</ArkDialog.CloseTrigger>
          ) : null}
        </ArkDialog.Content>
      </ArkDialog.Positioner>
    </ArkDialog.Root>
  )
}
