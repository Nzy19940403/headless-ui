import { Popover } from '@ark-ui/react/popover'
import { Portal } from '@ark-ui/react/portal'
import { useMemo, useState, type ReactNode } from 'react'
import type {
  TreeNodeContract,
  TreeSelectContract,
  TreeSelectNodeRenderContext,
  TreeSelectTagRenderContext,
  TreeSelectValueRenderContext,
  TreeSelectValue,
  TreeSelectValueChangeDetails,
} from '@demo/ui-core'

export interface HTreeSelectTagRenderContext extends TreeSelectTagRenderContext {
  onRemove: () => void
}

export interface HTreeSelectProps extends TreeSelectContract {
  onValueChange?: (details: TreeSelectValueChangeDetails) => void
  renderNode?: (context: TreeSelectNodeRenderContext) => ReactNode
  renderValue?: (context: TreeSelectValueRenderContext) => ReactNode
  renderTag?: (context: HTreeSelectTagRenderContext) => ReactNode
}

function flattenNodes(nodes: TreeNodeContract[]): TreeNodeContract[] {
  return nodes.flatMap(node => [node, ...(node.children ? flattenNodes(node.children) : [])])
}

function normalizeValue(value: TreeSelectValue | undefined, multiple: boolean): string[] {
  if (multiple) return Array.isArray(value) ? value : value ? [value] : []
  if (Array.isArray(value)) return value.slice(-1)
  return value ? [value] : []
}

function resolveNodePath(nodes: TreeNodeContract[], ids: string[]): string[] {
  const path: string[] = []
  let current = nodes
  for (const id of ids) {
    const node = current.find(item => item.id === id)
    if (!node?.children?.length) break
    path.push(node.id)
    current = node.children
  }
  return path
}

function resolveColumns(nodes: TreeNodeContract[], activePath: string[]): TreeNodeContract[][] {
  const columns: TreeNodeContract[][] = [nodes]
  let current = nodes
  for (const id of activePath) {
    const branch = current.find(node => node.id === id)
    if (!branch?.children?.length) break
    current = branch.children
    columns.push(current)
  }
  return columns
}

/** Ark Popover + a cascader-style hierarchical selector with single/multiple modes. */
export function HTreeSelect({
  nodes,
  value,
  defaultValue,
  placeholder = 'Select',
  disabled,
  name,
  label,
  selectBranches = false,
  multiple = false,
  height = 240,
  columnWidth = 180,
  columnWidths,
  defaultExpandedValue = [],
  expandedValue,
  onExpandedChange,
  lazyMount = true,
  unmountOnExit = true,
  skipAnimationOnMount = false,
  onValueChange,
  renderNode,
  renderValue,
  renderTag,
}: HTreeSelectProps) {
  const nodeIndex = useMemo(() => new Map(flattenNodes(nodes).map(node => [node.id, node])), [nodes])
  const controlled = value !== undefined
  const [internalValues, setInternalValues] = useState(() => normalizeValue(defaultValue, multiple))
  const [internalPath, setInternalPath] = useState(() => resolveNodePath(nodes, defaultExpandedValue))
  const [open, setOpen] = useState(false)
  const selectedValues = controlled ? normalizeValue(value, multiple) : internalValues
  const selectedNodes = selectedValues.map(id => nodeIndex.get(id)).filter((node): node is TreeNodeContract => Boolean(node))
  const activePath = resolveNodePath(nodes, expandedValue ?? internalPath)
  const columns = resolveColumns(nodes, activePath)
  const menuHeight = typeof height === 'number' ? `${height}px` : String(height)
  const selectedLabel = selectedNodes.map(node => node.label).join(multiple ? '、' : '') || placeholder

  function updatePath(nextPath: string[]) {
    if (expandedValue === undefined) setInternalPath(nextPath)
    onExpandedChange?.({ expandedValue: nextPath })
  }

  function emitValue(nextValues: string[]) {
    if (!controlled) setInternalValues(nextValues)
    onValueChange?.({
      value: multiple ? nextValues : nextValues[0] ?? '',
      selectedValue: nextValues,
    })
    if (!multiple) setOpen(false)
  }

  function toggleValue(id: string) {
    const nextValues = selectedValues.includes(id)
      ? selectedValues.filter(valueId => valueId !== id)
      : [...selectedValues, id]
    emitValue(nextValues)
  }

  function handleNodeClick(node: TreeNodeContract, columnIndex: number) {
    const nextPath = activePath.slice(0, columnIndex)
    if (node.children?.length) {
      if (selectBranches) toggleValue(node.id)
      updatePath([...nextPath, node.id])
      return
    }

    if (multiple) toggleValue(node.id)
    else emitValue([node.id])
  }

  return (
    <div className="ui-tree-select" data-multiple={multiple ? '' : undefined}>
      <Popover.Root
        open={open}
        onOpenChange={details => setOpen(details.open)}
        // Cascader columns must grow to the right from the trigger's left edge.
        positioning={{ placement: 'bottom-start', sameWidth: false, flip: false, shift: 0 }}
        lazyMount={lazyMount}
        unmountOnExit={unmountOnExit}
        skipAnimationOnMount={skipAnimationOnMount}
      >
        {label ? <label className="ui-field__label">{label}</label> : null}
        <Popover.Trigger
          className="ui-tree-select__trigger"
          type="button"
          disabled={disabled}
          aria-label={label ?? placeholder}
          data-placeholder-shown={selectedNodes.length ? undefined : ''}
        >
          <span className="ui-tree-select__value">
            {renderValue
              ? renderValue({
                  value: multiple ? selectedValues : selectedValues[0] ?? '',
                  selectedValue: selectedValues,
                  selectedNodes,
                  multiple,
                })
              : multiple
                ? <span className="ui-tree-select__tags">
                    {selectedNodes.length === 0
                      ? <span className="ui-tree-select__tag-placeholder">{placeholder}</span>
                      : selectedNodes.map(node => (
                          <span className="ui-tree-select__tag" key={node.id} data-node-id={node.id}>
                            <span className="ui-tree-select__tag-label">
                              {renderTag
                                ? renderTag({
                                    node,
                                    selectedValue: selectedValues,
                                    multiple,
                                    onRemove: () => toggleValue(node.id),
                                  })
                                : node.label}
                            </span>
                            {!renderTag ? (
                              <span
                                className="ui-tree-select__tag-remove"
                                role="button"
                                tabIndex={0}
                                aria-label={`Remove ${node.label}`}
                                onPointerDown={event => event.stopPropagation()}
                                onClick={event => {
                                  event.preventDefault()
                                  event.stopPropagation()
                                  toggleValue(node.id)
                                }}
                                onKeyDown={event => {
                                  if (event.key === 'Enter' || event.key === ' ') {
                                    event.preventDefault()
                                    event.stopPropagation()
                                    toggleValue(node.id)
                                  }
                                }}
                              >
                                ×
                              </span>
                            ) : null}
                          </span>
                        ))}
                  </span>
                : selectedLabel}
          </span>
          <span className="ui-tree-select__indicator" aria-hidden="true" />
        </Popover.Trigger>
        <Portal>
        <Popover.Positioner className="ui-tree-select__positioner">
          <Popover.Content className="ui-tree-select__content">
            <div
              className="ui-tree-select__panel"
              role="listbox"
              aria-label={label ?? placeholder}
              aria-multiselectable={multiple || undefined}
            >
              {columns.map((column, columnIndex) => {
                const width = columnWidths?.[columnIndex] ?? columnWidth
                return (
                  <div
                    className="ui-tree-select__menu"
                    key={columnIndex}
                    style={{ maxHeight: menuHeight, width, minWidth: width }}
                    role="group"
                  >
                    {column.map(node => {
                      const isBranch = Boolean(node.children?.length)
                      const isActive = activePath[columnIndex] === node.id
                      const isSelected = selectedValues.includes(node.id)
                      return (
                        <button
                          className="ui-tree-select__node"
                          key={node.id}
                          type="button"
                          role="option"
                          aria-label={node.label}
                          aria-selected={isSelected}
                          aria-expanded={isBranch ? isActive : undefined}
                          disabled={node.disabled}
                          data-active={isActive ? '' : undefined}
                          data-selected={isSelected ? '' : undefined}
                          onClick={() => handleNodeClick(node, columnIndex)}
                        >
                          <span className="ui-tree-select__radio" aria-hidden="true" />
                          <span className="ui-tree-select__node-label">
                            {renderNode
                              ? renderNode({
                                  node,
                                  level: columnIndex,
                                  selected: isSelected,
                                  active: isActive,
                                  disabled: Boolean(node.disabled),
                                  branch: isBranch,
                                  multiple,
                                })
                              : node.label}
                          </span>
                          {isBranch ? <span className="ui-tree-select__node-indicator" aria-hidden="true" /> : null}
                        </button>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </Popover.Content>
        </Popover.Positioner>
        </Portal>
      </Popover.Root>
      {name && multiple
        ? selectedValues.map(selectedId => <input key={selectedId} type="hidden" name={name} value={selectedId} readOnly />)
        : name
          ? <input type="hidden" name={name} value={selectedValues[0] ?? ''} readOnly />
          : null}
    </div>
  )
}
