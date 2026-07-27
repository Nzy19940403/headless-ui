import type { CSSProperties, ReactNode } from 'react'
import { Drawer as ArkDrawer } from '@ark-ui/react/drawer'
import type { DrawerContract, DrawerPlacement, OpenChangeDetails } from '@demo/ui-core'
import { drawerSwipeDirection } from '@demo/ui-core'

export interface HDrawerProps extends DrawerContract<ReactNode> {
  onOpenChange?: (details: OpenChangeDetails) => void
}

/**
 * Ark Drawer + Presence. Theme CSS animates [data-state=open|closed].
 * lazyMount/unmountOnExit keep enter/exit animations reliable.
 */
export function HDrawer({
  trigger,
  title,
  description,
  children,
  placement = 'right',
  size = '360px',
  onOpenChange,
  ...props
}: HDrawerProps) {
  const swipeDirection = drawerSwipeDirection(placement)
  const panelStyle = {
    ['--ui-drawer-size' as string]: size,
  } as CSSProperties

  return (
    <ArkDrawer.Root
      {...props}
      swipeDirection={swipeDirection}
      onOpenChange={onOpenChange}
      lazyMount
      unmountOnExit
      skipAnimationOnMount={false}
    >
      <ArkDrawer.Trigger className="ui-button ui-button--secondary">{trigger}</ArkDrawer.Trigger>
      <ArkDrawer.Backdrop className="ui-drawer__backdrop" />
      <ArkDrawer.Positioner
        className={['ui-drawer__positioner', `ui-drawer__positioner--${placement}`].join(' ')}
        data-placement={placement}
      >
        <ArkDrawer.Content
          className={['ui-drawer__content', `ui-drawer__content--${placement}`].join(' ')}
          style={panelStyle}
          data-placement={placement}
        >
          <header className="ui-drawer__header">
            <ArkDrawer.Title className="ui-drawer__title">{title}</ArkDrawer.Title>
            <ArkDrawer.CloseTrigger className="ui-button ui-button--ghost ui-drawer__close" type="button">
              Close
            </ArkDrawer.CloseTrigger>
          </header>
          {description ? (
            <ArkDrawer.Description className="ui-drawer__description">{description}</ArkDrawer.Description>
          ) : null}
          <div className="ui-drawer__body">{children}</div>
        </ArkDrawer.Content>
      </ArkDrawer.Positioner>
    </ArkDrawer.Root>
  )
}

export type { DrawerPlacement }
