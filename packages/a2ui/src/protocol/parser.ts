/**
 * A2UI v0.9.1 message parser.
 *
 * `parseA2UIMessages` accepts a JSONL string or an array of pre-parsed
 * envelope messages, applies them in order (createSurface → updateComponents →
 * updateDataModel), and produces a resolved `A2UISurface`.
 *
 * When streaming is added later, the same reducer logic can be driven
 * line-by-line from SSE / WebSocket / fetch — no protocol changes needed.
 */

import type {
  A2UIMessage,
  A2UISurface,
  A2UIComponent,
  A2UIValue,
  CatalogId,
} from './types'
import { A2UI_MESSAGE_TYPES } from './types'

// ── Errors ──────────────────────────────────────────────────────────────

export class A2UIParseError extends Error {
  constructor(
    message: string,
    public readonly line?: number,
  ) {
    super(line != null ? `A2UI parse error at line ${line}: ${message}` : `A2UI parse error: ${message}`)
    this.name = 'A2UIParseError'
  }
}

// ── Message helpers ─────────────────────────────────────────────────────

/**
 * Extract which message type key is present in an envelope object.
 * Returns the key name (e.g. "updateComponents") or null if none found.
 */
export function getMessageType(msg: Record<string, unknown>): string | null {
  for (const key of A2UI_MESSAGE_TYPES) {
    if (key in msg && msg[key] != null) return key
  }
  return null
}

/** Check whether a plain object looks like a valid A2UI v0.9.1 envelope. */
export function isA2UIMessage(msg: Record<string, unknown>): msg is Record<string, unknown> & { version: string } {
  return typeof msg.version === 'string' && getMessageType(msg) !== null
}

/**
 * Validate an envelope strictly — version must be exactly v0.9.1 and
 * exactly one message type key must be present.
 */
export function validateEnvelope(msg: Record<string, unknown>, line?: number): string {
  if (msg.version !== 'v0.9.1') {
    throw new A2UIParseError(
      `Unsupported version "${String(msg.version)}" — expected "v0.9.1"`,
      line,
    )
  }
  let typeFound: string | null = null
  for (const key of A2UI_MESSAGE_TYPES) {
    if (key in msg && msg[key] != null) {
      if (typeFound !== null) {
        throw new A2UIParseError(
          `Envelope has multiple message types: "${typeFound}" and "${key}". ` +
          `Each envelope must contain exactly ONE message type.`,
          line,
        )
      }
      typeFound = key
    }
  }
  if (typeFound === null) {
    throw new A2UIParseError(
      `Envelope is missing a message type key. ` +
      `Must contain exactly one of: ${A2UI_MESSAGE_TYPES.join(', ')}.`,
      line,
    )
  }
  return typeFound
}

// ── JSONL parser ────────────────────────────────────────────────────────

/**
 * Parse a JSONL string into an array of plain objects.
 * Blank lines and comment lines (//) are skipped.
 */
export function parseJSONL(input: string): Record<string, unknown>[] {
  const messages: Record<string, unknown>[] = []
  const lines = input.split(/\r?\n/)
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line || line.startsWith('//')) continue
    try {
      const obj = JSON.parse(line)
      if (obj != null && typeof obj === 'object' && !Array.isArray(obj)) {
        messages.push(obj as Record<string, unknown>)
      }
    } catch (err) {
      throw new A2UIParseError(`Invalid JSON: ${(err as Error).message}`, i + 1)
    }
  }
  return messages
}

// ── JSON Pointer helpers ──────────────────────────────────────────────

/**
 * Parse a JSON Pointer path into segments.
 * "/user/name" → ["user", "name"]
 * "/items/0/title" → ["items", "0", "title"]
 * "/" → []
 */
function parsePointer(path: string): string[] {
  if (path === '/' || path === '') return []
  const normalized = path.startsWith('/') ? path.slice(1) : path
  return normalized.split('/').map(seg => seg.replace(/~1/g, '/').replace(/~0/g, '~'))
}

/** True when the string looks like a non-negative integer (JSON Pointer array index). */
function isIndex(s: string): boolean {
  return /^\d+$/.test(s)
}

/**
 * Set a value at a JSON Pointer path, creating intermediate objects/arrays.
 * Mutates root in place.
 *
 * Numeric path segments create arrays: "/items/0/title" → root.items = [{ title }]
 */
function setAtPath(root: Record<string, A2UIValue>, path: string, value: A2UIValue): void {
  const segments = parsePointer(path)
  if (segments.length === 0) {
    // Path is "/" — replace root.
    if (value != null && typeof value === 'object' && !Array.isArray(value)) {
      for (const k of Object.keys(root)) delete root[k]
      for (const [k, v] of Object.entries(value as Record<string, A2UIValue>)) {
        root[k] = v
      }
    }
    return
  }

  // Use `any` cursor so we can walk into arrays as well as plain objects.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let cursor: any = root
  for (let i = 0; i < segments.length - 1; i++) {
    const seg = segments[i]
    const nextSeg = segments[i + 1]
    let next = cursor[seg]

    if (next != null && typeof next === 'object') {
      cursor = next
    } else {
      // Create intermediate container — array if the *next* segment is an index
      cursor[seg] = isIndex(nextSeg) ? [] : {}
      cursor = cursor[seg]
    }
  }

  const lastKey = segments[segments.length - 1]
  cursor[lastKey] = value
}

/**
 * Delete the value at a JSON Pointer path.
 * Mutates root in place.
 */
function deleteAtPath(root: Record<string, A2UIValue>, path: string): void {
  const segments = parsePointer(path)
  if (segments.length === 0) {
    for (const k of Object.keys(root)) delete root[k]
    return
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let cursor: any = root
  for (let i = 0; i < segments.length - 1; i++) {
    const next = cursor[segments[i]]
    if (next == null || typeof next !== 'object') return
    cursor = next
  }

  delete cursor[segments[segments.length - 1]]
}

// ── Surface builder (the reducer) ───────────────────────────────────────

interface SurfaceState {
  surfaceId: string
  catalogId: CatalogId
  componentMap: Map<string, A2UIComponent>
  components: A2UIComponent[]
  dataModel: Record<string, A2UIValue>
  rootId?: string
}

/**
 * Build a surface state from a sequence of A2UI messages.
 * Each call mutates the state in place (reducer pattern).
 */
function applyMessage(state: SurfaceState | null, msg: A2UIMessage): SurfaceState | null {
  const type = getMessageType(msg as unknown as Record<string, unknown>)

  switch (type) {
    case 'createSurface': {
      const p = (msg as A2UIMessage & { createSurface: Record<string, unknown> }).createSurface
      return {
        surfaceId: p.surfaceId as string,
        catalogId: p.catalogId as string,
        componentMap: new Map(),
        components: [],
        dataModel: {},
      }
    }

    case 'updateComponents': {
      if (!state) throw new A2UIParseError('updateComponents received before createSurface')
      const p = (msg as A2UIMessage & { updateComponents: { components: A2UIComponent[] } }).updateComponents
      for (const comp of p.components) {
        state.componentMap.set(comp.id, comp)
        state.components.push(comp)
        if (comp.id === 'root') state.rootId = 'root'
      }
      return state
    }

    case 'updateDataModel': {
      if (!state) throw new A2UIParseError('updateDataModel received before createSurface')
      const p = (msg as A2UIMessage & { updateDataModel: { path?: string; value?: A2UIValue } }).updateDataModel
      const path = p.path ?? '/'
      if (p.value !== undefined) {
        setAtPath(state.dataModel, path, p.value)
      } else {
        deleteAtPath(state.dataModel, path)
      }
      return state
    }

    case 'deleteSurface':
      return null

    default:
      throw new A2UIParseError(`Unknown message type: ${type}`)
  }
}

// ── Main entry point ────────────────────────────────────────────────────

/**
 * Parse a batch of A2UI messages into a resolved surface.
 *
 * Accepts either:
 * - A JSONL string (one JSON envelope per line)
 * - An array of pre-parsed A2UIMessage objects
 *
 * Messages are applied in order: createSurface initialises the surface,
 * updateComponents merges into the component map, updateDataModel builds
 * the data model.  When streaming is added later, feed lines to the same
 * reducer one at a time.
 *
 * @throws {A2UIParseError} if messages are malformed or out of order.
 */
export function parseA2UIMessages(input: string | A2UIMessage[]): A2UISurface {
  const rawMessages = typeof input === 'string' ? parseJSONL(input) : input

  let state: SurfaceState | null = null

  for (let i = 0; i < rawMessages.length; i++) {
    const raw = rawMessages[i]
    const msg = (typeof raw === 'object' && raw !== null ? raw : {}) as A2UIMessage

    if (!isA2UIMessage(msg as unknown as Record<string, unknown>)) {
      throw new A2UIParseError(
        `Invalid envelope: expected { version, <typeKey> }, got keys: ${Object.keys(msg).join(', ')}`,
        typeof input === 'string' ? i + 1 : undefined,
      )
    }

    // Strict validation: version MUST be v0.9.1, exactly ONE message type
    const msgType = validateEnvelope(
      msg as unknown as Record<string, unknown>,
      typeof input === 'string' ? i + 1 : undefined,
    )

    try {
      state = applyMessage(state, msg)
    } catch (err) {
      if (err instanceof A2UIParseError) throw err
      throw new A2UIParseError((err as Error).message, typeof input === 'string' ? i + 1 : undefined)
    }

    if (state == null && (msg as A2UIMessage & { deleteSurface?: unknown }).deleteSurface) {
      throw new A2UIParseError('Surface was deleted — no active surface remains')
    }
  }

  if (!state) {
    throw new A2UIParseError("No surface was created (missing 'createSurface' message)")
  }

  return {
    surfaceId: state.surfaceId,
    catalogId: state.catalogId,
    componentMap: state.componentMap,
    components: state.components,
    dataModel: state.dataModel,
    rootId: state.rootId,
  }
}
