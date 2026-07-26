import type { ReactNode } from 'react'
import { Dialog as ArkDialog } from '@ark-ui/react/dialog'

export interface DialogProps {
  trigger: ReactNode
  title: ReactNode
  description?: ReactNode
  children?: ReactNode
}

export function Dialog({ trigger, title, description, children }: DialogProps) {
  return (
    <ArkDialog.Root>
      <ArkDialog.Trigger className="ui-button ui-button--secondary">{trigger}</ArkDialog.Trigger>
      <ArkDialog.Backdrop />
      <ArkDialog.Positioner>
        <ArkDialog.Content className="dialog-content">
          <ArkDialog.Title>{title}</ArkDialog.Title>
          {description ? <ArkDialog.Description>{description}</ArkDialog.Description> : null}
          {children}
          <ArkDialog.CloseTrigger className="ui-button ui-button--secondary">Close</ArkDialog.CloseTrigger>
        </ArkDialog.Content>
      </ArkDialog.Positioner>
    </ArkDialog.Root>
  )
}
