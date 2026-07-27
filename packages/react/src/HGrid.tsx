import type { HTMLAttributes, PropsWithChildren } from 'react'
import type { GridContract } from '@demo/ui-core'
import { gridClassName, gridStyle } from './layout-style'

export interface HGridProps extends GridContract, PropsWithChildren<HTMLAttributes<HTMLDivElement>> {}

export function HGrid({
  columns = 'auto-fit',
  minChildWidth = '240px',
  gap = 'md',
  rowGap,
  columnGap,
  equalHeight = false,
  className,
  style,
  children,
  ...props
}: HGridProps) {
  const contract = { columns, minChildWidth, gap, rowGap, columnGap, equalHeight }
  return (
    <div
      {...props}
      className={gridClassName(contract, className)}
      style={{ ...gridStyle(contract), ...style }}
    >
      {children}
    </div>
  )
}
