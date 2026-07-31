/**
 * Vue composable wrapping `useMeshFormJson` from `@meshflow/form` with Vue
 * reactivity. This is the engine layer — JSON Schema goes in, a DAG-powered
 * reactive form engine comes out.
 *
 * Pattern adapted from `@meshflow/form-vue`'s `useMeshFormVue`.
 */
import { ref, onUnmounted } from 'vue'
import { useMeshFormJson, deleteEngine } from '@meshflow/form'
import type { MeshFormSchema, FromDescriptor } from '@meshflow/form'
import { useLogger } from '@meshflow/logger'

export { deleteEngine }
export type { FromDescriptor, MeshFormSchema }

export { from } from '@meshflow/form'

export interface UseMeshFormJsonOptions {
  /** Use greedy scheduling (evaluate every downstream node, not just dirty ones). */
  useGreedy?: boolean
  /** If true, delete the engine on component unmount. Default: true. */
  autoDispose?: boolean
  /** Called inside meshflow's signalTrigger after each DAG propagation. */
  onTick?: () => void
}

export interface UseMeshFormJsonReturn {
  /** The reactive tick counter — bumping signals the engine finished a batch. */
  tick: ReturnType<typeof ref<number>>

  /** The raw meshflow engine instance (exposed for imperative API). */
  engine: any

  /** The uiSchema tree returned by the internal-form module. */
  uiSchema: any

  /** Flattened map of meshflow path → node proxy (for renderer injection). */
  nodeMap: Record<string, any>

  /** Register linkage rules defined with `from()`. */
  define: (rules: Record<string, FromDescriptor>) => void

  /**
   * Register bidirectional (entanglement) rules.
   *
   * Sugar over `engine.config.useEntangle({ cause, impact, via, emit })`.
   *
   * ```ts
   * form.entangle({
   *   paths: ['pricing.marginRate', 'pricing.quotePrice'],
   *   via: 'value',
   *   emit: (cause, impact, propose) => {
   *     if (cause.path === 'pricing.marginRate') {
   *       propose.set('pricing.quotePrice', Math.round(tc * (1 + cause.value / 100)))
   *     } else {
   *       propose.set('pricing.marginRate', (impact.value / tc - 1) * 100)
   *     }
   *   },
   * })
   * ```
   */
  entangle: (config: { paths: string[]; via?: string | string[]; emit: (...args: any[]) => any }) => any

  /** Get the full form data object (reads live values from the engine). */
  getFormData: () => Record<string, any>

  /** Dispose the engine. Call manually when autoDispose is false. */
  dispose: () => void
}

/**
 * Flatten the meshflow uiSchema tree into a path‑keyed map so renderers
 * can look up their node via `nodeMap[path]`.
 */
function buildNodeMap(node: any, map: Record<string, any> = {}): Record<string, any> {
  if (!node) return map
  if (node.path != null && node.path !== '') {
    map[node.path] = node
  }
  for (const child of node.children ?? []) {
    buildNodeMap(child, map)
  }
  return map
}

/**
 * Create a meshflow-powered form engine from a JSON Schema
 * (`MeshFormSchema` — the standard `type: 'object'`, `properties: {…}` format).
 *
 * @param id      Unique engine ID — must be unique across the app.
 * @param schema  JSON Schema compatible with `@meshflow/form`'s `MeshFormSchema`.
 * @param options Engine configuration.
 */
export function useMeshFlowForm(
  id: string,
  schema: MeshFormSchema,
  options: UseMeshFormJsonOptions = {},
): UseMeshFormJsonReturn {
  const { useGreedy = false, autoDispose = true, onTick } = options

  // ── Vue reactive dirty-signal ──────────────────────────────────────────
  // Shared tick for form-level change emission (bumps once per propagation).
  const tick = ref(0)

  // Debounce: signalTrigger fires per-node synchronously within one
  // propagation batch. Use a microtask gate so onTick / tick bump only
  // happen once per batch, not once per affected node.
  let gate = false

  // ── Pre-emptively clean up any stale engine with the same ID
  //    (e.g. from React StrictMode double-mount or HMR). ─────────────────
  try { deleteEngine(id) } catch { /* ignore */ }

  // ── Create meshflow engine from JSON Schema ────────────────────────────
  const engine = useMeshFormJson(id, schema, {
    UITrigger: {
      // Each node gets its OWN ref(0) — only the affected node's
      // dirtySignal bumps, so only that component re-renders.
      signalCreator: () => ref(0),
      signalTrigger: (s: any) => {
        s.value++
        if (!gate) {
          gate = true
          Promise.resolve().then(() => {
            gate = false
            tick.value++
            onTick?.()
          })
        }
      },
    },
    config: { useGreedy },
  })

  // ── Internal form module outputs ──────────────────────────────────────
  const internalForm = (engine as any).modules.internalModules
    .internalForm as {
    uiSchema: any
    GetFormData: () => Record<string, any>
  }

  // ── Debug: attach meshflow logger (plugin pattern from meshflow-docs) ──
  try {
    const logger = useLogger({ locale: 'zh' })
    engine.config.usePlugin(logger)
    console.log('[useMeshFormJson] @meshflow/logger plugin registered')
  } catch (e: any) {
    console.warn('[useMeshFormJson] logger plugin failed:', e.message)
  }

  const uiSchema = internalForm.uiSchema
  const nodeMap = buildNodeMap(uiSchema)
  const getFormData: () => Record<string, any> = () => internalForm.GetFormData()

  // ── Linkage helper ────────────────────────────────────────────────────
  /**
   * Register DAG linkage rules.
   *
   * Uses the engine's raw `config.SetRule` / `config.SetRules` API directly,
   * passing the FULL dotted leaf path as the target node (e.g.,
   * `project.pmDailyRate`) and the property key (`value`, `options`, etc.).
   *
   * We intentionally bypass `engine.define()` because meshflow's define
   * splits the target path into group-path + child-key (e.g.
   * `project` + `pmDailyRate`) and calls `GetNodeByPath(groupPath)` —
   * but `GetNodeByPath` only returns leaf nodes, not group nodes.
   *
   * Instead we resolve the full leaf path and let `config.SetRule` look
   * up `GetNodeByPath(leafPath)` which succeeds, then set up the
   * dependency on `leafNode.nodeBucket[triggerKey]`.
   */
  /** Node properties that can be driven by DAG rules (not just `value`). */
  const NODE_PROPS = new Set(['value', 'hidden', 'disabled', 'readonly', 'options', 'required', 'label', 'placeholder'])

  function define(rules: Record<string, FromDescriptor>): void {
    const config = (engine as any).config

    for (const [targetPath, descriptor] of Object.entries(rules)) {
      const { source, logic, triggerKeys, effect, effectArgs } = descriptor

      // ── Resolve node path + property key ────────────────────────────────
      // Meshflow's own engine.define() splits `a.b.hidden` → nodePath=`a.b`
      // + propKey=`hidden`. We replicate that here since we bypass engine.define().
      const lastDot = targetPath.lastIndexOf('.')
      const suffix = lastDot > 0 ? targetPath.slice(lastDot + 1) : ''
      const propKey = NODE_PROPS.has(suffix) ? suffix : 'value'
      const nodePath = NODE_PROPS.has(suffix) ? targetPath.slice(0, lastDot) : targetPath

      // Mirror meshflow's own define() wrapper:
      //   logic: h => { h.slot.triggerTargets.map(p => p.value) … }
      // The runtime passes a context `h` with `h.slot.triggerTargets` containing
      // the source node state snapshots.
      const options: Record<string, any> = {
        logic: (h: any) => {
          const values = h.slot.triggerTargets.map((t: any) => t.value)
          return logic(...values)
        },
        triggerKeys: triggerKeys ?? ['value'],
      }
      if (effect != null) {
        options.effect = effect
        options.effectArgs = effectArgs as any
      }

      if (Array.isArray(source)) {
        config.SetRules(source as string[], nodePath, propKey, options)
      } else {
        config.SetRule(source as string, nodePath, propKey, options)
      }
    }
  }

  // ── Entanglement helper ───────────────────────────────────────────────
  /**
   * Simplified grammar over `engine.config.useEntangle({ cause, impact, via, emit })`.
   *
   * Engine-level entangle expects one config per pair, with explicit `cause` +
   * `impact`.  This wrapper takes a `paths` array and registers all N*(N-1)
   * directional pairs internally so callers just write:
   *
   * ```ts
   * form.entangle({
   *   paths: ['pricing.marginRate', 'pricing.quotePrice'],
   *   via: 'value',
   *   emit: (a, b, propose) => { … },
   * })
   * ```
   */
  function entangle(config: {
    paths: string[]
    via?: string | string[]
    emit: (...args: any[]) => any
  }): void {
    const { paths, via = 'value', emit } = config
    const viaKeys = Array.isArray(via) ? via : [via]
    for (let i = 0; i < paths.length; i++) {
      for (let j = 0; j < paths.length; j++) {
        if (i === j) continue
        // isProxy: true → cause/impact arrive as simple {value} proxies
        // instead of full MeshFlowTaskNode objects.
        // We wrap emit so callers still receive {path, state}.
        ;(engine as any).config.useEntangle({
          cause: paths[i],
          impact: paths[j],
          via: viaKeys,
          isProxy: true,
          emit: (causeNode: any, impactNode: any, propose: any) => {
            emit(
              { path: paths[i], state: causeNode.value },
              { path: paths[j], state: impactNode.value },
              propose,
            )
          },
        })
      }
    }
  }

  // ── Cleanup ────────────────────────────────────────────────────────────
  function dispose(): void {
    try {
      deleteEngine(id)
    } catch {
      /* engine may already be gone */
    }
  }

  if (autoDispose) {
    onUnmounted(dispose)
  }

  return {
    tick,
    engine: engine as any,
    uiSchema,
    nodeMap,
    define,
    entangle,
    getFormData,
    dispose,
  }
}
