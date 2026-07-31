/**
 * Form contract — framework-agnostic field schema types compatible with
 * {@link https://www.npmjs.com/package/@meshflow/form | @meshflow/form}.
 *
 * MeshFlow's internal form module (`useInternalForm`) processes these exact
 * shapes to register nodes in the DAG scheduler, so the types below mirror the
 * package's own `InputField`, `SelectField`, `CheckboxField`, and `GroupField`.
 */

// ── Base ──────────────────────────────────────────────────────────────

export interface FormFieldBaseContract {
  label: string
  name: string
  placeholder?: string
  disabled: boolean
  readonly: boolean
  hidden?: boolean
  validators?: any
  theme?: string
  /** Group consecutive fields with the same row key into an HStack row. */
  row?: string
}

// ── Leaf field contracts ──────────────────────────────────────────────

export interface FormInputFieldContract extends FormFieldBaseContract {
  type: 'input' | 'number'
  required: boolean
  min?: number
  maxLength: number
  value: string | number
}

export interface FormCheckboxFieldContract extends FormFieldBaseContract {
  type: 'checkbox'
  description?: string
  required: boolean
  value: boolean
}

export interface FormSelectFieldContract extends FormFieldBaseContract {
  type: 'select'
  required: boolean
  options: { label: string; value: any }[]
  value: any
}

// ── Group contract ────────────────────────────────────────────────────

export interface FormGroupFieldContract
  extends Omit<FormFieldBaseContract, 'label' | 'name' | 'placeholder' | 'validators'> {
  type: 'group'
  name?: string
  children: FormFieldContract[]
}

// ── Union ─────────────────────────────────────────────────────────────

export type FormFieldContract =
  | FormInputFieldContract
  | FormCheckboxFieldContract
  | FormSelectFieldContract
  | FormGroupFieldContract

// ── Linkage descriptor ────────────────────────────────────────────────

/**
 * Descriptor returned by {@link from}.
 * Mirrors `FromDescriptor` from `@meshflow/form`.
 */
export interface FormLinkageDescriptor {
  _isMeshFrom: true
  source: string | string[]
  logic: (...values: any[]) => any
  triggerKeys?: string[]
  effect?: (args: any) => any
  effectArgs?: string[]
}

// ── Helper: create a root-group wrapper ───────────────────────────────

/**
 * Wrap an array of field contracts in a root group so the MeshFlow internal
 * form module can process them as a tree.  The root group has an empty name
 * so path segments start directly from each child's `name`.
 */
export function toFormRootGroup(children: FormFieldContract[]): FormGroupFieldContract {
  return {
    type: 'group',
    name: '',
    disabled: false,
    readonly: false,
    children,
  }
}

// ── Utility: recursive walk ───────────────────────────────────────────

/** Call `fn` for every leaf (non-group) field in a form schema tree. */
export function walkFormLeaves(
  field: FormFieldContract,
  fn: (leaf: FormInputFieldContract | FormCheckboxFieldContract | FormSelectFieldContract, path: string) => void,
  parentPath = '',
): void {
  const seg = field.name || ''
  const path = parentPath ? `${parentPath}.${seg}` : seg

  if (field.type === 'group') {
    for (const child of field.children) {
      walkFormLeaves(child, fn, path)
    }
    return
  }

  fn(field, path)
}
