# AI component references

Start here before changing component implementations.

Do not load every file in this directory by default. Read this README first, then open only the task-specific references below.

This directory contains offline documentation snapshots for AI agents (Ark UI, Zag, TanStack Table, and local rules). Prefer these files over live network docs so every LLM shares the same reference.

## Which file to consult

| Task | Reference |
| --- | --- |
| Understand Ark UI component anatomy | `ark-ui-llms-full.txt` |
| Implement React renderer | `ark-ui-llms-react.txt` |
| Implement Vue renderer | `ark-ui-llms-vue.txt` |
| Implement framework-agnostic behavior | `zag-llms-full.txt` |
| Implement a Web Component renderer | `zag-llms-full.txt`, then the component-specific Zag section |
| Implement or review Web Component state handling | `wc-state-source-rules.txt`, `wc-zag-spread-props-rule.txt`, then `zag-llms-full.txt` |
| Implement or review Lit-based Web Components | `packages/web-components/src/lit-policy.md`, `wc-zag-spread-props-rule.txt`, then the component-specific Zag section |
| Vue wrapper optional boolean / controlled prop forwarding | `vue-wrapper-prop-forwarding-rules.txt` |
| Form field contracts for future MeshFlow | `form-meshflow-ready.md` |
| **TanStack Table** (offline) | `tanstack-table/README.md` then `tanstack-table/llms.txt` |
| TanStack Table React adapter | `tanstack-table/docs/framework/react/react-table.md` |
| TanStack Table Vue adapter | `tanstack-table/docs/framework/vue/vue-table.md` |
| TanStack Table Lit / vanilla | `tanstack-table/docs/framework/lit/lit-table.md`, `tanstack-table/docs/vanilla.md` |
| TanStack Table core API | `tanstack-table/docs/api/core/*.md` |
| Implement / review **HTable** | `tanstack-table/llms.txt` + `docs/api/table/README.md` + `packages/core/src/table-contract.ts` |
| Implement / review **HChart** | `docs/api/chart/README.md` + `packages/core/src/chart-contract.ts` + `packages/chart/src/*` |
| Implement / review **HTree** | `docs/api/tree/README.md` + `packages/core/src/tree-contract.ts` + Ark TreeView virtualization docs |
| Implement / review **layout primitives** | `docs/api/layout/README.md` + `packages/core/src/layout-contract.ts` |

## Implementation rule

1. Find the component in the Ark UI reference.
2. Find the matching machine and `connect` API in the Zag reference.
3. Keep React and Vue on Ark UI's official renderers.
4. Implement Web Components with the same Zag machine, anatomy, and DOM props.
5. Keep styling in the shared design tokens and renderer styles.
6. For Web Components, follow `wc-state-source-rules.txt`: one state owner, no duplicated visual state, and no handwritten behavior that conflicts with Zag props.
7. For Web Components using `@zag-js/vanilla` `spreadProps`, follow `wc-zag-spread-props-rule.txt`: do not run spread cleanup before routine re-binds, or stale CSS state attrs can remain on old nodes.
8. For layout primitives, do not use Ark/Zag/TanStack. Map props to `ui-*` classes and CSS variables; responsive behavior must be CSS-only.

The files are snapshots. Refresh them when upgrading Ark UI or Zag.
