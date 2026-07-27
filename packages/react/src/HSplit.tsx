import type { HTMLAttributes, PropsWithChildren } from 'react'
import type { SplitContract } from '@demo/ui-core'
import { splitClassName, splitStyle } from './layout-style'

export interface HSplitProps extends SplitContract, PropsWithChildren<HTMLAttributes<HTMLDivElement>> {}

export function HSplit({
  ratio = '1:1',
  gap = 'md',
  collapseBelow = 'md',
  sidebarWidth = '320px',
  align = 'stretch',
  className,
  style,
  children,
  ...props
}: HSplitProps) {
  const contract = { ratio, gap, collapseBelow, sidebarWidth, align }
  return (
    <div
      {...props}
      className={splitClassName(contract, className)}
      style={{ ...splitStyle(contract), ...style }}
    >
      {children}
    </div>
  )
}
