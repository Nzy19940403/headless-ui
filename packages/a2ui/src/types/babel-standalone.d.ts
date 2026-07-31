/**
 * Type shim for @babel/standalone (Babel 8.x).
 *
 * We only use a handful of APIs, so this is deliberately minimal.
 */
declare module '@babel/standalone' {
  export interface BabelTransformOptions {
    presets?: (string | [string, Record<string, unknown>])[]
    filename?: string
    ast?: boolean
    compact?: boolean
  }

  export interface BabelTransformResult {
    code?: string
    map?: string | null
    ast?: unknown | null
  }

  export function transform(
    code: string,
    options: BabelTransformOptions,
  ): BabelTransformResult | null
}
