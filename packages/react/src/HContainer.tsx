import type { HTMLAttributes, PropsWithChildren } from 'react'
import type { ContainerContract } from '@demo/ui-core'
import { containerClassName, containerStyle } from './layout-style'

export interface HContainerProps
  extends ContainerContract, PropsWithChildren<HTMLAttributes<HTMLDivElement>> {}

export function HContainer({
  size = 'xl',
  padded = true,
  center = true,
  className,
  style,
  children,
  ...props
}: HContainerProps) {
  const contract = { size, padded, center }
  return (
    <div
      {...props}
      className={containerClassName(contract, className)}
      style={{ ...containerStyle(contract), ...style }}
    >
      {children}
    </div>
  )
}
