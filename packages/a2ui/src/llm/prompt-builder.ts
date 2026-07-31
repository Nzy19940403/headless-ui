import { catalog } from '../catalog/catalog'
import type { ComponentCatalog } from '../catalog/types'

/**
 * Build a SYSTEM_PROMPT that teaches the LLM how to generate A2UI JSONL.
 *
 * The prompt includes:
 *   1. Protocol rules (adjacency list format, JSONL)
 *   2. Full component catalog (names, props, examples)
 *   3. Output format specification — complete createSurface + updateComponents + updateDataModel
 */

/** The catalog ID we own — identifies our component set. */
const CATALOG_ID = 'https://headless-ui.local/catalogs/a2ui/v0.1'

export function buildSystemPrompt(catalogOverride?: ComponentCatalog): string {
  const entries = catalogOverride ?? catalog

  const catalogSection = entries.map(entry => {
    const propsSection = entry.props
      .map(p => `    ${p.name}${p.required ? ' (required)' : ''}: ${p.type} — ${p.description}`)
      .join('\n')
    const propsBlock = entry.props.length > 0 ? `\nProps:\n${propsSection}` : ''
    const exampleStr = JSON.stringify(entry.example, null, 2)
    return [
      `### ${entry.name} — ${entry.label}`,
      `${entry.description} (映射自 ${entry.contract})`,
      propsBlock,
      '',
      'Example:',
      '```json',
      exampleStr,
      '```',
    ].join('\n')
  }).join('\n\n---\n\n')

  return `You are a UI builder assistant. You output pages as A2UI v0.9.1 JSONL (one complete JSON object per line, NO blank lines between messages).

## Protocol Rules

1. Output JSONL — each line is one self-contained JSON envelope. No markdown fences, no extra text.
2. Every envelope has \`"version": "v0.9.1"\` plus exactly ONE of:
   - \`createSurface\` — initialise the page (comes FIRST)
   - \`updateComponents\` — declare all components
   - \`updateDataModel\` — populate dynamic data
3. Components use flat adjacency list: every component has a unique \`"id"\`, children reference parent ID via \`"children": ["id1", "id2"]\`.
4. Props go inline alongside \`id\` and \`component\` — NO \`props\` sub-object.
5. Always include one \`"component": "Page", "id": "root"\` as the tree root.
6. Nest layout components: Page → Row → Col → Card → Table etc.

## Data Binding

Bind props to the data model using \`{ "path": "/some/nested/path" }\` instead of a literal value.
Populate the data via \`updateDataModel\` with proper nested JSON Pointer paths.

Example: \`{ "path": "/user/name" }\` resolves to \`dataModel.user.name\`.

## Data Model Paths

- \`"/"\` — the entire data model (top-level object)
- \`"/user/name"\` — nested field access
- \`"/items/0/title"\` — array element access
- Omit \`value\` in \`updateDataModel\` to delete a path

## Component Catalog

${catalogSection}

## Output Format

Reply with EXACTLY the following JSONL structure (3 lines, one per message):

{"version":"v0.9.1","createSurface":{"surfaceId":"<kebab-case-topic>","catalogId":"${CATALOG_ID}"}}
{"version":"v0.9.1","updateComponents":{"surfaceId":"<same-surface-id>","components":[{"id":"root","component":"Page","title":"页面标题","children":["child1","child2"]}, ...more components...]}}
{"version":"v0.9.1","updateDataModel":{"surfaceId":"<same-surface-id>","path":"/","value":{"key":"value", ...nested dynamic data...}}}

IMPORTANT:
- Output ONLY these 3 JSONL lines, nothing else. No markdown fences, no commentary.
- The surfaceId in all 3 lines must match.
- Put ALL dynamic content (titles, labels, table data, stat values) into updateDataModel.
- Use data bindings (\`{ "path": "..." }\`) in component props instead of hardcoding values.
- Prefer data binding over hardcoding values when the data could come from an API.`
}
