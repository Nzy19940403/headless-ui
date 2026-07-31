/**
 * Catalog entry — one A2UI component type registered from a core contract.
 *
 * This is the bridge between "what the LLM knows about" and "what props our
 * H* components actually accept."
 */

/** A single prop descriptor the LLM sees in the system prompt. */
export interface CatalogPropDef {
  name: string
  type: string // human-readable TS type, e.g. "string" | "string | number" | "SelectItemContract[]"
  required: boolean
  description: string
}

/** Catalog entry that describes one component type to the LLM. */
export interface CatalogEntry {
  /** A2UI component name (kebab-case). LLM outputs this in `"component"` field. */
  name: string
  /** Short human label shown in the prompt. */
  label: string
  /** Which core contract this maps to. */
  contract: string
  /** Props exposed to the LLM. Every entry ends up in the system prompt. */
  props: CatalogPropDef[]
  /** Quick description for the prompt intro. */
  description: string
  /** A compact JSON example the LLM can use as a template. */
  example: Record<string, unknown>
}

/** The full catalog — generated once, consumed by the prompt builder + renderer. */
export type ComponentCatalog = CatalogEntry[]
