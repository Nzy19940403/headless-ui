import type { HTMLAttributes, PropsWithChildren } from 'react'
import type { VStackContract } from '@demo/ui-core'
import { stackClassName, stackStyle } from './layout-style'

export interface HVStackProps
  extends VStackContract, PropsWithChildren<HTMLAttributes<HTMLDivElement>> {}

export function HVStack({
  gap = 'md',
  align = 'stretch',
  justify = 'start',
  reverse = false,
  className,
  style,
  children,
  ...props
}: HVStackProps) {
  const contract = { gap, align, justify, reverse }
  return (
    <div
      {...props}
      className={stackClassName('ui-v-stack', contract, className)}
      style={{ ...stackStyle(contract), ...style }}
    >
      {children}
    </div>
  )
}
