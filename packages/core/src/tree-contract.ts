/**
 * HTree public contract (Ark/Zag TreeView + optional TanStack Virtual).
 *
 * Core stays serializable for WC attributes:
 * - nodes: id + label + optional children
 * - expanded / selected as string[] of node ids
 *
 * Virtualization is the default rendering strategy (flat visible rows).
 */

export interface TreeNodeContract {
  /** Stable node id (selection / expand value). */
  id: string
  /** Display label. */
  label: string
  /** Nested children. Omit or [] for leaf. */
  children?: TreeNodeContract[]
  disabled?: boolean
}

export interface TreeExpandedChangeDetails {
  expandedValue: string[]
}

export interface TreeSelectionChangeDetails {
  selectedValue: string[]
}

export type TreeExpandedChangeHandler = (details: TreeExpandedChangeDetails) => void
export type TreeSelectionChangeHandler = (details: TreeSelectionChangeDetails) => void

export type TreeSelectionMode = 'single' | 'multiple'

export interface TreeContract {
  /** Forest roots (not including synthetic root). */
  nodes: TreeNodeContract[]

  /** Accessible name / heading. */
  label?: string

  selectionMode?: TreeSelectionMode

  /** Controlled expanded node ids. */
  expandedValue?: string[]
  defaultExpandedValue?: string[]
  onExpandedChange?: TreeExpandedChangeHandler

  /** Controlled selected node ids. */
  selectedValue?: string[]
  defaultSelectedValue?: string[]
  onSelectionChange?: TreeSelectionChangeHandler

  /**
   * Use TanStack Virtual for the flat visible-row list.
   * Default true (recommended for large equipment / org trees).
   */
  virtual?: boolean

  /** Scroll viewport height. Number → px. Default 360. */
  height?: number | string

  /** Estimated row height for virtualizer. Default 32. */
  rowHeight?: number

  /** Virtual overscan rows. Default 8. */
  overscan?: number

  /** Expand branch when clicking the row control. Default true. */
  expandOnClick?: boolean
}

/** Synthetic root used by TreeCollection (not shown in UI). */
export const TREE_ROOT_ID = '__h_tree_root__'

export type TreeCollectionNode = TreeNodeContract & {
  children?: TreeCollectionNode[]
}

/** Wrap forest nodes as a single TreeCollection rootNode. */
export function toTreeRootNode(nodes: TreeNodeContract[]): TreeCollectionNode {
  return {
    id: TREE_ROOT_ID,
    label: '',
    children: (nodes ?? []) as TreeCollectionNode[],
  }
}

export function resolveTreeHeight(height?: number | string): string {
  if (height == null || height === '') return '360px'
  if (typeof height === 'number' && Number.isFinite(height)) return `${height}px`
  return String(height)
}

/** px per nest level (branch & leaf share the same base indent). */
export const TREE_INDENT_PX = 16

/**
 * Visual nest level from Zag `indexPath`.
 * Synthetic root is not rendered; first real node has path `[i]` → level 0.
 */
export function treeIndentLevel(indexPath: number[] | undefined): number {
  const depth = indexPath?.length ?? 0
  return Math.max(0, depth - 1)
}

/** Base padding-left in px for a row (chevron/label slot is separate, same for leaf & branch). */
export function treeRowPaddingLeft(indexPath: number[] | undefined): number {
  return treeIndentLevel(indexPath) * TREE_INDENT_PX
}
