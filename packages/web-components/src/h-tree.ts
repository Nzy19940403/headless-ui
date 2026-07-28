import * as treeView from '@zag-js/tree-view'
import { VanillaMachine, normalizeProps, spreadProps } from '@zag-js/vanilla'
import {
  Virtualizer,
  elementScroll,
  observeElementOffset,
  observeElementRect,
} from '@tanstack/virtual-core'
import type {
  TreeExpandedChangeDetails,
  TreeNodeContract,
  TreeSelectionChangeDetails,
  TreeSelectionMode,
} from '@demo/ui-core'
import {
  TREE_ROOT_ID,
  resolveTreeHeight,
  toTreeRootNode,
  treeRowPaddingLeft,
} from '@demo/ui-core'
import {
  asDetailHandler,
  defineOnce,
  emitDetail,
  upgradeDetailHandlerProperties,
  upgradeProperty,
  type Cleanup,
  type DetailHandler,
} from './compound'

/**
 * h-tree — Zag.js TreeView + TanStack Virtual (architecture aligned with design).
 *
 * Architecture:
 *   nodes → treeView.collection (synthetic root)
 *        → VanillaMachine(treeView.machine)
 *        → connect(machine.service)  // same pattern as h-select
 *        → getVisibleNodes() flat list (filter synthetic ROOT)
 *        → @tanstack/virtual-core window
 *        → spreadProps(getBranchControlProps | getItemProps)
 *
 * Reliability rules learned the hard way:
 * 1. connect(machine.service), never connect(machine) wrapper only by accident —
 *    both can work for some APIs, but always match h-select: machine.service.
 * 2. Do NOT replaceChildren on every subscribe (focus ticks steal click target).
 *    Full paint only when visible-id list changes; selection/focus only patch attrs.
 * 3. Virtualizer may return [] before layout — use initialRect + first-page fallback.
 * 4. Apply padding AFTER spreadProps (item style is only --depth and wipes padding).
 * 5. Leaf and branch share base padding; leaf keeps empty chevron slot for alignment.
 */

type CollectionNode = TreeNodeContract & { children?: CollectionNode[] }
type VisibleEntry = { node: CollectionNode; indexPath: number[] }

const json = {
  parse<T>(raw: string | null): T | undefined {
    if (raw == null || raw === '') return undefined
    try {
      return JSON.parse(raw) as T
    } catch {
      return undefined
    }
  },
}

export class HTree extends HTMLElement {
  static observedAttributes = [
    'label',
    'selection-mode',
    'height',
    'row-height',
    'overscan',
    'virtual',
    'expand-on-click',
    'nodes',
    'expanded-value',
    'selected-value',
    'default-expanded-value',
    'default-selected-value',
  ]

  #nodes: TreeNodeContract[] = []
  #label = ''
  #selectionMode: TreeSelectionMode = 'single'
  #height: number | string = 360
  #rowHeight = 32
  #overscan = 8
  #virtual = true
  #expandOnClick = true
  #expandedValue: string[] | undefined
  #selectedValue: string[] | undefined
  #defaultExpanded: string[] = []
  #defaultSelected: string[] = []

  #onExpandedChange?: DetailHandler<TreeExpandedChangeDetails>
  #onSelectionChange?: DetailHandler<TreeSelectionChangeDetails>

  #machine?: VanillaMachine<any>
  #unsub?: Cleanup
  #labelEl?: HTMLDivElement
  #treeEl?: HTMLDivElement
  #viewport?: HTMLDivElement
  #spacer?: HTMLDivElement
  #virtualizer?: Virtualizer<HTMLDivElement, Element>
  #unmountVirtual?: Cleanup
  #rootCleanups: Cleanup[] = []
  #rowCleanups: Cleanup[] = []
  #visible: VisibleEntry[] = []
  #visibleKey = ''

  connectedCallback() {
    this.classList.add('ui-tree')
    this.style.display = 'flex'
    this.style.flexDirection = 'column'
    this.style.width = '100%'
    this.style.minWidth = '0'

    upgradeDetailHandlerProperties(this)
    for (const name of [
      'nodes',
      'expandedValue',
      'selectedValue',
      'onExpandedChange',
      'onSelectionChange',
    ]) {
      upgradeProperty(this, name)
    }

    this.#readAttrs()
    this.#ensureChrome()
    this.#boot()
  }

  disconnectedCallback() {
    this.#teardown()
  }

  attributeChangedCallback() {
    if (!this.isConnected) return
    this.#readAttrs()
    this.#boot()
  }

  // ---- public API (TreeContract) ----
  get nodes() {
    return this.#nodes
  }
  set nodes(v: TreeNodeContract[]) {
    this.#nodes = Array.isArray(v) ? v : []
    if (this.isConnected) this.#boot()
  }

  get label() {
    return this.#label
  }
  set label(v: string) {
    this.#label = v ?? ''
    if (this.isConnected) this.#bindChrome()
  }

  get expandedValue() {
    return this.#expandedValue
  }
  set expandedValue(v: string[] | undefined) {
    this.#expandedValue = v
    if (this.isConnected) this.#boot()
  }

  get selectedValue() {
    return this.#selectedValue
  }
  set selectedValue(v: string[] | undefined) {
    this.#selectedValue = v
    if (this.isConnected) this.#boot()
  }

  get onExpandedChange() {
    return this.#onExpandedChange
  }
  set onExpandedChange(v: unknown) {
    this.#onExpandedChange = asDetailHandler(v)
  }

  get onSelectionChange() {
    return this.#onSelectionChange
  }
  set onSelectionChange(v: unknown) {
    this.#onSelectionChange = asDetailHandler(v)
  }

  /** Remeasure virtualizer + repaint (call after layout). */
  refresh() {
    if (!this.isConnected) return
    this.#ensureChrome()
    this.#syncVisible(true)
    requestAnimationFrame(() => {
      this.#virtualizer?._willUpdate()
      this.#paintWindow()
    })
  }

  // ---- attr / chrome ----
  #readAttrs() {
    const nodes = json.parse<TreeNodeContract[]>(this.getAttribute('nodes'))
    if (nodes) this.#nodes = nodes

    const label = this.getAttribute('label')
    if (label != null) this.#label = label

    const mode = this.getAttribute('selection-mode')
    if (mode === 'single' || mode === 'multiple') this.#selectionMode = mode

    const height = this.getAttribute('height')
    if (height != null) this.#height = /^\d+(\.\d+)?$/.test(height) ? Number(height) : height

    const rh = this.getAttribute('row-height')
    if (rh && /^\d+(\.\d+)?$/.test(rh)) this.#rowHeight = Number(rh)

    const ov = this.getAttribute('overscan')
    if (ov && /^\d+$/.test(ov)) this.#overscan = Number(ov)

    if (this.hasAttribute('virtual')) this.#virtual = this.getAttribute('virtual') !== 'false'
    if (this.hasAttribute('expand-on-click')) {
      this.#expandOnClick = this.getAttribute('expand-on-click') !== 'false'
    }

    const ex = json.parse<string[]>(this.getAttribute('expanded-value'))
    if (ex) this.#expandedValue = ex
    const sel = json.parse<string[]>(this.getAttribute('selected-value'))
    if (sel) this.#selectedValue = sel

    const dex = json.parse<string[]>(this.getAttribute('default-expanded-value'))
    if (dex) this.#defaultExpanded = dex
    const dsel = json.parse<string[]>(this.getAttribute('default-selected-value'))
    if (dsel) this.#defaultSelected = dsel
  }

  #ensureChrome() {
    if (!this.#labelEl) {
      this.#labelEl = document.createElement('div')
      this.#labelEl.className = 'ui-tree__label'
      this.append(this.#labelEl)
    }
    if (!this.#treeEl) {
      this.#treeEl = document.createElement('div')
      this.#treeEl.className = 'ui-tree__tree'
      this.append(this.#treeEl)
    }
    if (!this.#viewport) {
      this.#viewport = document.createElement('div')
      this.#viewport.className = 'ui-tree__viewport'
      this.#treeEl.append(this.#viewport)
    }
    this.#viewport.style.cssText = [
      'overflow:auto',
      'position:relative',
      'width:100%',
      `height:${resolveTreeHeight(this.#height)}`,
    ].join(';')

    if (!this.#spacer) {
      this.#spacer = document.createElement('div')
      this.#spacer.className = 'ui-tree__virtual-spacer'
      this.#viewport.append(this.#spacer)
    }
    this.#spacer.style.cssText = 'position:relative;width:100%;min-height:1px'
  }

  #teardown() {
    this.#unsub?.()
    this.#unsub = undefined
    this.#machine?.stop()
    this.#machine = undefined
    this.#unmountVirtual?.()
    this.#unmountVirtual = undefined
    this.#virtualizer = undefined
    this.#rootCleanups.forEach(fn => fn())
    this.#rowCleanups.forEach(fn => fn())
    this.#rootCleanups = []
    this.#rowCleanups = []
  }

  // ---- Zag machine ----
  #api() {
    if (!this.#machine) return null
    // CRITICAL: same as h-select — connect(machine.service), not the wrapper alone.
    return treeView.connect(this.#machine.service as any, normalizeProps)
  }

  #boot() {
    this.#ensureChrome()
    this.#startMachine()
    this.#bindChrome()
    this.#syncVisible(true)
    requestAnimationFrame(() => {
      this.#virtualizer?._willUpdate()
      this.#paintWindow()
    })
  }

  #startMachine() {
    this.#unsub?.()
    this.#machine?.stop()

    const collection = treeView.collection<CollectionNode>({
      rootNode: toTreeRootNode(this.#nodes) as CollectionNode,
      nodeToValue: n => n.id,
      nodeToString: n => n.label,
      isNodeDisabled: n => Boolean(n.disabled),
    })

    // Keep synthetic root expanded so forest children stay reachable if needed.
    const defaultExpanded = Array.from(
      new Set([TREE_ROOT_ID, ...(this.#expandedValue ?? this.#defaultExpanded)]),
    )

    this.#machine = new VanillaMachine(treeView.machine, {
      id: `h-tree-${Math.random().toString(36).slice(2, 10)}`,
      collection,
      selectionMode: this.#selectionMode,
      expandOnClick: this.#expandOnClick,
      defaultExpandedValue: defaultExpanded,
      defaultSelectedValue: this.#selectedValue ?? this.#defaultSelected,
      ...(this.#expandedValue !== undefined
        ? { expandedValue: Array.from(new Set([TREE_ROOT_ID, ...this.#expandedValue])) }
        : {}),
      ...(this.#selectedValue !== undefined ? { selectedValue: this.#selectedValue } : {}),
      scrollToIndexFn: (details: { node: CollectionNode }) => {
        const idx = this.#visible.findIndex(v => v.node.id === details.node?.id)
        if (idx >= 0) this.#virtualizer?.scrollToIndex(idx, { align: 'auto' })
      },
      onExpandedChange: (details: { expandedValue: string[] }) => {
        const expandedValue = details.expandedValue.filter(id => id !== TREE_ROOT_ID)
        if (this.#expandedValue !== undefined) this.#expandedValue = expandedValue
        emitDetail(this, 'expanded-change', { expandedValue }, this.#onExpandedChange)
        // Visible list changed → full virtual repaint.
        this.#syncVisible(true)
      },
      onSelectionChange: (details: { selectedValue: string[] }) => {
        if (this.#selectedValue !== undefined) this.#selectedValue = details.selectedValue
        emitDetail(
          this,
          'selection-change',
          { selectedValue: details.selectedValue },
          this.#onSelectionChange,
        )
        // Do not rebuild rows — patch only (avoids click-target theft).
        this.#patchSelectionFocus()
      },
    } as any)

    this.#machine.start()

    // Focus ticks: patch attrs only — NEVER replaceChildren here.
    this.#unsub = this.#machine.subscribe(() => {
      this.#patchSelectionFocus()
    })
  }

  #bindChrome() {
    const api = this.#api()
    if (!api || !this.#labelEl || !this.#treeEl || !this.#viewport) return

    this.#rootCleanups.forEach(fn => fn())
    this.#rootCleanups = []

    if (this.#label) {
      this.#labelEl.hidden = false
      this.#labelEl.textContent = this.#label
      this.#rootCleanups.push(spreadProps(this.#labelEl, api.getLabelProps()))
    } else {
      this.#labelEl.hidden = true
    }

    // Zag getRootProps() includes a generated `id` (tree:<machineId>:root).
    // Never spread that onto the host — it overwrites author HTML id (e.g. id="wc-tree"),
    // so demo/querySelector('#wc-tree') fails and nodes never get assigned → blank tree.
    // Also re-apply author id after spread: if an older bind once set Zag's id, spreadProps
    // cleanup would remove `id` when the new props omit it.
    const authorId = this.getAttribute('id')
    const rootProps = { ...api.getRootProps() } as Record<string, unknown>
    delete rootProps.id
    this.#rootCleanups.push(spreadProps(this, rootProps))
    if (authorId) this.setAttribute('id', authorId)

    this.#rootCleanups.push(spreadProps(this.#treeEl, api.getTreeProps()))
    this.#viewport.style.height = resolveTreeHeight(this.#height)
  }

  // ---- visible rows (Zag) + virtual window (TanStack) ----
  #syncVisible(forcePaint: boolean) {
    const api = this.#api()
    if (!api) {
      this.#visible = []
      this.#visibleKey = ''
      this.#paintWindow()
      return
    }

    const raw = api.getVisibleNodes() as VisibleEntry[]
    // Synthetic root is not shown; indices used by virtualizer are post-filter.
    this.#visible = raw.filter(v => v.node.id !== TREE_ROOT_ID)

    const key = this.#visible.map(v => v.node.id).join('\0')
    const changed = forcePaint || key !== this.#visibleKey
    this.#visibleKey = key

    this.#setupVirtualizer(this.#visible.length)
    if (changed) this.#paintWindow()
    else this.#patchSelectionFocus()
  }

  #setupVirtualizer(count: number) {
    if (!this.#virtual || !this.#viewport) {
      this.#unmountVirtual?.()
      this.#unmountVirtual = undefined
      this.#virtualizer = undefined
      return
    }

    const initialRect = {
      width: Math.max(this.#viewport.clientWidth || this.clientWidth || 280, 1),
      height: Math.max(
        this.#viewport.clientHeight ||
          (typeof this.#height === 'number' ? this.#height : 360),
        1,
      ),
    }

    if (this.#virtualizer) {
      this.#virtualizer.setOptions({
        ...this.#virtualizer.options,
        count,
        estimateSize: () => this.#rowHeight,
        overscan: this.#overscan,
        getScrollElement: () => this.#viewport ?? null,
        initialRect,
        onChange: () => this.#paintWindow(),
      })
      this.#virtualizer._willUpdate()
      return
    }

    this.#virtualizer = new Virtualizer({
      count,
      getScrollElement: () => this.#viewport ?? null,
      estimateSize: () => this.#rowHeight,
      overscan: this.#overscan,
      scrollToFn: elementScroll,
      observeElementRect,
      observeElementOffset,
      initialRect,
      onChange: () => this.#paintWindow(),
    })
    this.#unmountVirtual = this.#virtualizer._didMount()
    this.#virtualizer._willUpdate()
  }

  #windowItems(): { index: number; start: number; size: number }[] {
    const n = this.#visible.length
    if (n === 0) return []

    if (this.#virtual && this.#virtualizer) {
      const items = this.#virtualizer.getVirtualItems()
      if (items.length > 0) {
        return items.map(i => ({ index: i.index, start: i.start, size: i.size }))
      }
    }

    // Fallback before layout measure — never leave spacer empty when data exists.
    const vh =
      this.#viewport?.clientHeight ||
      (typeof this.#height === 'number' ? this.#height : 360)
    const page = Math.min(n, Math.ceil(vh / this.#rowHeight) + this.#overscan + 4)
    return Array.from({ length: page }, (_, index) => ({
      index,
      start: index * this.#rowHeight,
      size: this.#rowHeight,
    }))
  }

  #paintWindow() {
    if (!this.#spacer) return
    const api = this.#api()
    if (!api) return

    this.#rowCleanups.forEach(fn => fn())
    this.#rowCleanups = []
    this.#spacer.replaceChildren()

    const n = this.#visible.length
    const total =
      this.#virtual && this.#virtualizer && this.#virtualizer.getVirtualItems().length > 0
        ? this.#virtualizer.getTotalSize()
        : n * this.#rowHeight
    this.#spacer.style.height = `${Math.max(total, n * this.#rowHeight)}px`

    for (const w of this.#windowItems()) {
      const entry = this.#visible[w.index]
      if (!entry) continue
      try {
        this.#spacer.appendChild(this.#makeRow(api, entry, w.start, w.size))
      } catch (err) {
        console.error('[h-tree] row failed', entry.node?.id, err)
      }
    }
  }

  #makeRow(api: any, entry: VisibleEntry, start: number, size: number) {
    const { node, indexPath } = entry
    const state = api.getNodeState({ node, indexPath })
    // Shared indent for branch & leaf (chevron is a fixed flex column).
    const pad = treeRowPaddingLeft(indexPath)

    const row = document.createElement('div')
    row.className = 'ui-tree__row'
    row.dataset.nodeId = String(node.id)
    row.style.cssText = `position:absolute;left:0;top:0;width:100%;height:${size}px;transform:translateY(${start}px)`

    const el = document.createElement('div')
    const zagProps = state.isBranch
      ? api.getBranchControlProps({ node, indexPath })
      : api.getItemProps({ node, indexPath })
    this.#rowCleanups.push(spreadProps(el, zagProps))

    el.classList.add(
      'ui-tree__node',
      state.isBranch ? 'ui-tree__node--branch' : 'ui-tree__node--leaf',
    )
    // AFTER spreadProps: item props set style="--depth:N" and would wipe paddingLeft.
    el.style.cssText = `--depth:${indexPath.length};padding-left:${pad}px`

    const icon = document.createElement('span')
    icon.className = state.isBranch
      ? 'ui-tree__indicator'
      : 'ui-tree__indicator ui-tree__indicator--leaf'
    icon.setAttribute('aria-hidden', 'true')
    if (state.isBranch) {
      this.#rowCleanups.push(spreadProps(icon, api.getBranchIndicatorProps({ node, indexPath })))
      icon.classList.add('ui-tree__indicator')
      const ch = document.createElement('span')
      ch.className = 'ui-tree__chevron'
      ch.textContent = state.expanded ? '▾' : '▸'
      icon.append(ch)
    }

    const text = document.createElement('span')
    this.#rowCleanups.push(
      spreadProps(
        text,
        state.isBranch
          ? api.getBranchTextProps({ node, indexPath })
          : api.getItemTextProps({ node, indexPath }),
      ),
    )
    text.classList.add('ui-tree__text')
    text.textContent = node.label ?? String(node.id)

    el.append(icon, text)
    row.append(el)
    return row
  }

  /** Patch selection/focus without destroying row DOM. */
  #patchSelectionFocus() {
    const api = this.#api()
    if (!api || !this.#spacer) return

    for (const entry of this.#visible) {
      const state = api.getNodeState(entry)
      const row = this.#spacer.querySelector<HTMLElement>(
        `.ui-tree__row[data-node-id="${CSS.escape(String(entry.node.id))}"]`,
      )
      const el = row?.querySelector<HTMLElement>('.ui-tree__node')
      if (!el) continue

      el.toggleAttribute('data-selected', Boolean(state.selected))
      el.toggleAttribute('data-focus', Boolean(state.focused))
      el.setAttribute('aria-selected', state.selected ? 'true' : 'false')
      el.tabIndex = state.focused ? 0 : -1
      if (state.isBranch) {
        el.dataset.state = state.expanded ? 'open' : 'closed'
        const ch = el.querySelector('.ui-tree__chevron')
        if (ch) ch.textContent = state.expanded ? '▾' : '▸'
      }
    }
  }
}

defineOnce('h-tree', HTree)
