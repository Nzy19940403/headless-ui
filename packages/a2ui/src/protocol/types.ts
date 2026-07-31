/**
 * A2UI v0.9.1 wire protocol types.
 *
 * Envelope: every message is a JSONL line with `"version": "v0.9.1"` plus
 * exactly one of `createSurface` / `updateComponents` / `updateDataModel` /
 * `deleteSurface` as the payload key.
 *
 * Components use a flat adjacency list: every component gets a unique `id`,
 * children reference parents via `children: string[]`.  Props are inline
 * alongside `id` / `component` / `children` — no `props` sub-object.
 *
 * @see https://github.com/google/A2UI
 */

/** A JSON value as defined by the A2UI spec (subset of JSON Schema). */
export type A2UIValue = string | number | boolean | null | A2UIValue[] | { [key: string]: A2UIValue }

/** Data-model binding — props that resolve against the surface data model. */
export interface A2UIBoundValue {
  path: string // JSON Pointer (absolute "/xxx" or relative "xxx")
}

/** A property value that is either a literal or a data-model binding. */
export type A2UIPropValue = A2UIValue | A2UIBoundValue

/** Catalog identifier — convention is a URI (not required to be resolvable). */
export type CatalogId = string

// ── Components ────────────────────────────────────────────────────────────

/**
 * Adjacency-list entry for one component.
 * Props are inline (no `props` sub-object) per the v0.9.1 wire format.
 */
export interface A2UIComponent {
  id: string
  component: string // component type name — maps to catalog key
  weight?: number
  children?: string[] // flat child IDs
  [key: string]: A2UIPropValue | undefined // inline props
}

// ── v0.9.1 Message Envelope ──────────────────────────────────────────────

/** Protocol version string for v0.9.1. */
export const A2UI_VERSION = 'v0.9.1' as const

// ── Message payloads ──────────────────────────────────────────────────────

export interface A2UICreateSurfacePayload {
  surfaceId: string
  catalogId: CatalogId
  theme?: Record<string, A2UIValue>
  sendDataModel?: boolean
}

export interface A2UIUpdateComponentsPayload {
  surfaceId: string
  components: A2UIComponent[]
}

export interface A2UIUpdateDataModelPayload {
  surfaceId: string
  path?: string // JSON Pointer, defaults to "/"
  value?: A2UIValue // if omitted, the path is removed
}

export interface A2UIDeleteSurfacePayload {
  surfaceId: string
}

// ── Full messages (version + one payload key) ──────────────────────────────

export interface A2UICreateSurfaceMessage {
  version: typeof A2UI_VERSION
  createSurface: A2UICreateSurfacePayload
}

export interface A2UIUpdateComponentsMessage {
  version: typeof A2UI_VERSION
  updateComponents: A2UIUpdateComponentsPayload
}

export interface A2UIUpdateDataModelMessage {
  version: typeof A2UI_VERSION
  updateDataModel: A2UIUpdateDataModelPayload
}

export interface A2UIDeleteSurfaceMessage {
  version: typeof A2UI_VERSION
  deleteSurface: A2UIDeleteSurfacePayload
}

export type A2UIMessage =
  | A2UICreateSurfaceMessage
  | A2UIUpdateComponentsMessage
  | A2UIUpdateDataModelMessage
  | A2UIDeleteSurfaceMessage

/** The set of top-level message type keys. */
export type A2UIMessageType = 'createSurface' | 'updateComponents' | 'updateDataModel' | 'deleteSurface'

export const A2UI_MESSAGE_TYPES: readonly A2UIMessageType[] = [
  'createSurface', 'updateComponents', 'updateDataModel', 'deleteSurface',
] as const

// ── Resolved Surface (produced by parseA2UIMessages) ───────────────────────

/**
 * A fully-resolved surface ready for rendering or codegen.
 * The component map uses ID → component for O(1) lookup.
 */
export interface A2UISurface {
  surfaceId: string
  catalogId: CatalogId
  /** Component map: id → component (adjacency list resolved). */
  componentMap: Map<string, A2UIComponent>
  /** Component list in insertion order (for iteration). */
  components: A2UIComponent[]
  /** Resolved data model for {path} binding resolution. */
  dataModel: Record<string, A2UIValue>
  /** Root component id, if available. */
  rootId?: string
}
