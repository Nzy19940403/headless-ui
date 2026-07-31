<script setup lang="ts">
import { ref, shallowRef, computed, provide, onMounted } from 'vue'
import type { FromDescriptor, MeshFormSchema } from '@meshflow/form'
import { isObjectSchema, type ObjectSchemaX } from '@demo/ui-form'
import { useMeshFlowForm } from './form/useMeshFormJson'
import { resolveValidators } from '@demo/ui-form'
import type { FormValidatorFn } from '@demo/ui-form'
import FormNode from './form/FormNode.vue'
import type { FieldLayoutMeta, GroupLayoutMeta } from './inject-keys'
import { FORM_ERRORS_KEY, TOUCHED_KEY, VALIDATE_FIELD_KEY, LAYOUT_MAP_KEY, GROUP_LAYOUT_KEY, SCHEMA_EXTRAS_KEY } from './inject-keys'

const props = withDefaults(defineProps<{
  id?: string
  schema: ObjectSchemaX
  data?: Record<string, any>
  rules?: Record<string, FromDescriptor>
  useGreedy?: boolean
  customValidators?: Record<string, FormValidatorFn[]>
  customFns?: Record<string, FormValidatorFn>
}>(), {
  id: () => `hform-${Math.random().toString(36).slice(2, 11)}`,
})

const emit = defineEmits<{
  change: [data: Record<string, any>]
  submit: [data: Record<string, any>]
}>()

// ── Reactive state (provided for children) ──────────────────────────────
const errors = ref<Record<string, string>>({})
provide(FORM_ERRORS_KEY, errors)

const nodeMapRef = shallowRef<Record<string, any>>({})

// ── Touched tracking — fields become touched on blur or submit ──────────
const touched = ref(new Set<string>())
provide(TOUCHED_KEY, touched)
provide(VALIDATE_FIELD_KEY, validateField)

// ── Lazy engine state — created in onMounted ────────────────────────────
const ready = ref(false)
const uiSchemaRef = shallowRef<any>(null)
let getFormData: () => Record<string, any> = () => ({})
let entangle: (config: any) => any = () => {}

/**
 * Build a flat `path → FieldLayoutMeta` map from the JSON Schema so
 * FormNode can group sibling fields and apply grid column spans
 * without mutating the uiSchema.
 */
function buildLayoutAnnotations(
  schema: ObjectSchemaX,
  annotations: Record<string, FieldLayoutMeta> = {},
  parentPath = '',
): Record<string, FieldLayoutMeta> {
  for (const [key, field] of Object.entries(schema.properties ?? {})) {
    const path = parentPath ? `${parentPath}.${key}` : key
    if (isObjectSchema(field)) {
      buildLayoutAnnotations(field, annotations, path)
    } else {
      const row = field['x-row']
      const span = field['x-span']
      const colSpan = field['x-col-span']
      if (row || span || colSpan) {
        const meta: FieldLayoutMeta = {}
        if (row) meta.row = row
        if (span != null) meta.span = span
        if (colSpan != null) meta.colSpan = colSpan
        annotations[path] = meta
      }
    }
  }
  return annotations
}

// ── Layout annotations — build path → FieldLayoutMeta map from schema
const layoutAnnotations = buildLayoutAnnotations(props.schema)
provide(LAYOUT_MAP_KEY, layoutAnnotations)

const resolvedValidators = resolveValidators(props.schema, props.customFns)
if (props.customValidators) {
  for (const [path, fns] of Object.entries(props.customValidators)) {
    if (!resolvedValidators.validators[path]) resolvedValidators.validators[path] = []
    resolvedValidators.validators[path].push(...fns)
  }
}

// ── Validation helpers ─────────────────────────────────────────────────
function runValidators(): boolean {
  const next: Record<string, string> = {}
  let allValid = true
  const map = nodeMapRef.value
  for (const [path, fns] of Object.entries(resolvedValidators.validators)) {
    const node = map[path]
    if (!node || node.disabled || node.hidden) continue
    const getByPath = (p: string) => map[p]?.value
    for (const fn of fns) {
      const result = fn(node.value, getByPath)
      if (result !== true) { next[path] = result; allValid = false; break }
    }
  }
  errors.value = next
  return allValid
}
function validate(): boolean { return runValidators() }
function validateField(path: string): string {
  const fns = resolvedValidators.validators[path]
  if (!fns?.length) return ''
  const map = nodeMapRef.value
  const node = map[path]
  if (!node) return ''
  const getByPath = (p: string) => map[p]?.value
  for (const fn of fns) {
    const result = fn(node.value, getByPath)
    if (result !== true) { errors.value = { ...errors.value, [path]: result }; return result }
  }
  const next = { ...errors.value }
  delete next[path]
  errors.value = next
  return ''
}
function clearErrors(): void { errors.value = {} }
function setError(path: string, message: string): void {
  errors.value = { ...errors.value, [path]: message }
}
const isValid = computed(() => Object.values(errors.value).every(v => !v))

function submit(): boolean {
  for (const path of Object.keys(resolvedValidators.validators)) {
    touched.value.add(path)
  }
  touched.value = new Set(touched.value)
  const data = getFormData()
  const ok = validate()
  if (ok) emit('submit', data)
  return ok
}

defineExpose({
  getFormData: () => getFormData(),
  submit,
  entangle: (c: any) => entangle(c),
  get nodeMap() { return nodeMapRef.value },
  validate, validateField, clearErrors, setError, errors, isValid,
})

// ── Lifecycle ──────────────────────────────────────────────────────────
onMounted(async () => {
  const form = useMeshFlowForm(props.id, props.schema as MeshFormSchema, {
    useGreedy: props.useGreedy,
    autoDispose: true,
    onTick: () => emit('change', JSON.parse(JSON.stringify(getFormData()))),
  })

  nodeMapRef.value = form.nodeMap
  uiSchemaRef.value = form.uiSchema
  getFormData = form.getFormData
  entangle = form.entangle

  // ── Propagate x-* custom schema properties via inject side-map ──────────
  // meshflow internal-form only maps a standard subset (min, maxLength).
  // x-step / x-max are custom extensions → carry them in a separate map
  // so FormField can read them without touching the node proxy.
  const schemaExtras: Record<string, { step?: number; max?: number }> = {}
  ;(function collectExtras(schema: ObjectSchemaX, prefix = '') {
    for (const [key, field] of Object.entries(schema.properties ?? {})) {
      const path = prefix ? `${prefix}.${key}` : key
      if (isObjectSchema(field)) {
        collectExtras(field, path)
      } else {
        const extras: { step?: number; max?: number } = {}
        if (field['x-step'] != null) extras.step = field['x-step']
        if (field['x-max'] != null) extras.max = field['x-max']
        if (Object.keys(extras).length > 0) schemaExtras[path] = extras
      }
    }
  })(props.schema)
  provide(SCHEMA_EXTRAS_KEY, schemaExtras)

  // ── Collect group-level layout annotations via side-map ──────────────────
  // meshflow uiSchema nodes are frozen proxies — we can't set arbitrary
  // properties on them.  Instead provide a path→GroupLayoutMeta map that
  // FormNode reads via inject.
  //
  // Key: group-path as it appears in the uiSchema root node.
  //   • root schema → '' (uiSchema root has empty path)
  //   • nested object `project` → 'project'
  //   • nested object inside project → NOT applicable (no sub-objects exist)
  const groupLayouts: Record<string, GroupLayoutMeta> = {}
  // Root schema
  if (props.schema['x-layout'] != null || props.schema['x-grid-columns'] != null) {
    groupLayouts[''] = {
      label: props.schema.title,
      layout: props.schema['x-layout'],
      gridColumns: props.schema['x-grid-columns'],
    }
  }
  ;(function collectGroupLayouts(schema: ObjectSchemaX, prefix = '') {
    for (const [key, field] of Object.entries(schema.properties ?? {})) {
      if (isObjectSchema(field)) {
        const path = prefix ? `${prefix}.${key}` : key
        const meta: GroupLayoutMeta = {}
        if (field.title) meta.label = field.title
        if (field['x-layout'] != null) meta.layout = field['x-layout']
        if (field['x-grid-columns'] != null) meta.gridColumns = field['x-grid-columns']
        if (Object.keys(meta).length > 0) groupLayouts[path] = meta
        collectGroupLayouts(field, path)
      }
    }
  })(props.schema)
  provide(GROUP_LAYOUT_KEY, groupLayouts)
  // ──────────────────────────────────────────────────────────────────────────

  if (props.rules) {
    form.define(props.rules)
  }

  if (props.data) {
    const flatten = (obj: Record<string, any>, prefix = ''): Record<string, any> => {
      const r: Record<string, any> = {}
      for (const [k, v] of Object.entries(obj)) {
        const path = prefix ? `${prefix}.${k}` : k
        if (v != null && typeof v === 'object' && !Array.isArray(v)) Object.assign(r, flatten(v, path))
        else r[path] = v
      }
      return r
    }
    for (const [path, value] of Object.entries(flatten(props.data))) {
      form.nodeMap[path]?.dependOn?.(() => value, 'value')
    }
  }

  await form.engine.config.notifyAll?.()
  ready.value = true
})

</script>

<template>
  <div v-if="ready && uiSchemaRef" class="ui-form">
    <FormNode :node="uiSchemaRef" />
  </div>
</template>
