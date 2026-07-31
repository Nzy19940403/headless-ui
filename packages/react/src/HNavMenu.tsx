import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react'
import { Menu } from '@ark-ui/react/menu'
import { createTreeCollection, useTreeView } from '@ark-ui/react/tree-view'
import type {
  NavMenuContract,
  NavMenuCollectionNode,
  NavMenuItemContract,
  NavMenuOpenChangeDetails,
  NavMenuSelectDetails,
} from '@demo/ui-core'
import { toNavMenuRootNode } from '@demo/ui-core'
import { HTooltip } from './HTooltip'

export interface HNavMenuItem extends NavMenuItemContract<ReactNode> {}

export interface HNavMenuItemRenderState {
  selected: boolean
  open: boolean
  depth: number
  hasChildren: boolean
}

export interface HNavMenuProps extends NavMenuContract<ReactNode> {
  className?: string
  /** Optional React-only label renderer for route links or custom content. */
  renderLabel?: (item: HNavMenuItem, state: HNavMenuItemRenderState) => ReactNode
}

function collectDescendantKeys(item: HNavMenuItem, output: string[] = []) {
  for (const child of item.children ?? []) {
    output.push(child.key)
    collectDescendantKeys(child, output)
  }
  return output
}

function isTextContent(value: ReactNode) {
  return typeof value === 'string' || typeof value === 'number'
}

/** Ant-style navigation menu. Drawer/layout ownership stays with the caller. */
export function HNavMenu({
  items,
  mode = 'vertical',
  theme = 'light',
  selectable = true,
  multiple = false,
  inlineCollapsed = false,
  inlineIndent = 24,
  selectedKeys: selectedKeysProp,
  defaultSelectedKeys = [],
  openKeys: openKeysProp,
  defaultOpenKeys = [],
  triggerSubMenuAction,
  onSelect,
  onDeselect,
  onOpenChange,
  className,
  renderLabel,
}: HNavMenuProps) {
  const [selectedKeysState, setSelectedKeysState] = useState(defaultSelectedKeys)
  const [openKeysState, setOpenKeysState] = useState(defaultOpenKeys)
  // openKeys is the durable navigation state. popupOpenPath is only the
  // currently visible Ark Menu path, so collapsed hover never overwrites the
  // expanded inline state that should be restored later.
  const [popupOpenPath, setPopupOpenPath] = useState<string[]>([])
  const previousInlineCollapsed = useRef(inlineCollapsed)
  const hoverLeaveTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>())
  const selectedKeys = selectedKeysProp ?? selectedKeysState
  const openKeys = openKeysProp ?? openKeysState
  const selectedSet = useMemo(() => new Set(selectedKeys), [selectedKeys])
  const openSet = useMemo(() => new Set(openKeys), [openKeys])
  const collapsed = mode === 'inline' && inlineCollapsed
  const inline = mode === 'inline' && !inlineCollapsed
  const popupMode = !inline
  // Vue's watcher clears popupOpenPath before its render phase. React's
  // passive effect runs after paint, so suppress the stale path during the
  // collapse render as well to avoid flashing the old submenu once.
  const popupOpenPathForRender = collapsed && inlineCollapsed !== previousInlineCollapsed.current
    ? []
    : popupOpenPath
  const submenuAction = collapsed
    ? 'hover'
    : (triggerSubMenuAction ?? (mode === 'inline' ? 'click' : 'hover'))

  // TreeView owns the collection, node state and keyboard/selection semantics.
  // The menu only renders the appropriate TreeView branch or Ark Menu popup;
  // it does not maintain a second tree model of its own.
  const collection = useMemo(() => createTreeCollection<NavMenuCollectionNode<ReactNode>>({
    rootNode: toNavMenuRootNode<ReactNode>(items ?? []),
    nodeToValue: node => node.key,
    nodeToString: node => isTextContent(node.label) ? String(node.label) : '',
    isNodeDisabled: node => Boolean(node.disabled),
  }), [items])

  const tree = useTreeView({
    collection,
    selectionMode: multiple ? 'multiple' : 'single',
    expandOnClick: false,
    expandedValue: inline ? openKeys : [],
    selectedValue: selectedKeys,
    onExpandedChange(details: { expandedValue: string[] }) {
      if (!inline) return
      if (openKeysProp === undefined) setOpenKeysState(details.expandedValue)
      onOpenChange?.({ openKeys: details.expandedValue })
    },
    onSelectionChange(details: { selectedValue: string[] }) {
      if (selectedKeysProp === undefined) setSelectedKeysState(details.selectedValue)
    },
  })

  useEffect(() => {
    if (selectedKeysProp !== undefined) setSelectedKeysState(selectedKeysProp)
  }, [selectedKeysProp])

  useEffect(() => {
    if (openKeysProp !== undefined) setOpenKeysState(openKeysProp)
    if (openKeysProp !== undefined && !collapsed) setPopupOpenPath([...openKeysProp])
  }, [openKeysProp, collapsed])

  function emitOpenChange(next: string[]) {
    if (openKeysProp === undefined) setOpenKeysState(next)
    const details: NavMenuOpenChangeDetails = { openKeys: next }
    onOpenChange?.(details)
  }

  useLayoutEffect(() => {
    if (mode === 'inline' && inlineCollapsed !== previousInlineCollapsed.current) {
      // Keep openKeys as the durable navigation state. Only reset the
      // currently visible popup path while the sidebar is collapsed.
      setPopupOpenPath(inlineCollapsed ? [] : [...openKeys])
    }
    previousInlineCollapsed.current = inlineCollapsed
  }, [inlineCollapsed, mode])

  useEffect(() => () => {
    for (const timer of hoverLeaveTimers.current.values()) clearTimeout(timer)
    hoverLeaveTimers.current.clear()
  }, [])

  function toggleSubMenu(item: HNavMenuItem) {
    if (item.disabled) return
    const descendants = collectDescendantKeys(item)
    const next = openSet.has(item.key)
      ? openKeys.filter(key => key !== item.key && !descendants.includes(key))
      : [...openKeys, item.key]
    emitOpenChange(next)
  }

  function setPopupSubMenuOpen(item: HNavMenuItem, keyPath: string[], open: boolean) {
    if (item.disabled) return
    const descendants = collectDescendantKeys(item)
    if (!open) {
      setPopupOpenPath(current => current.filter(key => key !== item.key && !descendants.includes(key)))
      if (!collapsed) {
        emitOpenChange(openKeys.filter(key => key !== item.key && !descendants.includes(key)))
      }
      return
    }

    // Top-level popup roots are siblings from Ark's point of view. Keep one
    // active path in the public state so moving to another root never leaves
    // its previous popup mounted beside the new one.
    setPopupOpenPath(keyPath)
    if (!collapsed) emitOpenChange([...keyPath])
  }

  function onFirstLevelMouseEnter(item: HNavMenuItem, keyPath: string[]) {
    const timer = hoverLeaveTimers.current.get(item.key)
    if (timer) {
      clearTimeout(timer)
      hoverLeaveTimers.current.delete(item.key)
    }
    if (submenuAction === 'hover') setPopupSubMenuOpen(item, keyPath, true)
  }

  function onFirstLevelMouseLeave(item: HNavMenuItem, keyPath: string[]) {
    if (submenuAction !== 'hover') return
    const timer = setTimeout(() => {
      setPopupSubMenuOpen(item, keyPath, false)
      hoverLeaveTimers.current.delete(item.key)
    }, 100)
    hoverLeaveTimers.current.set(item.key, timer)
  }

  function getNodeState(item: HNavMenuItem): HNavMenuItemRenderState {
    const indexPath = collection.getIndexPath(item.key) ?? []
    const zagState = tree.getNodeState({
      node: item as NavMenuCollectionNode<ReactNode>,
      indexPath,
    })
    return {
      selected: zagState.selected,
      open: popupMode ? popupOpenPathForRender.includes(item.key) : zagState.expanded,
      depth: indexPath.length > 0 ? indexPath.length - 1 : 0,
      hasChildren: zagState.isBranch,
    }
  }

  function handleSelect(item: HNavMenuItem, keyPath: string[]) {
    if (item.disabled || item.type === 'divider' || item.type === 'group' || item.children?.length) return
    if (!selectable) return

    const wasSelected = selectedSet.has(item.key)
    const next = multiple
      ? wasSelected
        ? selectedKeys.filter(key => key !== item.key)
        : [...selectedKeys, item.key]
      : [item.key]

    if (selectedKeysProp === undefined) setSelectedKeysState(next)
    const details: NavMenuSelectDetails<ReactNode> = {
      key: item.key,
      keyPath,
      selectedKeys: next,
      item,
    }
    if (multiple && wasSelected) onDeselect?.(details)
    else onSelect?.(details)
  }

  function handleInlineSelect(item: HNavMenuItem, keyPath: string[], event: MouseEvent<HTMLElement>) {
    if (item.children?.length) {
      event.preventDefault()
      if (submenuAction === 'click') toggleSubMenu(item)
      return
    }
    handleSelect(item, keyPath)
  }

  function handleKeyDown(item: HNavMenuItem, event: KeyboardEvent<HTMLElement>) {
    if (item.disabled) return
    if (event.key === 'ArrowRight' && item.children?.length && !openSet.has(item.key)) {
      event.preventDefault()
      toggleSubMenu(item)
    } else if (event.key === 'ArrowLeft' && item.children?.length && openSet.has(item.key)) {
      event.preventDefault()
      toggleSubMenu(item)
    }
  }

  function renderItemContent(item: HNavMenuItem, state: HNavMenuItemRenderState, showIndicator = true) {
    const label = renderLabel ? renderLabel(item, state) : item.label
    return (
      <>
        {item.icon ? <span className="ui-nav-menu__item-icon" aria-hidden="true">{item.icon}</span> : null}
        <span className="ui-nav-menu__item-label">{label}</span>
        {item.extra ? <span className="ui-nav-menu__item-extra">{item.extra}</span> : null}
        {showIndicator && state.hasChildren ? <span className="ui-nav-menu__submenu-indicator" aria-hidden="true">{state.open ? '▾' : '▸'}</span> : null}
      </>
    )
  }

  function getItemClass(item: HNavMenuItem, selected: boolean, hasChildren: boolean) {
    return [
      'ui-nav-menu__item-trigger',
      hasChildren ? 'ui-nav-menu__item-trigger--submenu' : '',
      selected ? 'ui-nav-menu__item-trigger--selected' : '',
      item.danger ? 'ui-nav-menu__item-trigger--danger' : '',
      item.disabled ? 'ui-nav-menu__item-trigger--disabled' : '',
    ].filter(Boolean).join(' ')
  }

  function renderInlineItems(entries: HNavMenuItem[], ancestors: string[] = [], depth = 0): ReactNode {
    return entries.map(item => {
      const type = item.type ?? 'item'
      const keyPath = [...ancestors, item.key]
      if (type === 'divider') return <li key={item.key} className="ui-nav-menu__divider" role="separator" />
      if (type === 'group') {
        return (
          <li key={item.key} className="ui-nav-menu__group" role="group">
            <div className="ui-nav-menu__group-title ui-nav-menu__sidebar-group-title">{item.label}</div>
            <ul className="ui-nav-menu__list ui-nav-menu__list--group ui-nav-menu__sidebar-list" role="menu">
              {renderInlineItems(item.children ?? [], keyPath, depth)}
            </ul>
          </li>
        )
      }

      const state = getNodeState(item)
      const hasChildren = state.hasChildren
      const selected = state.selected
      const open = state.open
      const content = renderItemContent(item, state)
      const triggerProps = {
        className: `${getItemClass(item, selected, hasChildren)} ui-nav-menu__sidebar-trigger`,
        type: 'button' as const,
        disabled: item.disabled,
        'aria-expanded': hasChildren ? open : undefined,
        'aria-current': selected ? ('page' as const) : undefined,
        'data-menu-item-key': item.key,
        onClick: (event: MouseEvent<HTMLElement>) => handleInlineSelect(item, keyPath, event),
        onKeyDown: (event: KeyboardEvent<HTMLElement>) => handleKeyDown(item, event),
      }
      const trigger = hasChildren || !item.href ? (
        <button {...triggerProps}>{content}</button>
      ) : (
        <a {...triggerProps} href={item.href}>{content}</a>
      )

      return (
        <li
          key={item.key}
          className="ui-nav-menu__item"
          role="none"
          style={{ '--ui-nav-menu-depth': depth, '--ui-nav-menu-indent': `${inlineIndent}px` } as CSSProperties}
          data-open={open ? 'true' : 'false'}
          data-selected={selected ? 'true' : undefined}
        >
          {trigger}
          {hasChildren ? (
            <ul className="ui-nav-menu__list ui-nav-menu__submenu" role="group" hidden={!open}>
              {renderInlineItems(item.children ?? [], keyPath, depth + 1)}
            </ul>
          ) : null}
        </li>
      )
    })
  }

  function renderPopupLeaf(item: HNavMenuItem, keyPath: string[], depth: number): ReactNode {
    const state = getNodeState(item)
    const selected = state.selected
    const className = getItemClass(item, selected, false)
    const content = renderItemContent(item, state, false)
    const onSelectItem = () => handleSelect(item, keyPath)
    if (item.href) {
      return <Menu.Item key={item.key} value={item.key} disabled={item.disabled} className={className} asChild onSelect={onSelectItem}><a href={item.href}>{content}</a></Menu.Item>
    }
    return <Menu.Item key={item.key} value={item.key} disabled={item.disabled} className={className} onSelect={onSelectItem}>{content}</Menu.Item>
  }

  function renderPopupEntries(entries: HNavMenuItem[], ancestors: string[] = [], depth = 0): ReactNode {
    return entries.map(item => {
      const type = item.type ?? 'item'
      const keyPath = [...ancestors, item.key]
      if (type === 'divider') {
        return depth === 0
          ? <li key={item.key} className="ui-nav-menu__divider" role="separator" />
          : <Menu.Separator key={item.key} className="ui-nav-menu__divider" />
      }
      if (type === 'group') {
        if (depth === 0) {
          return (
            <li key={item.key} className="ui-nav-menu__group" role="group">
              <div className="ui-nav-menu__group-title ui-nav-menu__sidebar-group-title">{item.label}</div>
              <ul className="ui-nav-menu__list ui-nav-menu__list--group ui-nav-menu__sidebar-list" role="menu">
                {renderPopupEntries(item.children ?? [], keyPath, depth)}
              </ul>
            </li>
          )
        }
        return (
          <Menu.ItemGroup key={item.key} className="ui-nav-menu__group">
            <Menu.ItemGroupLabel className="ui-nav-menu__group-title">{item.label}</Menu.ItemGroupLabel>
            {renderPopupEntries(item.children ?? [], keyPath, depth)}
          </Menu.ItemGroup>
        )
      }

      const state = getNodeState(item)
      const hasChildren = state.hasChildren
      const selected = state.selected
      const open = state.open
      const popupOpen = popupMode ? popupOpenPathForRender.includes(item.key) : open
      const popupState = { ...state, open: popupOpen }
      const content = renderItemContent(item, popupState)

      if (!hasChildren) {
        if (depth === 0) {
          const closeSiblingPopup = () => {
            if (submenuAction === 'hover') {
              setPopupOpenPath([])
              if (!collapsed && openKeys.length) emitOpenChange([])
            }
          }
          const trigger = item.href ? (
            <a href={item.href} className={`${getItemClass(item, selected, false)} ui-nav-menu__sidebar-trigger`} onMouseEnter={closeSiblingPopup} onClick={event => { if (item.disabled) event.preventDefault(); else handleSelect(item, keyPath) }}>{content}</a>
          ) : (
            <button type="button" className={`${getItemClass(item, selected, false)} ui-nav-menu__sidebar-trigger`} disabled={item.disabled} onMouseEnter={closeSiblingPopup} onClick={() => handleSelect(item, keyPath)}>{content}</button>
          )
          const wrappedTrigger = collapsed && (item.title || isTextContent(item.label)) ? (
            <HTooltip content={item.title ?? String(item.label ?? '')} positioning="right">
              {trigger}
            </HTooltip>
          ) : trigger
          return <li key={item.key} className="ui-nav-menu__item" role="none">{wrappedTrigger}</li>
        }
        return renderPopupLeaf(item, keyPath, depth)
      }

      const openChange = (details: { open: boolean }) => setPopupSubMenuOpen(item, keyPath, details.open)
      if (depth === 0) {
        return (
          <li
            key={item.key}
            className="ui-nav-menu__item"
            role="none"
            data-open={popupOpen ? 'true' : 'false'}
            onMouseEnter={() => onFirstLevelMouseEnter(item, keyPath)}
            onMouseLeave={() => onFirstLevelMouseLeave(item, keyPath)}
          >
            <Menu.Root open={popupOpen} onOpenChange={openChange} positioning={{ placement: mode === 'horizontal' ? 'bottom-start' : 'right-start', gutter: 4 }}>
              <Menu.Trigger asChild>
                <button type="button" className={`${getItemClass(item, selected, true)} ui-nav-menu__sidebar-trigger`} disabled={item.disabled} aria-expanded={popupOpen}>
                  {content}
                </button>
              </Menu.Trigger>
              <Menu.Positioner className="ui-nav-menu__popup-positioner">
                <Menu.Content className="ui-nav-menu__popup-content">
                  {renderPopupEntries(item.children ?? [], keyPath, depth + 1)}
                </Menu.Content>
              </Menu.Positioner>
            </Menu.Root>
          </li>
        )
      }

      return (
        <Menu.Root key={item.key} onOpenChange={openChange} positioning={{ placement: 'right-start', gutter: -2 }}>
          <Menu.TriggerItem className={getItemClass(item, selected, true)} data-value={item.key}>
            {content}
          </Menu.TriggerItem>
          <Menu.Positioner className="ui-nav-menu__popup-positioner">
            <Menu.Content className="ui-nav-menu__popup-content">
              {renderPopupEntries(item.children ?? [], keyPath, depth + 1)}
            </Menu.Content>
          </Menu.Positioner>
        </Menu.Root>
      )
    })
  }

  function renderPopupItems() {
    return (
      <ul className="ui-nav-menu__list ui-nav-menu__sidebar-list" role="menu">
        {renderPopupEntries(items)}
      </ul>
    )
  }

  return (
    <nav
      className={['ui-nav-menu', `ui-nav-menu--${mode}`, `ui-nav-menu--${theme}`, collapsed ? 'ui-nav-menu--collapsed' : '', className].filter(Boolean).join(' ')}
      aria-label="Navigation menu"
      data-mode={mode}
      data-theme={theme}
      data-collapsed={collapsed ? 'true' : 'false'}
    >
      {inline ? <ul className="ui-nav-menu__list ui-nav-menu__sidebar-list" role="menu">{renderInlineItems(items)}</ul> : renderPopupItems()}
    </nav>
  )
}
