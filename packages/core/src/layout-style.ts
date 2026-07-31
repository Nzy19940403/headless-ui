/**
 * Map layout contracts → class names + CSS variable styles (framework-agnostic).
 */
import type {
  ContainerContract,
  GridContract,
  SpacerContract,
  SplitContract,
  StackContract,
  VStackContract,
} from './layout-contract'
import {
  alignCssValue,
  containerSizeCssValue,
  gapCssValue,
  gridColumnsCssValue,
  justifyCssValue,
  mergeStyles,
  responsiveVarStyle,
  spacerSizeCssValue,
  splitRatioCssValue,
} from './layout-utils'

export type LayoutStyleMap = Record<string, string>

export function containerStyle(props: ContainerContract): LayoutStyleMap {
  return mergeStyles(
    responsiveVarStyle('--ui-container-size', props.size ?? 'xl', containerSizeCssValue),
  )
}

export function containerClassName(props: ContainerContract, className?: string): string {
  const size = props.size ?? 'xl'
  const padded = props.padded ?? true
  const center = props.center ?? true
  const sizeStr = String(size)
  return [
    'ui-container',
    !padded ? 'ui-container--unpadded' : '',
    !center ? 'ui-container--flush' : '',
    size === 'full' || sizeStr === 'full' || sizeStr.startsWith('full ') || sizeStr.includes(' full')
      ? 'ui-container--size-full'
      : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')
}

export function stackStyle(props: StackContract | VStackContract): LayoutStyleMap {
  return mergeStyles(
    responsiveVarStyle('--ui-layout-gap', props.gap ?? 'md', gapCssValue),
    responsiveVarStyle('--ui-layout-align', props.align ?? 'stretch', alignCssValue),
    responsiveVarStyle('--ui-layout-justify', props.justify ?? 'start', justifyCssValue),
  )
}

export function stackClassName(
  base: 'ui-stack' | 'ui-v-stack',
  props: StackContract | VStackContract,
  className?: string,
  wrap?: boolean,
): string {
  const stackBelow =
    'stackBelow' in props ? (props.stackBelow as string | undefined) : undefined
  const parts: string[] = [base]
  if (wrap) parts.push(`${base}--wrap`)
  if (stackBelow && stackBelow !== 'never') parts.push(`${base}--stack-below-${stackBelow}`)
  if (props.reverse) parts.push(`${base}--reverse`)
  if ('fillHeight' in props && props.fillHeight) parts.push(`${base}--fill-height`)
  if (className) parts.push(className)
  return parts.join(' ')
}

export function gridStyle(props: GridContract): LayoutStyleMap {
  return mergeStyles(
    responsiveVarStyle('--ui-grid-columns', props.columns ?? 'auto-fit', gridColumnsCssValue),
    responsiveVarStyle('--ui-layout-gap', props.gap ?? 'md', gapCssValue),
    props.rowGap !== undefined
      ? responsiveVarStyle('--ui-layout-row-gap', props.rowGap, gapCssValue)
      : undefined,
    props.columnGap !== undefined
      ? responsiveVarStyle('--ui-layout-column-gap', props.columnGap, gapCssValue)
      : undefined,
    props.minChildWidth ? { '--ui-grid-min': props.minChildWidth } : undefined,
  )
}

export function gridClassName(props: GridContract, className?: string): string {
  return ['ui-grid', props.equalHeight ? 'ui-grid--equal-height' : '', className]
    .filter(Boolean)
    .join(' ')
}

export function splitStyle(props: SplitContract): LayoutStyleMap {
  return mergeStyles(
    responsiveVarStyle('--ui-split-template', props.ratio ?? '1:1', splitRatioCssValue),
    responsiveVarStyle('--ui-layout-gap', props.gap ?? 'md', gapCssValue),
    responsiveVarStyle('--ui-layout-align', props.align ?? 'stretch', alignCssValue),
    props.sidebarWidth ? { '--ui-sidebar-width': props.sidebarWidth } : undefined,
  )
}

export function splitClassName(props: SplitContract, className?: string): string {
  const collapse = props.collapseBelow ?? 'md'
  return [
    'ui-split',
    collapse !== 'never' ? `ui-split--collapse-${collapse}` : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')
}

export function spacerStyle(props: SpacerContract): LayoutStyleMap {
  return mergeStyles(
    responsiveVarStyle('--ui-spacer-size', props.size ?? 'md', spacerSizeCssValue),
  )
}

export function spacerClassName(props: SpacerContract, className?: string): string {
  const grow = props.grow ?? true
  return ['ui-spacer', !grow ? 'ui-spacer--fixed' : '', className].filter(Boolean).join(' ')
}
