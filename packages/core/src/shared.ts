/** Generic content slot type used by compound contracts (title, children, items…). */
export type ComponentContent = unknown

/**
 * Item shape for Ark UI createListCollection — value is normalized to string internally,
 * so we need a way to map back to the original type.
 */
export interface SelectValueItem<V = string> {
  value: V
  label: string
  disabled?: boolean
}

/**
 * Build a string → original-value map from items.
 * The key is always `String(item.value)`; the value is the original typed `item.value`.
 *
 * Use this in onValueChange to reverse-lookup Ark's string output back to the
 * typed value the caller originally passed in.
 *
 * ```ts
 * const backmap = buildSelectValueMap(items)
 * // onValueChange: backmap.get(rawString) ?? ''
 * ```
 */
export function buildSelectValueMap<V extends string | number>(
  items: SelectValueItem<V>[],
): Map<string, V> {
  const map = new Map<string, V>()
  for (const item of items) {
    map.set(String(item.value), item.value)
  }
  return map
}
