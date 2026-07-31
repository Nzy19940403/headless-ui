import type { TreeExpandedChangeDetails, TreeExpandedChangeHandler, TreeNodeContract } from './tree-contract'
import type { PresenceContract } from './presence-contract'

export type TreeSelectValue = string | string[]

export interface TreeSelectValueChangeDetails {
  /** A string in single mode, or the complete selected id list in multiple mode. */
  value: TreeSelectValue
  /** Always exposes the normalized selected id list. */
  selectedValue: string[]
}

export type TreeSelectValueChangeHandler = (details: TreeSelectValueChangeDetails) => void

/**
 * Framework-neutral context for custom node content.
 *
 * Adapter mapping:
 * - React: `renderNode(context)`
 * - Vue: `#node="context"`
 * - Web Component: `slot="node"` / a cloned `<template>`
 */
export interface TreeSelectNodeRenderContext {
  node: TreeNodeContract
  level: number
  selected: boolean
  active: boolean
  disabled: boolean
  branch: boolean
  multiple: boolean
}

/** Context for replacing the selected value area in the trigger. */
export interface TreeSelectValueRenderContext {
  value: TreeSelectValue
  selectedValue: string[]
  selectedNodes: TreeNodeContract[]
  multiple: boolean
}

/** Context for replacing an individual selected tag in multiple mode. */
export interface TreeSelectTagRenderContext {
  node: TreeNodeContract
  selectedValue: string[]
  multiple: boolean
}

/**
 * Cascader-style hierarchical selector contract.
 *
 * Rendering extensions stay adapter-specific because functions cannot be
 * serialized into Vue attributes or Web Component attributes. The shared
 * context types above are the contract that React render props, Vue slots,
 * and Web Component templates must receive.
 */
export interface TreeSelectContract extends PresenceContract {
  nodes: TreeNodeContract[]
  value?: TreeSelectValue
  defaultValue?: TreeSelectValue
  placeholder?: string
  disabled?: boolean
  name?: string
  label?: string
  /** Allow selecting branch nodes; defaults to leaf-only selection. */
  selectBranches?: boolean
  /** Keep the popup open and toggle values instead of closing after each selection. */
  multiple?: boolean
  height?: number | string
  /** Width applied to every cascader column. */
  columnWidth?: number | string
  /** Optional per-depth widths; entries fall back to columnWidth. */
  columnWidths?: Array<number | string>
  virtual?: boolean
  defaultExpandedValue?: string[]
  expandedValue?: string[]
  onExpandedChange?: TreeExpandedChangeHandler
  onValueChange?: TreeSelectValueChangeHandler
}

export type TreeSelectExpandedChangeDetails = TreeExpandedChangeDetails

/** Flatten forest for id → node lookups. */
export function flattenTreeSelectNodes(nodes: TreeNodeContract[]): TreeNodeContract[] {
  return (nodes ?? []).flatMap(node => [
    node,
    ...(node.children?.length ? flattenTreeSelectNodes(node.children) : []),
  ])
}

export function normalizeTreeSelectValue(
  value: TreeSelectValue | undefined,
  multiple: boolean,
): string[] {
  if (multiple) return Array.isArray(value) ? value : value ? [value] : []
  if (Array.isArray(value)) return value.slice(-1)
  return value ? [value] : []
}

/** Expand path ids that still have children (cascader navigation). */
export function resolveTreeSelectPath(nodes: TreeNodeContract[], ids: string[]): string[] {
  const path: string[] = []
  let current = nodes ?? []
  for (const id of ids) {
    const node = current.find(item => item.id === id)
    if (!node?.children?.length) break
    path.push(node.id)
    current = node.children
  }
  return path
}

/** Cascader columns from root through active branch path. */
export function resolveTreeSelectColumns(
  nodes: TreeNodeContract[],
  activePath: string[],
): TreeNodeContract[][] {
  const columns: TreeNodeContract[][] = [nodes ?? []]
  let current = nodes ?? []
  for (const id of activePath) {
    const branch = current.find(node => node.id === id)
    if (!branch?.children?.length) break
    current = branch.children
    columns.push(current)
  }
  return columns
}

/** CSS length for a column: prefer per-depth entry, else default width. */
export function resolveTreeSelectColumnWidth(
  columnIndex: number,
  columnWidth: number | string = 180,
  columnWidths?: Array<number | string>,
): string {
  const raw = columnWidths?.[columnIndex] ?? columnWidth
  if (typeof raw === 'number' && Number.isFinite(raw)) return `${raw}px`
  return String(raw)
}
