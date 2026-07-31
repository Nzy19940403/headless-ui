/**
 * Framework-agnostic form validators powered by `@meshflow/form`'s
 * `useSchemaValidators` + `SetValidators` API.
 *
 * ## How it works
 *
 * 1. `resolveValidators(schema)` scans every JSON Schema property for
 *    `x-required`, `x-min`, `x-maxLength`, `x-pattern` annotations and
 *    produces a flat `Record<path, FormValidatorFn[]>`.
 *
 * 2. `registerToEngine(engine, validators)` pours those functions into
 *    meshflow's schema-validator layer via `SetValidators(path, opts)`.
 *
 * 3. When meshflow propagates a change, `logic(val, GetByPath)` runs;
 *    if it returns a string, that string becomes the error.  If it returns
 *    `true`, the field is valid.  `condition(data)` gates execution so
 *    validators only fire when the field is visible / touched.
 *
 * ## Custom validators
 *
 * Downstream code can push extra `FormValidatorFn` entries at any time —
 * they're just functions `(value) => true | 'error message'`.
 */

import type { ObjectSchemaX, FieldSchemaX } from './schema-types'
import { isObjectSchema } from './schema-types'

/** A validator returns `true` when the value is OK, or a string error message. */
export type FormValidatorFn = (value: any, getByPath?: (path: string) => any) => true | string

export interface FormValidators {
  /** Flat map: path → list of validators. */
  validators: Record<string, FormValidatorFn[]>
}

// ── JSON Schema → validator resolution ───────────────────────────────

/**
 * Walk a `MeshFormSchema` and extract validators from every leaf property.
 *
 * Annotations honoured:
 * - `x-required`        → required()
 * - `enum`              → enum check (value must be in list)
 * - `x-min`             → min value (numeric / string length)
 * - `x-maxLength`       → max string length
 * - `x-pattern`         → regex pattern
 * - `x-validator`       → custom fn name (resolved via `customFns` map)
 */
export function resolveValidators(
  schema: ObjectSchemaX,
  customFns: Record<string, FormValidatorFn> = {},
): FormValidators {
  const validators: Record<string, FormValidatorFn[]> = {}

  function walk(children: Record<string, FieldSchemaX | ObjectSchemaX>, parentPath: string) {
    for (const [key, field] of Object.entries(children)) {
      const path = parentPath ? `${parentPath}.${key}` : key

      if (isObjectSchema(field)) {
        walk(field.properties, path)
        continue
      }

      // Non-object → leaf field (FieldSchemaX)
      const fns: FormValidatorFn[] = []

      if (field['x-required'] === true) {
        fns.push(required())
      }

      if (Array.isArray(field.enum) && field.enum.length > 0) {
        fns.push(oneOf(field.enum))
      }

      if (typeof field['x-min'] === 'number') {
        fns.push(min(field['x-min']))
      }

      if (typeof field['x-maxLength'] === 'number') {
        fns.push(maxLength(field['x-maxLength']))
      }

      if (typeof field['x-pattern'] === 'string') {
        fns.push(pattern(new RegExp(field['x-pattern']), field['x-pattern-message'] ?? '格式不正确'))
      }

      if (typeof field['x-validator'] === 'string' && customFns[field['x-validator']]) {
        fns.push(customFns[field['x-validator']])
      }

      if (fns.length > 0) {
        validators[path] = fns
      }
    }
  }

  walk(schema.properties ?? {}, '')
  return { validators }
}

// ── Built-in validators ──────────────────────────────────────────────

/** Value must be non-empty (fails on `undefined`, `null`, `''`). */
export function required(message = '此项为必填'): FormValidatorFn {
  return (value: any) => {
    if (value === undefined || value === null || value === '') return message
    return true
  }
}

/** Value must be one of the allowed options. */
export function oneOf(options: any[], message = '请选择有效项'): FormValidatorFn {
  return (value: any) => {
    if (value === undefined || value === null || value === '') return true
    if (!options.includes(value)) return message
    return true
  }
}

/** Numeric minimum (or min string length). */
export function min(threshold: number, message?: string): FormValidatorFn {
  return (value: any) => {
    if (value === undefined || value === null || value === '') return true
    const n = typeof value === 'number' ? value : Number(value)
    const msg = message ?? `最小值为 ${threshold}`
    if (Number.isNaN(n)) {
      // string length fallback
      const s = String(value)
      if (s.length < threshold) return `最少输入 ${threshold} 个字符`
      return true
    }
    if (n < threshold) return msg
    return true
  }
}

/** Maximum string length. */
export function maxLength(limit: number, message?: string): FormValidatorFn {
  return (value: any) => {
    if (value === undefined || value === null || value === '') return true
    const msg = message ?? `最多输入 ${limit} 个字符`
    if (String(value).length > limit) return msg
    return true
  }
}

/** Regex pattern match. */
export function pattern(regex: RegExp, message = '格式不正确'): FormValidatorFn {
  return (value: any) => {
    if (value === undefined || value === null || value === '') return true
    if (!regex.test(String(value))) return message
    return true
  }
}

// ── MeshFlow engine integration ──────────────────────────────────────

/**
 * Register resolved validators into a meshflow engine so they fire on every
 * propagation tick.
 *
 * Uses the engine's `schemaValidators.SetValidators(path, { logic, condition })`.
 *
 * `logic` receives the current field value AND a `GetByPath` function so
 * cross-field validators (e.g. "end date ≥ start date") are supported.
 *
 * `condition` ensures the validator only fires when `disabled !== true` and
 * `hidden !== true`.
 */
export function registerToEngine(
  engine: any,
  validators: Record<string, FormValidatorFn[]>,
  nodeMap: Record<string, any>,
): void {
  const sv = engine.modules?.internalModules?.schemaValidators as {
    SetValidators: (
      path: string,
      opts: {
        logic: (val: any, GetByPath: any) => true | string
        condition: (data: any) => boolean
      },
    ) => void
  } | undefined

  if (!sv) {
    console.warn('[form] schemaValidators module not found on engine — validators will not fire.')
    return
  }

  for (const [path, fns] of Object.entries(validators)) {
    if (fns.length === 0) continue

    sv.SetValidators(path, {
      logic(val, getByPath) {
        for (const fn of fns) {
          const result = fn(val, getByPath)
          if (result !== true) return result // first error wins
        }
        return true
      },
      condition() {
        const node = nodeMap[path]
        if (!node) return false
        // Don't validate disabled or hidden fields
        if (node.disabled || node.hidden) return false
        return true
      },
    })
  }
}
