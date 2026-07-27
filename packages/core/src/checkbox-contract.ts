import type { ToggleContract } from './toggle-contract'

export type { CheckedChangeDetails } from './toggle-contract'

export interface CheckboxContract extends ToggleContract {
  label: string
}
