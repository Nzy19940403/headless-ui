<script setup lang="ts">
/**
 * Leaf field wrapper — receives a meshflow node as a prop.
 *
 * The node carries its own `dirtySignal` (a Vue ref), so when meshflow
 * bumps it this component automatically re-evaluates its computed
 * properties.  No inject + lookup — just plain Vue props reactivity,
 * exactly like the meshflow demo's CheckboxWidget pattern.
 */
import { computed, inject, nextTick, ref, watch } from 'vue'
import HInput from '../HInput.vue'
import HNumberInput from '../HNumberInput.vue'
import HSelect from '../HSelect.vue'
import HCheckbox from '../HCheckbox.vue'
import { FORM_ERRORS_KEY, TOUCHED_KEY, VALIDATE_FIELD_KEY, SCHEMA_EXTRAS_KEY } from '../inject-keys'

const props = defineProps<{ node: any }>()

const formErrors = inject(FORM_ERRORS_KEY)
const touchedSet = inject(TOUCHED_KEY)
const validateField = inject(VALIDATE_FIELD_KEY)
const schemaExtras = inject(SCHEMA_EXTRAS_KEY, {})

// ── Reactive touch-point ────────────────────────────────────────────────
// meshflow state lives in plain objects (node.value, node.disabled, etc.).
// When the DAG engine mutates state it bumps `node.dirtySignal` (a Vue ref).
// We MUST reference dirtySignal in every computed so Vue re-evaluates after
// DAG propagation — otherwise the UI is blind to meshflow-driven changes.
const _d = computed(() => props.node?.dirtySignal?.value)

// ── Local value refs for Ark UI binding ─────────────────────────────────
// Ark UI components (NumberInput, Select, Input) use modelValue in
// "controlled" mode — the displayed value is gated by the prop. When the
// user clicks +/- or picks a select item the @value-change fires, but the
// internal display only updates when the :model-value prop changes.
//
// Problem: our :model-value is a computed off meshflow's node.value →
// dependOn() sets state.value → dirtySignal bumps → computed re-evaluates
// → Vue re-renders. In theory this is synchronous, but Ark/Zag's controlled
// mode can reject the user's input before the prop update lands.
//
// Fix: bind Ark UI to a plain Vue ref. When the user interacts we update
// the ref *immediately* (Ark sees the new value right away) and then
// notify meshflow. When meshflow pushes a change (DAG rule, entangle,
// initial data) the watch on dirtySignal syncs the ref.
//
// For select, keep the raw value so numeric option values match correctly
// (Ark UI Select compares values strictly). Ark NumberInput uses strings
// internally so 'number' types get stringified.
const inputValue = ref(
  props.node?.type === 'select'
    ? (props.node?.value ?? '')
    : String(props.node?.value ?? ''),
)
const inputChecked = ref(Boolean(props.node?.value))

// Sync: meshflow → local ref (external changes: DAG rules, entangle, init)
watch(
  () => props.node?.dirtySignal?.value,
  () => {
    const v = props.node?.value
    inputValue.value = props.node?.type === 'select' ? (v ?? '') : (v != null ? String(v) : '')
    inputChecked.value = Boolean(v)
  },
)

// ── Per-field widget resolver — a simple computed ──────────────────────
const widgetType = computed(() => {
  void _d.value
  const n = props.node
  if (!n) return 'input'
  if (n.type === 'select' || n.type === 'checkbox' || n.type === 'number') return n.type
  const hasOptions = Array.isArray(n.options) && n.options.length > 0
  if (hasOptions) return 'select'
  if (n.value !== undefined && typeof n.value === 'boolean') return 'checkbox'
  return 'input'
})

const fieldLabel = computed(() => { void _d.value; return props.node?.label ?? '' })
const fieldPlaceholder = computed(() => { void _d.value; return props.node?.placeholder ?? '' })
const fieldDisabled = computed(() => { void _d.value; return !!props.node?.disabled })
const fieldReadonly = computed(() => { void _d.value; return !!props.node?.readonly })
const fieldRequired = computed(() => { void _d.value; return !!props.node?.required })
const fieldMin = computed(() => { void _d.value; return props.node?.min })
const fieldStep = computed(() => { void _d.value; return schemaExtras[props.node?.path]?.step })
const fieldMax = computed(() => { void _d.value; return schemaExtras[props.node?.path]?.max })
const fieldMaxLength = computed(() => { void _d.value; return props.node?.maxLength })
const fieldHidden = computed(() => { void _d.value; return !!props.node?.hidden })

const selectItems = computed(() => {
  void _d.value
  return (props.node?.options ?? []).map((o: any) => ({
    label: String(o.label ?? o),
    value: o.value ?? o,
  }))
})

const fieldError = computed(() => {
  const err = formErrors?.value[props.node?.path]
  return err || undefined
})

const isTouched = computed(() => touchedSet?.value.has(props.node?.path) ?? false)

const path = computed(() => props.node?.path ?? '')

// ── Event handlers ─────────────────────────────────────────────────────
function onFieldChange(val: string | boolean) {
  // Update local ref immediately so Ark UI displays the new value
  // Selects keep raw value type; Ark NumberInput/Input use strings
  const n = props.node
  inputValue.value = n?.type === 'select' ? val : String(val)
  inputChecked.value = Boolean(val)
  // Notify meshflow engine — convert numbers so DAG addition rules work
  const finalVal = n?.type === 'number' ? Number(val) : val
  props.node?.dependOn?.(() => finalVal, 'value')
  if (isTouched.value && validateField) {
    nextTick(() => validateField(path.value))
  }
}
</script>

<template>
  <HSelect
    v-if="!fieldHidden && widgetType === 'select'"
    :label="fieldLabel"
    :placeholder="fieldPlaceholder || 'Select…'"
    :items="selectItems"
    :value="inputValue"
    :disabled="fieldDisabled"
    :error="fieldError"
    @value-change="(d: { value: string | number }) => onFieldChange(d.value)"
  />
  <HCheckbox
    v-else-if="!fieldHidden && widgetType === 'checkbox'"
    :label="fieldLabel"
    :checked="inputChecked"
    :disabled="fieldDisabled"
    :error="fieldError"
    @checked-change="(d: { checked: boolean }) => onFieldChange(d.checked)"
  />
  <HNumberInput
    v-else-if="!fieldHidden && widgetType === 'number'"
    :label="fieldLabel"
    :placeholder="fieldPlaceholder"
    :value="inputValue"
    :disabled="fieldDisabled"
    :read-only="fieldReadonly"
    :required="fieldRequired"
    :min="fieldMin"
    :max="fieldMax"
    :step="fieldStep"
    :error="fieldError"
    @value-change="(d: { value: string | number }) => onFieldChange(d.value)"
  />
  <HInput
    v-else-if="!fieldHidden"
    :label="fieldLabel"
    :placeholder="fieldPlaceholder"
    :value="inputValue"
    :disabled="fieldDisabled"
    :read-only="fieldReadonly"
    :required="fieldRequired"
    :max-length="fieldMaxLength"
    :error="fieldError"
    @value-change="(d: { value: string | number }) => onFieldChange(d.value)"
  />
</template>
