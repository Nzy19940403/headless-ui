import type { HTMLAttributes, PropsWithChildren } from 'react'
import type { StackContract } from '@demo/ui-core'
import { stackClassName, stackStyle } from './layout-style'

export interface HStackProps extends StackContract, PropsWithChildren<HTMLAttributes<HTMLDivElement>> {}

export function HStack({
  gap = 'md',
  align = 'stretch',
  justify = 'start',
  wrap = false,
  stackBelow = 'never',
  reverse = false,
  className,
  style,
  children,
  ...props
}: HStackProps) {
  const contract = { gap, align, justify, wrap, stackBelow, reverse }
  return (
    <div
      {...props}
      className={stackClassName('ui-stack', contract, className, wrap)}
      style={{ ...stackStyle(contract), ...style }}
    >
      {children}
    </div>
  )
}
