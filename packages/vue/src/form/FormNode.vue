<script setup lang="ts">
/**
 * Recursive renderer for meshflow uiSchema trees.
 *
 * Group nodes → HVStack / HStack / HGrid (depending on x-layout annotation).
 * Consecutive fields sharing the same x-row → HStack row.
 * x-layout: 'grid' → HGrid with x-grid-columns + per-field x-col-span.
 * Leaf nodes → FormField.
 *
 * No JSON Forms.  No inject + lookup.  Each node flows through props;
 * dirtySignal reactivity is automatic.
 */
import { computed, inject } from 'vue'
import HStack from '../HStack.vue'
import HVStack from '../HVStack.vue'
import HGrid from '../HGrid.vue'
import FormField from './FormField.vue'
import { LAYOUT_MAP_KEY, GROUP_LAYOUT_KEY } from '../inject-keys'
import type { FieldLayoutMeta, GroupLayoutMeta } from '../inject-keys'

const props = defineProps<{ node: any }>()

const layoutMap = inject<Record<string, FieldLayoutMeta>>(LAYOUT_MAP_KEY, {})
const groupLayoutMap = inject<Record<string, GroupLayoutMeta>>(GROUP_LAYOUT_KEY, {})

// ── Group helpers ───────────────────────────────────────────────────────
const isGroup = computed(() => props.node?.type === 'group')

/** Group-node path — matches the JSON Schema object path. */
const groupPath = computed(() => (props.node?.path as string | undefined) ?? '')

/**
 * Group-level layout mode read from the GROUP_LAYOUT_KEY side-map.
 * meshflow uiSchema nodes are frozen proxies — we inject layout metadata
 * instead of setting it on the node.  Includes group label (schema `title`).
 */
const groupLayout = computed(() => groupLayoutMap[groupPath.value]?.layout ?? null)

/** Group label falls back to the side-map when meshflow doesn't set node.label. */
const groupLabel = computed(() => props.node?.label || groupLayoutMap[groupPath.value]?.label || '')

/**
 * Grid columns when layout is 'grid'.
 */
const gridColumns = computed(() => {
  const raw = groupLayoutMap[groupPath.value]?.gridColumns
  if (raw == null) return undefined
  return typeof raw === 'number' ? raw : String(raw)
})

/**
 * Group consecutive children sharing the same x-row into HStack rows.
 * When the group has x-layout: 'horizontal' all children go into one HStack.
 * When the group has x-layout: 'grid' the children render inside an HGrid.
 */
const rowSegments = computed(() => {
  const children: any[] = props.node?.children ?? []
  if (children.length === 0) return []

  // Grid layout: bundle all children into one grid segment
  if (groupLayout.value === 'grid') {
    return [{ layout: 'grid' as const, items: children }]
  }

  // Horizontal layout: single HStack with all children
  if (groupLayout.value === 'horizontal') {
    return [{ layout: 'horizontal' as const, items: children }]
  }

  // Default: group consecutive children sharing the same x-row
  const segments: { layout: 'horizontal' | 'vertical'; items: any[] }[] = []
  for (const child of children) {
    const meta: FieldLayoutMeta | undefined = layoutMap[child.path ?? '']
    const row = meta?.row ?? null
    const last = segments[segments.length - 1]
    if (last && last.layout === 'horizontal' && (layoutMap[last.items[0]?.path ?? '']?.row) === row && row != null) {
      last.items.push(child)
    } else if (row != null) {
      segments.push({ layout: 'horizontal', items: [child] })
    } else {
      segments.push({ layout: 'vertical', items: [child] })
    }
  }
  return segments
})

/** Get the col-span for a field node, if any. */
function fieldColSpan(child: any): number | undefined {
  return layoutMap[child.path ?? '']?.colSpan
}

/** Flex style for a field in a horizontal row (x-span flex-grow weight). */
function fieldFlexStyle(child: any): Record<string, string> {
  const span = layoutMap[child.path ?? '']?.span ?? 1
  return { flex: `${span} 1 180px`, minWidth: 'min(100%, 180px)' }
}
</script>

<template>
  <template v-if="isGroup">
    <fieldset v-if="groupLabel" class="ui-form__group">
      <legend class="ui-form__group-label">{{ groupLabel }}</legend>
      <template v-for="(seg, si) in rowSegments" :key="si">
        <!-- Grid layout → HGrid wrapper -->
        <HGrid
          v-if="seg.layout === 'grid'"
          :columns="gridColumns ?? 'auto-fit'"
          gap="sm"
        >
          <template v-for="child in seg.items" :key="child.uid ?? child.path">
            <div
              v-if="fieldColSpan(child)"
              :style="{ gridColumn: `span ${fieldColSpan(child)}` }"
            >
              <FormNode v-if="child.type === 'group'" :node="child" />
              <FormField v-else :node="child" />
            </div>
            <template v-else>
              <FormNode v-if="child.type === 'group'" :node="child" />
              <FormField v-else :node="child" />
            </template>
          </template>
        </HGrid>
        <!-- Horizontal row → HStack -->
        <HStack v-else-if="seg.layout === 'horizontal'" gap="sm" wrap>
          <template v-for="child in seg.items" :key="child.uid ?? child.path">
            <div :style="fieldFlexStyle(child)">
              <FormNode v-if="child.type === 'group'" :node="child" />
              <FormField v-else :node="child" />
            </div>
          </template>
        </HStack>
        <!-- Vertical (default) → HVStack -->
        <HVStack v-else gap="sm">
          <template v-for="child in seg.items" :key="child.uid ?? child.path">
            <FormNode v-if="child.type === 'group'" :node="child" />
            <FormField v-else :node="child" />
          </template>
        </HVStack>
      </template>
    </fieldset>
    <!-- Group without label → no fieldset wrapper -->
    <template v-else>
      <template v-for="(seg, si) in rowSegments" :key="si">
        <HGrid
          v-if="seg.layout === 'grid'"
          :columns="gridColumns ?? 'auto-fit'"
          gap="sm"
        >
          <template v-for="child in seg.items" :key="child.uid ?? child.path">
            <div
              v-if="fieldColSpan(child)"
              :style="{ gridColumn: `span ${fieldColSpan(child)}` }"
            >
              <FormNode v-if="child.type === 'group'" :node="child" />
              <FormField v-else :node="child" />
            </div>
            <template v-else>
              <FormNode v-if="child.type === 'group'" :node="child" />
              <FormField v-else :node="child" />
            </template>
          </template>
        </HGrid>
        <HStack v-else-if="seg.layout === 'horizontal'" gap="sm" wrap>
          <template v-for="child in seg.items" :key="child.uid ?? child.path">
            <div :style="fieldFlexStyle(child)">
              <FormNode v-if="child.type === 'group'" :node="child" />
              <FormField v-else :node="child" />
            </div>
          </template>
        </HStack>
        <HVStack v-else gap="sm">
          <template v-for="child in seg.items" :key="child.uid ?? child.path">
            <FormNode v-if="child.type === 'group'" :node="child" />
            <FormField v-else :node="child" />
          </template>
        </HVStack>
      </template>
    </template>
  </template>
  <!-- Leaf → delegate to FormField -->
  <FormField v-else :node="node" />
</template>
