import type { ComponentContent } from './shared'

export type NavMenuMode = 'vertical' | 'horizontal' | 'inline'
export type NavMenuTheme = 'light' | 'dark'
export type NavMenuItemType = 'item' | 'group' | 'divider'

/** A serializable menu shape that adapters may enrich with framework content. */
export interface NavMenuItemContract<TContent = ComponentContent> {
  key: string
  label?: TContent
  icon?: TContent
  extra?: TContent
  href?: string
  title?: string
  disabled?: boolean
  danger?: boolean
  type?: NavMenuItemType
  children?: NavMenuItemContract<TContent>[]
}

export interface NavMenuSelectDetails<TContent = ComponentContent> {
  key: string
  keyPath: string[]
  selectedKeys: string[]
  item: NavMenuItemContract<TContent>
}

export interface NavMenuDeselectDetails<TContent = ComponentContent> extends NavMenuSelectDetails<TContent> {}

export interface NavMenuOpenChangeDetails {
  openKeys: string[]
}

export type NavMenuSelectHandler<TContent = ComponentContent> = (
  details: NavMenuSelectDetails<TContent>,
) => void

export type NavMenuDeselectHandler<TContent = ComponentContent> = (
  details: NavMenuDeselectDetails<TContent>,
) => void

export interface NavMenuContract<TContent = ComponentContent> {
  items: NavMenuItemContract<TContent>[]
  mode?: NavMenuMode
  theme?: NavMenuTheme
  selectable?: boolean
  multiple?: boolean
  inlineCollapsed?: boolean
  inlineIndent?: number
  selectedKeys?: string[]
  defaultSelectedKeys?: string[]
  openKeys?: string[]
  defaultOpenKeys?: string[]
  triggerSubMenuAction?: 'hover' | 'click'
  onSelect?: NavMenuSelectHandler<TContent>
  onDeselect?: NavMenuDeselectHandler<TContent>
  onOpenChange?: (details: NavMenuOpenChangeDetails) => void
}

/** Synthetic root id used by TreeCollection (not shown in UI). */
export const NAV_ROOT_ID = '__h_nav_root__'

/** Node type consumed by TreeCollection for NavMenu items. */
export type NavMenuCollectionNode<TContent = ComponentContent> = NavMenuItemContract<TContent> & {
  children?: NavMenuCollectionNode<TContent>[]
}

/** Wrap NavMenu items as a single TreeCollection rootNode. */
export function toNavMenuRootNode<TContent = ComponentContent>(
  items: NavMenuItemContract<TContent>[],
): NavMenuCollectionNode<TContent> {
  return {
    key: NAV_ROOT_ID,
    label: '' as TContent,
    children: (items ?? []) as NavMenuCollectionNode<TContent>[],
  }
}
