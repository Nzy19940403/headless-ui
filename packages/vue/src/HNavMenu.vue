<script lang="ts">
import {
  computed,
  defineComponent,
  h,
  ref,
  watch,
  type PropType,
  type VNode,
} from 'vue'
import {
  createTreeCollection,
  useTreeView,
} from '@ark-ui/vue/tree-view'
import {
  MenuContent,
  MenuItem,
  MenuItemGroup,
  MenuItemGroupLabel,
  MenuPositioner,
  MenuRoot,
  MenuSeparator,
  MenuTrigger,
  MenuTriggerItem,
} from '@ark-ui/vue/menu'
import {
  TooltipContent,
  TooltipPositioner,
  TooltipRoot,
  TooltipTrigger,
} from '@ark-ui/vue/tooltip'
import type {
  NavMenuItemContract,
  NavMenuMode,
  NavMenuTheme,
  NavMenuSelectDetails,
  NavMenuDeselectDetails,
  NavMenuOpenChangeDetails,
  NavMenuCollectionNode,
} from '@demo/ui-core'
import { toNavMenuRootNode } from '@demo/ui-core'

interface NavMenuRenderState {
  selected: boolean
  open: boolean
  depth: number
  hasChildren: boolean
}

/**
 * Vue HNavMenu — Ant Design-style navigation menu.
 *
 * Architecture:
 *   TreeView machine → state management (selectedKeys, openKeys, focus)
 *   Ark Menu          → submenu popup positioning & nested routing
 *
 * Open/close strategy:
 *   - First-level MenuRoot uses controlled `open` (hover action needs programmatic open).
 *     Hover-leave close debounce is via mouseenter/mouseleave on the <li> wrapper.
 *   - Nested MenuRoot (depth ≥ 1) is fully uncontrolled — Zag's built-in 200ms open
 *     delay, 100ms close delay, intent polygon, and pointer routing handle everything.
 *     `onOpenChange` is used only to sync `popupOpenPath` for arrow indicators.
 *
 * Modes:
 *   inline    — TreeView expand/collapse, indentation via CSS variables
 *   vertical  — top-level vertical, submenus as Ark Menu floating panels
 *   horizontal— top-level flex row, submenus as Ark Menu floating panels
 *   collapsed — inline + collapsed CSS, submenus on hover via Ark Menu
 */
export default defineComponent({
  name: 'HNavMenu',
  props: {
    items: { type: Array as PropType<NavMenuItemContract[]>, required: true },
    mode: { type: String as PropType<NavMenuMode>, default: 'vertical' },
    theme: { type: String as PropType<NavMenuTheme>, default: 'light' },
    selectable: { type: Boolean, default: true },
    multiple: { type: Boolean, default: false },
    inlineCollapsed: { type: Boolean, default: false },
    inlineIndent: { type: Number, default: 24 },
    selectedKeys: { type: Array as PropType<string[]>, default: undefined },
    defaultSelectedKeys: { type: Array as PropType<string[]>, default: () => [] },
    openKeys: { type: Array as PropType<string[]>, default: undefined },
    defaultOpenKeys: { type: Array as PropType<string[]>, default: () => [] },
    triggerSubMenuAction: { type: String as PropType<'hover' | 'click'>, default: undefined },
    renderLabel: { type: Function as PropType<(item: NavMenuItemContract, state: NavMenuRenderState) => any>, default: undefined },
    class: { type: String, default: undefined },
  },
  emits: {
    select: (details: NavMenuSelectDetails) => true,
    deselect: (details: NavMenuDeselectDetails) => true,
    'open-change': (details: NavMenuOpenChangeDetails) => true,
  },
  setup(props, { emit }) {
    // ---- Local state ----
    const selectedKeysLocal = ref<string[]>([...(props.defaultSelectedKeys ?? [])])
    const openKeysLocal = ref<string[]>([...(props.defaultOpenKeys ?? [])])

    // openKeys is the durable navigation state (persists collapse/expand).
    // popupOpenPath tracks which menu popups are currently visible.
    const popupOpenPath = ref<string[]>([])

    // ---- Controlled-prop sync ----
    watch(
      () => props.selectedKeys,
      v => { if (v !== undefined) selectedKeysLocal.value = [...v] },
    )
    watch(
      () => props.openKeys,
      v => { if (v !== undefined) openKeysLocal.value = [...v] },
    )

    const selectedKeys = computed(() => props.selectedKeys ?? selectedKeysLocal.value)
    const openKeys = computed(() => props.openKeys ?? openKeysLocal.value)
    const selectedSet = computed(() => new Set(selectedKeys.value))
    const openSet = computed(() => new Set(openKeys.value))

    const collapsed = computed(() => props.mode === 'inline' && props.inlineCollapsed)
    const isInline = computed(() => props.mode === 'inline' && !props.inlineCollapsed)
    const isPopup = computed(() => !isInline.value)

    const submenuAction = computed(() => {
      if (collapsed.value) return 'hover'
      if (props.triggerSubMenuAction) return props.triggerSubMenuAction
      if (isInline.value) return 'click'
      return 'hover'
    })

    // ---- TreeView collection & composable ----
    const collection = computed(() =>
      createTreeCollection<NavMenuCollectionNode>({
        rootNode: toNavMenuRootNode(props.items ?? []),
        nodeToValue: n => n.key,
        nodeToString: n => (typeof n.label === 'string' ? n.label : ''),
        isNodeDisabled: n => Boolean(n.disabled),
      }),
    )

    const tree = useTreeView(
      computed(() => ({
        collection: collection.value,
        selectionMode: props.multiple ? 'multiple' : 'single',
        expandOnClick: false,
        expandedValue: isInline.value ? openKeys.value : [],
        selectedValue: selectedKeys.value,
        onExpandedChange(details: { expandedValue: string[] }) {
          if (!isInline.value) return
          if (props.openKeys === undefined) openKeysLocal.value = details.expandedValue
          emit('open-change', { openKeys: details.expandedValue })
        },
        onSelectionChange(details: { selectedValue: string[] }) {
          if (props.selectedKeys === undefined) selectedKeysLocal.value = details.selectedValue
        },
      })),
    )

    // ---- Collapse / expand transitions ----
    watch([() => props.inlineCollapsed, () => props.mode], ([nowCollapsed]) => {
      if (nowCollapsed) {
        popupOpenPath.value = []
      } else {
        popupOpenPath.value = [...openKeys.value]
      }
    })

    // ---- Utility functions ----

    function isTextContent(value: unknown): boolean {
      return typeof value === 'string' || typeof value === 'number'
    }

    function isBranch(item: NavMenuItemContract): boolean {
      return Boolean(item.children?.length)
    }

    function collectDescendantKeys(item: NavMenuItemContract): string[] {
      const keys: string[] = []
      for (const child of item.children ?? []) {
        keys.push(child.key)
        keys.push(...collectDescendantKeys(child))
      }
      return keys
    }

    function asTreeNode(item: NavMenuItemContract): NavMenuCollectionNode {
      return item as NavMenuCollectionNode
    }

    function getNodeIndexPath(item: NavMenuItemContract): number[] {
      return collection.value.getIndexPath(item.key) ?? []
    }

    /** Resolve render state from TreeView machine. */
    function getNodeState(item: NavMenuItemContract): NavMenuRenderState {
      const indexPath = getNodeIndexPath(item)
      const zagState = tree.value.getNodeState({ node: asTreeNode(item), indexPath })
      const open = isPopup.value
        ? popupOpenPath.value.includes(item.key)
        : zagState.expanded
      return {
        selected: zagState.selected,
        open,
        depth: indexPath.length > 0 ? indexPath.length - 1 : 0,
        hasChildren: zagState.isBranch,
      }
    }

    // ---- State mutations ----

    function handleItemSelect(item: NavMenuItemContract, keyPath: string[]) {
      if (item.disabled || item.type === 'divider' || item.type === 'group') return
      if (isBranch(item)) return
      if (!props.selectable) return

      const wasSelected = selectedSet.value.has(item.key)
      let next: string[]
      if (props.multiple) {
        next = wasSelected
          ? selectedKeys.value.filter(k => k !== item.key)
          : [...selectedKeys.value, item.key]
      } else {
        next = [item.key]
      }
      if (props.selectedKeys === undefined) selectedKeysLocal.value = next
      if (props.multiple && wasSelected) {
        emit('deselect', { key: item.key, keyPath, selectedKeys: next, item })
      } else {
        emit('select', { key: item.key, keyPath, selectedKeys: next, item })
      }
    }

    function toggleInlineBranch(item: NavMenuItemContract) {
      if (item.disabled) return
      const descendants = collectDescendantKeys(item)
      const wasOpen = openSet.value.has(item.key)
      const next = wasOpen
        ? openKeys.value.filter(k => k !== item.key && !descendants.includes(k))
        : [...openKeys.value, item.key]
      if (props.openKeys === undefined) openKeysLocal.value = next
      emit('open-change', { openKeys: next })
    }

    function setPopupSubMenuOpen(item: NavMenuItemContract, keyPath: string[], open: boolean) {
      if (item.disabled) return
      const descendants = collectDescendantKeys(item)
      if (!open) {
        popupOpenPath.value = popupOpenPath.value.filter(
          k => k !== item.key && !descendants.includes(k),
        )
        if (!collapsed.value) {
          const next = openKeys.value.filter(k => k !== item.key && !descendants.includes(k))
          if (props.openKeys === undefined) openKeysLocal.value = next
          emit('open-change', { openKeys: next })
        }
        return
      }
      popupOpenPath.value = keyPath
      if (!collapsed.value) {
        if (props.openKeys === undefined) openKeysLocal.value = [...keyPath]
        emit('open-change', { openKeys: [...keyPath] })
      }
    }

    /** Close all sibling popups at the same depth (used when hovering a leaf item). */
    function closeSiblingPopups() {
      if (submenuAction.value === 'hover') {
        popupOpenPath.value = []
        if (!collapsed.value && openKeys.value.length) {
          if (props.openKeys === undefined) openKeysLocal.value = []
          emit('open-change', { openKeys: [] })
        }
      }
    }

    // ---- First-level hover-leave debounce ----
    //
    // Only applies when submenuAction === 'hover' at depth 0.
    // Ark Menu's built-in close delay handles nested submenus (depth ≥ 1) because
    // those use MenuTriggerItem + uncontrolled mode.

    const hoverLeaveTimers = new Map<string, ReturnType<typeof setTimeout>>()

    function onFirstLevelMouseEnter(item: NavMenuItemContract, keyPath: string[]) {
      const t = hoverLeaveTimers.get(item.key)
      if (t) { clearTimeout(t); hoverLeaveTimers.delete(item.key) }
      if (submenuAction.value === 'hover') {
        setPopupSubMenuOpen(item, keyPath, true)
      }
    }

    function onFirstLevelMouseLeave(item: NavMenuItemContract, keyPath: string[]) {
      if (submenuAction.value !== 'hover') return
      // Debounce: wait 100ms before closing.
      // If mouse re-enters within that window, onFirstLevelMouseEnter cancels it.
      const timer = setTimeout(() => {
        setPopupSubMenuOpen(item, keyPath, false)
        hoverLeaveTimers.delete(item.key)
      }, 100)
      hoverLeaveTimers.set(item.key, timer)
    }

    // ---- Render helpers ----

    function renderItemContent(
      item: NavMenuItemContract,
      state: NavMenuRenderState,
      showIndicator = true,
    ): VNode[] {
      const children: VNode[] = []
      if (item.icon) {
        children.push(h('span', { class: 'ui-nav-menu__item-icon', 'aria-hidden': true }, [item.icon as any]))
      }
      const label = props.renderLabel ? props.renderLabel(item, state) : item.label
      children.push(h('span', { class: 'ui-nav-menu__item-label' }, [label as any]))
      if (item.extra) {
        children.push(h('span', { class: 'ui-nav-menu__item-extra' }, [item.extra as any]))
      }
      if (showIndicator && state.hasChildren) {
        children.push(
          h('span', { class: 'ui-nav-menu__submenu-indicator', 'aria-hidden': true }, [
            state.open ? '▾' : '▸',
          ]),
        )
      }
      return children
    }

    function buildTriggerClass(
      item: NavMenuItemContract,
      state: NavMenuRenderState,
      sidebar: boolean,
    ): string {
      return [
        'ui-nav-menu__item-trigger',
        state.hasChildren ? 'ui-nav-menu__item-trigger--submenu' : '',
        state.selected ? 'ui-nav-menu__item-trigger--selected' : '',
        item.danger ? 'ui-nav-menu__item-trigger--danger' : '',
        item.disabled ? 'ui-nav-menu__item-trigger--disabled' : '',
        sidebar ? 'ui-nav-menu__sidebar-trigger' : '',
      ].filter(Boolean).join(' ')
    }

    function makeKeyPath(ancestors: string[], item: NavMenuItemContract): string[] {
      return [...ancestors, item.key]
    }

    /** Wrap a VNode in Ark Tooltip when collapsed and item has text label/title. */
    function wrapWithTooltip(
      item: NavMenuItemContract,
      triggerVNode: VNode,
    ): VNode {
      if (!collapsed.value) return triggerVNode
      const label = item.title ?? (isTextContent(item.label) ? String(item.label) : null)
      if (!label) return triggerVNode
      return h(TooltipRoot, {
        positioning: { placement: 'right' as const },
      }, { default: () => [
        h(TooltipTrigger, { asChild: true }, { default: () => triggerVNode }),
        h(TooltipPositioner, null, { default: () => [
          h(TooltipContent, { class: 'ui-tooltip' }, { default: () => label }),
        ]}),
      ]})
    }

    // ---- Inline mode render ----

    function renderInlineItems(
      entries: NavMenuItemContract[],
      ancestors: string[] = [],
      depth = 0,
    ): VNode[] {
      return entries.map(item => {
        const type = item.type ?? 'item'
        const keyPath = makeKeyPath(ancestors, item)

        if (type === 'divider') {
          return h('li', { key: item.key, class: 'ui-nav-menu__divider', role: 'separator' })
        }
        if (type === 'group') {
          return h('li', { key: item.key, class: 'ui-nav-menu__group', role: 'group' }, [
            h('div', { class: 'ui-nav-menu__group-title ui-nav-menu__sidebar-group-title' }, [item.label as any]),
            h('ul', { class: 'ui-nav-menu__list ui-nav-menu__list--group ui-nav-menu__sidebar-list', role: 'menu' },
              renderInlineItems(item.children ?? [], keyPath, depth),
            ),
          ])
        }

        const hasChildren = isBranch(item)
        const state = getNodeState(item)
        const triggerClass = buildTriggerClass(item, state, true)
        const content = renderItemContent(item, state, hasChildren)
        const liStyle: Record<string, string> = {
          '--ui-nav-menu-depth': String(depth),
          '--ui-nav-menu-indent': `${props.inlineIndent}px`,
        }

        // Branch
        if (hasChildren) {
          const isOpen = state.open

          return h('li', {
            key: item.key,
            class: 'ui-nav-menu__item',
            role: 'none',
            style: liStyle,
            'data-open': isOpen ? 'true' : 'false',
            'data-selected': state.selected ? 'true' : undefined,
          }, [
            h('button', {
              type: 'button',
              class: triggerClass,
              disabled: item.disabled,
              'aria-expanded': isOpen,
              'aria-current': state.selected ? 'page' : undefined,
              onClick: (e: MouseEvent) => { e.stopPropagation(); toggleInlineBranch(item) },
              onKeydown: (e: KeyboardEvent) => handleInlineKeyDown(e, item, keyPath),
            }, content),
            h('ul', {
              class: 'ui-nav-menu__list ui-nav-menu__submenu',
              role: 'group',
              hidden: !isOpen,
            }, renderInlineItems(item.children ?? [], keyPath, depth + 1)),
          ])
        }

        // Leaf
        const tag = item.href ? 'a' : 'button'
        const leafProps: Record<string, unknown> = {
          class: triggerClass,
          disabled: item.disabled,
        }
        if (item.href) {
          leafProps.href = item.href
          leafProps['aria-current'] = state.selected ? 'page' : undefined
        } else {
          leafProps.type = 'button'
        }
        leafProps.onClick = () => handleItemSelect(item, keyPath)
        leafProps.onKeydown = (e: KeyboardEvent) => handleInlineKeyDown(e, item, keyPath)

        return h('li', {
          key: item.key,
          class: 'ui-nav-menu__item',
          role: 'none',
          style: liStyle,
          'data-selected': state.selected ? 'true' : undefined,
        }, [h(tag, leafProps, renderItemContent(item, state, false))])
      })
    }

    // ---- Popup mode: nested children rendered inside Ark Menu ----

    function renderPopupLeaf(item: NavMenuItemContract, keyPath: string[]): VNode {
      const state = getNodeState(item)
      const triggerClass = buildTriggerClass(item, state, false)
      const content = renderItemContent(item, state, false)

      if (item.href) {
        return h(MenuItem, {
          key: item.key,
          value: item.key,
          disabled: item.disabled,
          class: triggerClass,
          asChild: true,
          onSelect: () => handleItemSelect(item, keyPath),
        }, { default: () => h('a', { href: item.href }, content) })
      }
      return h(MenuItem, {
        key: item.key,
        value: item.key,
        disabled: item.disabled,
        class: triggerClass,
        onSelect: () => handleItemSelect(item, keyPath),
      }, { default: () => content })
    }

    /**
     * Nested popup children (depth ≥ 1).
     * MenuRoot is UNCONTROLLED — no `open` prop.
     * Zag handles: 200ms open delay, 100ms close delay, intent polygon, pointer routing.
     * `onOpenChange` syncs `popupOpenPath` for arrow indicators only.
     */
    function renderPopupChildren(
      entries: NavMenuItemContract[],
      keyPath: string[],
      depth: number,
    ): VNode[] {
      return entries.map(item => {
        const type = item.type ?? 'item'

        // Divider
        if (type === 'divider') {
          return h(MenuSeparator, { key: item.key, class: 'ui-nav-menu__divider' })
        }

        // Group
        if (type === 'group') {
          return h(MenuItemGroup, { key: item.key, class: 'ui-nav-menu__group' }, { default: () => [
            h(MenuItemGroupLabel, { key: `${item.key}__label`, class: 'ui-nav-menu__group-title' }, { default: () => item.label as any }),
            ...renderPopupChildren(item.children ?? [], keyPath, depth),
          ]})
        }

        const hasChildren = isBranch(item)
        const childKeyPath = makeKeyPath(keyPath, item)
        const state = getNodeState(item)
        const triggerClass = buildTriggerClass(item, state, false)
        const content = renderItemContent(item, state, true)

        // Leaf
        if (!hasChildren) {
          return renderPopupLeaf(item, childKeyPath)
        }

        // Nested branch — uncontrolled MenuRoot
        return h(MenuRoot, {
          key: item.key,
          onOpenChange: (details: { open: boolean }) => {
            setPopupSubMenuOpen(item, childKeyPath, details.open)
          },
          positioning: { placement: 'right-start' as const, gutter: -2 },
        }, { default: () => [
          h(MenuTriggerItem, {
            class: triggerClass,
            'data-value': item.key,
            disabled: item.disabled,
          }, { default: () => content }),
          h(MenuPositioner, { class: 'ui-nav-menu__popup-positioner' }, { default: () => [
            h(MenuContent, { class: 'ui-nav-menu__popup-content' }, { default: () =>
              renderPopupChildren(item.children ?? [], childKeyPath, depth + 1),
            }),
          ]}),
        ]})
      })
    }

    // ---- Popup mode: first-level items ----

    function renderPopupEntries(
      entries: NavMenuItemContract[],
      ancestors: string[] = [],
      depth = 0,
    ): VNode[] {
      return entries.map(item => {
        const type = item.type ?? 'item'
        const keyPath = makeKeyPath(ancestors, item)

        // First-level divider
        if (type === 'divider') {
          return h('li', { key: item.key, class: 'ui-nav-menu__divider', role: 'separator' })
        }

        // First-level group
        if (type === 'group') {
          return h('li', { key: item.key, class: 'ui-nav-menu__group', role: 'group' }, [
            h('div', { class: 'ui-nav-menu__group-title ui-nav-menu__sidebar-group-title' }, [item.label as any]),
            h('ul', { class: 'ui-nav-menu__list ui-nav-menu__list--group ui-nav-menu__sidebar-list', role: 'menu' },
              renderPopupEntries(item.children ?? [], keyPath, depth),
            ),
          ])
        }

        const hasChildren = isBranch(item)
        const state = getNodeState(item)
        const triggerClass = buildTriggerClass(item, state, true)
        const content = renderItemContent(item, state, hasChildren)

        // First-level leaf
        if (!hasChildren) {
          const closeSibling = () => closeSiblingPopups()
          const tag = item.href ? 'a' : 'button'
          const leafProps: Record<string, unknown> = {
            class: triggerClass,
            disabled: item.disabled,
          }
          if (item.href) {
            leafProps.href = item.href
            leafProps['aria-current'] = state.selected ? 'page' : undefined
          } else {
            leafProps.type = 'button'
          }
          leafProps.onClick = () => handleItemSelect(item, keyPath)
          leafProps.onMouseenter = closeSibling

          const trigger = h(tag, leafProps, renderItemContent(item, state, false))

          return h('li', { key: item.key, class: 'ui-nav-menu__item', role: 'none' }, [
            wrapWithTooltip(item, trigger),
          ])
        }

        // ---- First-level branch ----
        //
        // Controlled `open` is needed here because hover action requires
        // programmatic open via mouseenter. The <li> wrapper handles
        // hover-leave close debounce via onMouseenter/onMouseleave.
        //
        // Ark Menu still handles: click-outside dismiss, Escape key, focus management,
        // and nested submenu pointer routing (via uncontrolled MenuTriggerItem children).
        const isOpen = state.open

        return h('li', {
          key: item.key,
          class: 'ui-nav-menu__item',
          role: 'none',
          'data-open': isOpen ? 'true' : 'false',
          onMouseenter: () => onFirstLevelMouseEnter(item, keyPath),
          onMouseleave: () => onFirstLevelMouseLeave(item, keyPath),
        }, [
          h(MenuRoot, {
            open: isOpen,
            onOpenChange: (details: { open: boolean }) => {
              setPopupSubMenuOpen(item, keyPath, details.open)
            },
            positioning: {
              placement: props.mode === 'horizontal' ? 'bottom-start' as const : 'right-start' as const,
              gutter: 4,
            },
          }, { default: () => [
            h(MenuTrigger, { asChild: true }, { default: () =>
              h('button', {
                type: 'button',
                class: triggerClass,
                disabled: item.disabled,
                'aria-expanded': isOpen,
                'aria-haspopup': 'menu',
              }, content),
            }),
            h(MenuPositioner, { class: 'ui-nav-menu__popup-positioner' }, { default: () => [
              h(MenuContent, { class: 'ui-nav-menu__popup-content' }, { default: () =>
                renderPopupChildren(item.children ?? [], keyPath, depth + 1),
              }),
            ]}),
          ]}),
        ])
      })
    }

    // ---- Keyboard navigation for inline mode ----
    function handleInlineKeyDown(
      e: KeyboardEvent,
      item: NavMenuItemContract,
      keyPath: string[],
    ) {
      if (item.disabled) return
      const hasChildren = isBranch(item)
      const isOpen = openSet.value.has(item.key)

      if (e.key === 'ArrowRight' && hasChildren && !isOpen) {
        e.preventDefault()
        toggleInlineBranch(item)
      } else if (e.key === 'ArrowLeft' && hasChildren && isOpen) {
        e.preventDefault()
        toggleInlineBranch(item)
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        if (hasChildren) {
          toggleInlineBranch(item)
        } else {
          handleItemSelect(item, keyPath)
        }
      }
    }

    // ---- Main render ----

    const navClasses = computed(() => [
      'ui-nav-menu',
      `ui-nav-menu--${props.mode}`,
      `ui-nav-menu--${props.theme}`,
      collapsed.value ? 'ui-nav-menu--collapsed' : '',
      props.class ?? '',
    ].filter(Boolean).join(' '))

    return () => {
      return h('nav', {
        class: navClasses.value,
        'aria-label': 'Navigation menu',
        'data-mode': props.mode,
        'data-theme': props.theme,
        'data-collapsed': collapsed.value ? 'true' : 'false',
      }, [
        isInline.value
          ? h('ul', {
              class: 'ui-nav-menu__list ui-nav-menu__sidebar-list',
              role: 'menu',
            }, renderInlineItems(props.items ?? []))
          : h('ul', {
              class: 'ui-nav-menu__list ui-nav-menu__sidebar-list',
              role: 'menu',
            }, renderPopupEntries(props.items ?? [])),
      ])
    }
  },
})
</script>
