/**
 * Convert a JSON Schema (`MeshFormSchema`) into a JSON Forms UI Schema tree
 * (`UISchemaElement`).
 *
 * Consecutive leaf properties sharing the same `x-row` annotation are
 * automatically grouped into a `HorizontalLayout` so they render side-by-side
 * in HStack wrappers.
 *
 * Pattern adapted from `@meshflow/form-vue`'s `generateUiSchema`.
 */
import type { UISchemaElement } from '@jsonforms/core'
import type { MeshFormSchema } from '@meshflow/form'
import { isObjectSchema } from './schema-types'
import type { ObjectSchemaX, FieldSchemaX } from './schema-types'

// ── Internal helpers ────────────────────────────────────────────────────

interface RowSegment {
  row: string | null
  items: UISchemaElement[]
}

/** Group consecutive elements with the same `x-row` metadata into HorizontalLayout segments. */
function applyRowLayout(elements: UISchemaElement[], parentPath: string): UISchemaElement[] {
  const withRow = elements.map((el, i) => ({ el, row: (el.options as any)?.['x-row'] ?? null, idx: i }))

  const segments: RowSegment[] = []
  for (const item of withRow) {
    const last = segments[segments.length - 1]
    if (last && last.row === item.row && item.row !== null) {
      last.items.push(item.el)
    } else {
      segments.push({ row: item.row, items: [item.el] })
    }
  }

  if (segments.length === withRow.length) {
    // No grouping happened — return original
    return elements
  }

  return segments.map(seg => {
    if (seg.row !== null && seg.items.length > 1) {
      return {
        type: 'HorizontalLayout' as const,
        elements: seg.items,
      } satisfies UISchemaElement
    }
    return seg.items[0]
  })
}

/**
 * Generate a flat array of Control elements for all leaf properties
 * inside a sub-object.
 */
function buildSubControls(obj: ObjectSchemaX, basePath: string): UISchemaElement[] {
  const propOrder = obj['x-order'] ?? Object.keys(obj.properties ?? {})
  return propOrder
    .map((propName): UISchemaElement | null => {
      const child = obj.properties?.[propName]
      if (!child) return null
      // Skip nested objects — they're handled by buildChildren as Group elements
      if (isObjectSchema(child)) return null

      const scope = `${basePath}/${propName}`
      const options: Record<string, any> = {}
      // Carry x-row through options so applyRowLayout can read it
      if (child['x-row']) options['x-row'] = child['x-row']

      return {
        type: 'Control',
        scope,
        options,
      } satisfies UISchemaElement
    })
    .filter((el): el is UISchemaElement => el !== null)
}

/**
 * Generate UI Schema elements for all properties of an object.
 * Sub-objects become Groups; leaf fields become Controls.
 */
function buildChildren(obj: ObjectSchemaX, basePath: string): UISchemaElement[] {
  const propOrder = obj['x-order'] ?? Object.keys(obj.properties ?? {})
  const elements: UISchemaElement[] = []

  for (const propName of propOrder) {
    const child = obj.properties?.[propName]
    if (!child) continue

    if (isObjectSchema(child)) {
      // Nested object → Group
      const childPath = `${basePath}/${propName}`
      const subControls = buildSubControls(child, `${childPath}/properties`)

      let innerElements: UISchemaElement[] = subControls
      if (child['x-layout'] === 'horizontal') {
        innerElements = [{ type: 'HorizontalLayout' as const, elements: subControls }]
      }

      elements.push({
        type: 'Group' as const,
        label: child.title ?? propName,
        elements: innerElements,
      } satisfies UISchemaElement)

      continue
    }

    // Leaf field → Control
    const scope = `${basePath}/${propName}`
    const options: Record<string, any> = {}
    if (child['x-row']) options['x-row'] = child['x-row']

    elements.push({
      type: 'Control' as const,
      scope,
      options,
    } satisfies UISchemaElement)
  }

  return elements
}

// ── Public API ─────────────────────────────────────────────────────────

/**
 * Convert a `MeshFormSchema` (JSON Schema) into a JSON Forms
 * `UISchemaElement` tree ready to be consumed by `<JsonForms>`.
 *
 * - Top-level object → `VerticalLayout`
 * - Sub-objects → `Group` (label from `title`)
 * - `x-layout: "horizontal"` on sub-objects → `HorizontalLayout`
 * - Consecutive leaf fields with matching `x-row` → `HorizontalLayout`
 */
export function generateUiSchema(schema: ObjectSchemaX): UISchemaElement {
  const children = buildChildren(schema, '#/properties')

  // Apply x-row grouping to immediate leaf children
  const childrenWithRows = applyRowLayout(children, '#/properties')

  return {
    type: 'VerticalLayout',
    elements: childrenWithRows,
  }
}
