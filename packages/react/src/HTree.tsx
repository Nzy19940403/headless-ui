import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { TreeView, createTreeCollection, useTreeView } from '@ark-ui/react/tree-view'
import type {
  TreeCollectionNode,
  TreeContract,
  TreeNodeContract,
} from '@demo/ui-core'
import {
  TREE_ROOT_ID,
  resolveTreeHeight,
  toTreeRootNode,
  treeRowPaddingLeft,
} from '@demo/ui-core'

export interface HTreeProps extends TreeContract {
  className?: string
}

function buildCollection(nodes: TreeNodeContract[]) {
  return createTreeCollection<TreeCollectionNode>({
    rootNode: toTreeRootNode(nodes),
    nodeToValue: n => n.id,
    nodeToString: n => n.label,
    isNodeDisabled: n => Boolean(n.disabled),
  })
}

/**
 * Headless tree shell: Ark TreeView + TanStack Virtual (default).
 * Renders a flat list of visible rows (expand/collapse via Zag).
 */
export function HTree({
  nodes,
  label,
  selectionMode = 'single',
  expandedValue: expandedProp,
  defaultExpandedValue = [],
  onExpandedChange,
  selectedValue: selectedProp,
  defaultSelectedValue = [],
  onSelectionChange,
  virtual = true,
  height = 360,
  rowHeight = 32,
  overscan = 8,
  expandOnClick = true,
  className,
}: HTreeProps) {
  const collection = useMemo(() => buildCollection(nodes), [nodes])

  const [expandedValue, setExpandedValue] = useState<string[]>(
    () => expandedProp ?? defaultExpandedValue,
  )
  const [selectedValue, setSelectedValue] = useState<string[]>(
    () => selectedProp ?? defaultSelectedValue,
  )

  useEffect(() => {
    if (expandedProp !== undefined) setExpandedValue(expandedProp)
  }, [expandedProp])

  useEffect(() => {
    if (selectedProp !== undefined) setSelectedValue(selectedProp)
  }, [selectedProp])

  const scrollRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const virtualizerRef = useRef<any>(null)

  const scrollToIndexFn = useCallback((details: { index: number }) => {
    virtualizerRef.current?.scrollToIndex?.(details.index, { align: 'auto' })
  }, [])

  const tree = useTreeView({
    id: useIdStable('h-tree'),
    collection,
    selectionMode,
    expandOnClick,
    expandedValue,
    selectedValue,
    onExpandedChange(details) {
      setExpandedValue(details.expandedValue)
      onExpandedChange?.({ expandedValue: details.expandedValue })
    },
    onSelectionChange(details) {
      setSelectedValue(details.selectedValue)
      onSelectionChange?.({ selectedValue: details.selectedValue })
    },
    scrollToIndexFn: virtual ? scrollToIndexFn : undefined,
  })

  const visibleNodes = tree.getVisibleNodes()

  const virtualizer = useVirtualizer({
    count: visibleNodes.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => rowHeight,
    overscan,
    enabled: virtual,
  })
  virtualizerRef.current = virtualizer

  const viewportHeight = resolveTreeHeight(height)
  const totalSize = virtual ? virtualizer.getTotalSize() : visibleNodes.length * rowHeight
  const virtualItems = virtual
    ? virtualizer.getVirtualItems()
    : visibleNodes.map((_, index) => ({
        index,
        start: index * rowHeight,
        size: rowHeight,
        key: index,
      }))

  return (
    <div className={['ui-tree', className].filter(Boolean).join(' ')}>
      <TreeView.RootProvider value={tree}>
        {label ? <TreeView.Label className="ui-tree__label">{label}</TreeView.Label> : null}
        <TreeView.Tree className="ui-tree__tree">
          <div
            ref={scrollRef}
            className="ui-tree__viewport"
            style={{ height: viewportHeight, overflow: 'auto' }}
          >
            <div
              className="ui-tree__virtual-spacer"
              style={{
                height: totalSize,
                width: '100%',
                position: 'relative',
              }}
            >
              {virtualItems.map(vRow => {
                const entry = visibleNodes[vRow.index]
                if (!entry) return null
                const { node, indexPath } = entry
                if (node.id === TREE_ROOT_ID) return null
                const nodeState = tree.getNodeState({ node, indexPath })
                const pad = treeRowPaddingLeft(indexPath)
                const indentStyle = {
                  paddingLeft: pad,
                  ['--ui-tree-indent' as string]: `${pad}px`,
                  ['--depth' as string]: nodeState.depth,
                }

                return (
                  <div
                    key={nodeState.value}
                    className="ui-tree__row"
                    data-index={vRow.index}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: vRow.size,
                      transform: `translateY(${vRow.start}px)`,
                    }}
                  >
                    <TreeView.NodeProvider node={node} indexPath={indexPath}>
                      {nodeState.isBranch ? (
                        <TreeView.BranchControl
                          className="ui-tree__node ui-tree__node--branch"
                          style={indentStyle}
                        >
                          <TreeView.BranchIndicator className="ui-tree__indicator">
                            <span className="ui-tree__chevron" aria-hidden="true">
                              {nodeState.expanded ? '▾' : '▸'}
                            </span>
                          </TreeView.BranchIndicator>
                          <TreeView.BranchText className="ui-tree__text">
                            {collection.stringifyNode(node)}
                          </TreeView.BranchText>
                        </TreeView.BranchControl>
                      ) : (
                        <TreeView.Item
                          className="ui-tree__node ui-tree__node--leaf"
                          style={indentStyle}
                        >
                          {/* Same fixed-width slot as branch chevron so labels align */}
                          <span className="ui-tree__indicator ui-tree__indicator--leaf" aria-hidden="true" />
                          <TreeView.ItemText className="ui-tree__text">
                            {collection.stringifyNode(node)}
                          </TreeView.ItemText>
                        </TreeView.Item>
                      )}
                    </TreeView.NodeProvider>
                  </div>
                )
              })}
            </div>
          </div>
        </TreeView.Tree>
      </TreeView.RootProvider>
    </div>
  )
}

/** Stable id without requiring React 18 useId in older types if missing. */
function useIdStable(prefix: string) {
  const ref = useRef<string | null>(null)
  if (!ref.current) {
    ref.current = `${prefix}-${Math.random().toString(36).slice(2, 9)}`
  }
  return ref.current
}
