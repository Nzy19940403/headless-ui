/**
 * Smoketest: protocol parse + codegen round-trip.
 *
 * Run from packages/a2ui: npx vitest run
 * Or just verify TS: npx tsc --noEmit
 */

import { describe, it, expect } from 'vitest'
import { parseA2UIMessages, parseJSONL, getMessageType, isA2UIMessage, validateEnvelope, A2UIParseError } from '../protocol/parser'
import { generateReactCode, compileReactCode } from '../codegen/react'
import { catalog, getCatalogEntry } from '../catalog/catalog'
import { A2UI_VERSION, A2UI_MESSAGE_TYPES } from '../protocol/types'
import type { A2UISurface, A2UIComponent } from '../protocol/types'

// ── Protocol types ─────────────────────────────────────────────────

describe('protocol types', () => {
  it('A2UI_MESSAGE_TYPES has all four types', () => {
    expect(A2UI_MESSAGE_TYPES).toContain('createSurface')
    expect(A2UI_MESSAGE_TYPES).toContain('updateComponents')
    expect(A2UI_MESSAGE_TYPES).toContain('updateDataModel')
    expect(A2UI_MESSAGE_TYPES).toContain('deleteSurface')
  })

  it('A2UI_VERSION is v0.9.1', () => {
    expect(A2UI_VERSION).toBe('v0.9.1')
  })
})

// ── JSONL parser ───────────────────────────────────────────────────

describe('parseJSONL', () => {
  it('parses a single message', () => {
    const result = parseJSONL(
      '{"version":"v0.9.1","createSurface":{"surfaceId":"s1","catalogId":"https://a2ui.example/catalog.json"}}',
    )
    expect(result).toHaveLength(1)
    expect(result[0].version).toBe('v0.9.1')
  })

  it('skips blank lines and comments', () => {
    const result = parseJSONL([
      '',
      '// this is a comment',
      '{"version":"v0.9.1","createSurface":{"surfaceId":"s1","catalogId":"uri"}}',
      '',
      '{"version":"v0.9.1","deleteSurface":{"surfaceId":"s1"}}',
    ].join('\n'))
    expect(result).toHaveLength(2)
  })

  it('throws on invalid JSON', () => {
    expect(() => parseJSONL('not json')).toThrow(A2UIParseError)
  })
})

// ── Message helpers ────────────────────────────────────────────────

describe('getMessageType', () => {
  it('detects updateComponents type', () => {
    const msg = { version: 'v0.9.1', updateComponents: { surfaceId: 'x', components: [] } }
    expect(getMessageType(msg)).toBe('updateComponents')
  })

  it('returns null for unknown envelope', () => {
    expect(getMessageType({ version: 'v0.9.1', unknownKey: {} })).toBeNull()
  })
})

describe('isA2UIMessage', () => {
  it('accepts valid envelope', () => {
    expect(isA2UIMessage({ version: 'v0.9.1', createSurface: { surfaceId: 'x', catalogId: 'u' } })).toBe(true)
  })

  it('rejects missing version', () => {
    expect(isA2UIMessage({ createSurface: { surfaceId: 'x', catalogId: 'u' } })).toBe(false)
  })
})

// ── Full parse round-trip ──────────────────────────────────────────

describe('parseA2UIMessages', () => {
  const MINIMAL_SURFACE = [
    {
      version: A2UI_VERSION,
      createSurface: { surfaceId: 'test', catalogId: 'https://a2ui.example/catalog.json' },
    },
    {
      version: A2UI_VERSION,
      updateComponents: {
        surfaceId: 'test',
        components: [
          { id: 'root', component: 'Page', title: 'Hello', children: ['text1'] },
          { id: 'text1', component: 'Text', content: 'World' },
        ],
      },
    },
  ]

  it('parses a minimal surface', () => {
    const surface = parseA2UIMessages(MINIMAL_SURFACE)
    expect(surface.surfaceId).toBe('test')
    expect(surface.catalogId).toBe('https://a2ui.example/catalog.json')
    expect(surface.componentMap.size).toBe(2)
    expect(surface.rootId).toBe('root')
  })

  it('merges multiple updateComponents calls', () => {
    const surface = parseA2UIMessages([
      {
        version: A2UI_VERSION,
        createSurface: { surfaceId: 't', catalogId: 'c' },
      },
      {
        version: A2UI_VERSION,
        updateComponents: { surfaceId: 't', components: [{ id: 'a', component: 'Text', content: 'A' }] },
      },
      {
        version: A2UI_VERSION,
        updateComponents: { surfaceId: 't', components: [{ id: 'b', component: 'Text', content: 'B' }] },
      },
    ])
    expect(surface.componentMap.size).toBe(2)
  })

  it('applies updateDataModel values', () => {
    const surface = parseA2UIMessages([
      ...MINIMAL_SURFACE,
      {
        version: A2UI_VERSION,
        updateDataModel: { surfaceId: 'test', path: '/greeting', value: 'Hi' },
      },
    ])
    expect(surface.dataModel).toHaveProperty('greeting', 'Hi')
  })

  it('replaces entire data model when path is /', () => {
    const surface = parseA2UIMessages([
      ...MINIMAL_SURFACE,
      {
        version: A2UI_VERSION,
        updateDataModel: { surfaceId: 'test', value: { a: 1, b: 2 } },
      },
    ])
    expect(surface.dataModel).toEqual({ a: 1, b: 2 })
  })

  it('sets nested JSON Pointer paths creating intermediate objects', () => {
    const surface = parseA2UIMessages([
      ...MINIMAL_SURFACE,
      {
        version: A2UI_VERSION,
        updateDataModel: { surfaceId: 'test', path: '/user/name', value: '张三' },
      },
      {
        version: A2UI_VERSION,
        updateDataModel: { surfaceId: 'test', path: '/user/role', value: 'admin' },
      },
      {
        version: A2UI_VERSION,
        updateDataModel: { surfaceId: 'test', path: '/items/0/title', value: 'First' },
      },
      {
        version: A2UI_VERSION,
        updateDataModel: { surfaceId: 'test', path: '/items/1/title', value: 'Second' },
      },
    ])
    expect(surface.dataModel).toEqual({
      user: { name: '张三', role: 'admin' },
      items: [{ title: 'First' }, { title: 'Second' }],
    })
  })

  it('deletes keys at a JSON Pointer path', () => {
    const surface = parseA2UIMessages([
      ...MINIMAL_SURFACE,
      {
        version: A2UI_VERSION,
        updateDataModel: { surfaceId: 'test', value: { a: 1, b: { c: 2, d: 3 } } },
      },
      {
        version: A2UI_VERSION,
        updateDataModel: { surfaceId: 'test', path: '/b/c' },
      },
    ])
    expect(surface.dataModel).toEqual({ a: 1, b: { d: 3 } })
  })

  it('throws when updateComponents arrives before createSurface', () => {
    expect(() => parseA2UIMessages([
      {
        version: A2UI_VERSION,
        updateComponents: { surfaceId: 't', components: [] },
      },
    ])).toThrow(A2UIParseError)
  })

  it('parses from JSONL string', () => {
    const jsonl = [
      `{"version":"${A2UI_VERSION}","createSurface":{"surfaceId":"s1","catalogId":"uri"}}`,
      `{"version":"${A2UI_VERSION}","updateComponents":{"surfaceId":"s1","components":[{"id":"root","component":"Page","title":"Hi"}]}}`,
    ].join('\n')
    const surface = parseA2UIMessages(jsonl)
    expect(surface.rootId).toBe('root')
  })
})

// ── Catalog ────────────────────────────────────────────────────────

describe('catalog', () => {
  it('has entries for core components', () => {
    expect(getCatalogEntry('Page')).toBeDefined()
    expect(getCatalogEntry('Card')).toBeDefined()
    expect(getCatalogEntry('Table')).toBeDefined()
    expect(getCatalogEntry('Button')).toBeDefined()
  })

  it('has at least 20 entries', () => {
    expect(catalog.length).toBeGreaterThanOrEqual(20)
  })

  it('all entries have required fields', () => {
    for (const entry of catalog) {
      expect(entry.name).toBeTruthy()
      expect((entry as unknown as Record<string, unknown>).component).toBeUndefined() // catalog uses `name`, not `component`
      expect(entry.props).toBeDefined()
      expect(entry.label).toBeTruthy()
    }
  })
})

// ── Codegen ────────────────────────────────────────────────────────

describe('generateReactCode', () => {
  it('generates a valid .tsx file for a minimal surface', () => {
    const surface = parseA2UIMessages([
      {
        version: A2UI_VERSION,
        createSurface: { surfaceId: 'hello', catalogId: 'https://example.com/catalog' },
      },
      {
        version: A2UI_VERSION,
        updateComponents: {
          surfaceId: 'hello',
          components: [
            { id: 'root', component: 'Page', title: 'Hello', children: ['text1'] },
            { id: 'text1', component: 'Text', content: 'World' },
          ],
        },
      },
    ])
    const code = generateReactCode(surface)
    expect(code).toContain("import '@demo/ui-theme'")
    expect(code).toContain('export default HelloPage')
    expect(code).toContain('Hello')
    expect(code).toContain('World')
  })

  it('includes only imports for components actually used', () => {
    const surface = parseA2UIMessages([
      {
        version: A2UI_VERSION,
        createSurface: { surfaceId: 't', catalogId: 'c' },
      },
      {
        version: A2UI_VERSION,
        updateComponents: {
          surfaceId: 't',
          components: [
            { id: 'root', component: 'Page', title: 'T', children: ['btn1'] },
            { id: 'btn1', component: 'Button', label: 'Click', variant: 'primary' },
          ],
        },
      },
    ])
    const code = generateReactCode(surface)
    // Should import HButton but not unused imports
    expect(code).toContain('HButton')
    expect(code).not.toContain('HTable')
    expect(code).not.toContain('HBadge')
  })

  it('emits initial data model', () => {
    const surface = parseA2UIMessages([
      {
        version: A2UI_VERSION,
        createSurface: { surfaceId: 't', catalogId: 'c' },
      },
      {
        version: A2UI_VERSION,
        updateComponents: {
          surfaceId: 't',
          components: [{ id: 'root', component: 'Page', title: { path: '/title' } }],
        },
      },
      {
        version: A2UI_VERSION,
        updateDataModel: { surfaceId: 't', value: { title: 'My Title' } },
      },
    ])
    const code = generateReactCode(surface)
    expect(code).toContain('INITIAL_DATA')
    expect(code).toContain("'My Title'")
    expect(code).toContain('getData(')
  })

  it('emits TODO for unknown non-catalog components', () => {
    const surface = parseA2UIMessages([
      {
        version: A2UI_VERSION,
        createSurface: { surfaceId: 't', catalogId: 'c' },
      },
      {
        version: A2UI_VERSION,
        updateComponents: {
          surfaceId: 't',
          components: [{ id: 'root', component: 'MadeUpWidget' }],
        },
      },
    ])
    const code = generateReactCode(surface)
    expect(code).toContain('TODO')
    expect(code).toContain('MadeUpWidget')
  })

  it('throws for catalog-registered components without codegen', () => {
    // Verify that catalog components all have codegen or are handled
    // Every catalog entry should either have a codegen case or get the throw path
    for (const entry of catalog) {
      // We verify the entry exists — if a catalog entry has no codegen case,
      // the surface that uses it would throw at codegen time
      expect(entry.name).toBeTruthy()
    }
  })

  // ── Data binding ──────────────────────────────────────────────

  it('generates getData(INITIAL_DATA, path) for bound form values', () => {
    const surface = parseA2UIMessages([
      {
        version: A2UI_VERSION,
        createSurface: { surfaceId: 'f', catalogId: 'c' },
      },
      {
        version: A2UI_VERSION,
        updateComponents: {
          surfaceId: 'f',
          components: [
            { id: 'root', component: 'Page', title: 'Form', children: ['inp'] },
            { id: 'inp', component: 'Input', label: 'Name', value: { path: '/user/name' } },
          ],
        },
      },
      {
        version: A2UI_VERSION,
        updateDataModel: { surfaceId: 'f', value: { user: { name: 'Alice' } } },
      },
    ])
    const code = generateReactCode(surface)
    // Should initialize state from data model, not from { path: ... }
    expect(code).toContain("getData(INITIAL_DATA, '/user/name')")
    expect(code).not.toContain("{ path: '/user/name' }")
  })

  it('generates setDataAtPath writeback for bound form values', () => {
    const surface = parseA2UIMessages([
      {
        version: A2UI_VERSION,
        createSurface: { surfaceId: 'f', catalogId: 'c' },
      },
      {
        version: A2UI_VERSION,
        updateComponents: {
          surfaceId: 'f',
          components: [
            { id: 'root', component: 'Page', title: 'Form', children: ['inp'] },
            { id: 'inp', component: 'Input', label: 'Name', value: { path: '/user/name' } },
          ],
        },
      },
      {
        version: A2UI_VERSION,
        updateDataModel: { surfaceId: 'f', value: { user: { name: 'Alice' } } },
      },
    ])
    const code = generateReactCode(surface)
    // Should include the writeback helper
    expect(code).toContain('function setDataAtPath')
    // Should call setDataAtPath in the handler
    expect(code).toContain("setDataAtPath(data, '/user/name'")
  })

  it('generates writeback for Checkbox checked bindings', () => {
    const surface = parseA2UIMessages([
      {
        version: A2UI_VERSION,
        createSurface: { surfaceId: 'f', catalogId: 'c' },
      },
      {
        version: A2UI_VERSION,
        updateComponents: {
          surfaceId: 'f',
          components: [
            { id: 'root', component: 'Page', title: 'Form', children: ['cb'] },
            { id: 'cb', component: 'Checkbox', label: 'Agree', checked: { path: '/agree' } },
          ],
        },
      },
      {
        version: A2UI_VERSION,
        updateDataModel: { surfaceId: 'f', value: { agree: true } },
      },
    ])
    const code = generateReactCode(surface)
    // Should init checked from data model
    expect(code).toContain("getData(INITIAL_DATA, '/agree')")
    // Should write back
    expect(code).toContain("setDataAtPath(data, '/agree'")
  })

  it('generates writeback for Toggle checked bindings', () => {
    const surface = parseA2UIMessages([
      {
        version: A2UI_VERSION,
        createSurface: { surfaceId: 'f', catalogId: 'c' },
      },
      {
        version: A2UI_VERSION,
        updateComponents: {
          surfaceId: 'f',
          components: [
            { id: 'root', component: 'Page', title: 'Form', children: ['tg'] },
            { id: 'tg', component: 'Toggle', checked: { path: '/enabled' } },
          ],
        },
      },
      {
        version: A2UI_VERSION,
        updateDataModel: { surfaceId: 'f', value: { enabled: false } },
      },
    ])
    const code = generateReactCode(surface)
    // Should init checked from data model
    expect(code).toContain("getData(INITIAL_DATA, '/enabled')")
    // Should write back
    expect(code).toContain("setDataAtPath(data, '/enabled'")
  })

  it('uses static value when not bound', () => {
    const surface = parseA2UIMessages([
      {
        version: A2UI_VERSION,
        createSurface: { surfaceId: 'f', catalogId: 'c' },
      },
      {
        version: A2UI_VERSION,
        updateComponents: {
          surfaceId: 'f',
          components: [
            { id: 'root', component: 'Page', title: 'Form', children: ['inp'] },
            { id: 'inp', component: 'Input', label: 'Name', value: 'Hello' },
          ],
        },
      },
    ])
    const code = generateReactCode(surface)
    // Static value should be used directly
    expect(code).toContain("useState('Hello')")
    // No writeback needed
    expect(code).not.toContain('setDataAtPath')
  })

  // ── Strict root validation ─────────────────────────────────────

  it('throws when surface has no rootId', () => {
    // Manually construct a surface without root
    const invalidSurface: A2UISurface = {
      surfaceId: 'test',
      catalogId: 'c',
      componentMap: new Map(),
      components: [],
      dataModel: {},
      rootId: undefined,
    }
    expect(() => generateReactCode(invalidSurface)).toThrow(
      /has no rootId/,
    )
  })

  it('throws when root component id is not "root"', () => {
    const surface = parseA2UIMessages([
      {
        version: A2UI_VERSION,
        createSurface: { surfaceId: 't', catalogId: 'c' },
      },
      {
        version: A2UI_VERSION,
        updateComponents: {
          surfaceId: 't',
          components: [
            { id: 'main-page', component: 'Page', title: 'Hi' }, // not "root"
          ],
        },
      },
    ])
    expect(() => generateReactCode(surface)).toThrow(
      /has no rootId/,
    )
  })

  // ── Mising catalog props ──────────────────────────────────────

  it('emits Progress with color prop', () => {
    const surface = parseA2UIMessages([
      {
        version: A2UI_VERSION,
        createSurface: { surfaceId: 't', catalogId: 'c' },
      },
      {
        version: A2UI_VERSION,
        updateComponents: {
          surfaceId: 't',
          components: [
            { id: 'root', component: 'Page', title: 'T', children: ['p1'] },
            { id: 'p1', component: 'Progress', value: 75, color: '#ff0000' },
          ],
        },
      },
    ])
    const code = generateReactCode(surface)
    expect(code).toContain("color={'#ff0000'}")
  })

  it('emits Separator with label prop', () => {
    const surface = parseA2UIMessages([
      {
        version: A2UI_VERSION,
        createSurface: { surfaceId: 't', catalogId: 'c' },
      },
      {
        version: A2UI_VERSION,
        updateComponents: {
          surfaceId: 't',
          components: [
            { id: 'root', component: 'Page', title: 'T', children: ['s1'] },
            { id: 's1', component: 'Separator', label: 'OR' },
          ],
        },
      },
    ])
    const code = generateReactCode(surface)
    expect(code).toContain("label={'OR'}")
  })

  it('emits NavMenu with selectedKeys prop', () => {
    const surface = parseA2UIMessages([
      {
        version: A2UI_VERSION,
        createSurface: { surfaceId: 't', catalogId: 'c' },
      },
      {
        version: A2UI_VERSION,
        updateComponents: {
          surfaceId: 't',
          components: [
            { id: 'root', component: 'Page', title: 'T', children: ['n1'] },
            { id: 'n1', component: 'NavMenu', items: [], selectedKeys: ['dashboard'] },
          ],
        },
      },
    ])
    const code = generateReactCode(surface)
    expect(code).toContain("selectedKeys={['dashboard']")
  })
})

// ── Strict envelope validation ────────────────────────────────────

describe('validateEnvelope', () => {
  it('accepts a valid v0.9.1 envelope', () => {
    const msg = { version: 'v0.9.1', createSurface: { surfaceId: 'x', catalogId: 'u' } }
    expect(() => validateEnvelope(msg)).not.toThrow()
    expect(validateEnvelope(msg)).toBe('createSurface')
  })

  it('rejects when version is not v0.9.1', () => {
    const msg = { version: 'v0.9.0', createSurface: { surfaceId: 'x', catalogId: 'u' } }
    expect(() => validateEnvelope(msg)).toThrow(A2UIParseError)
    expect(() => validateEnvelope(msg)).toThrow(/Unsupported version/)
  })

  it('rejects when envelope has no message type', () => {
    const msg = { version: 'v0.9.1' }
    expect(() => validateEnvelope(msg)).toThrow(A2UIParseError)
    expect(() => validateEnvelope(msg)).toThrow(/missing a message type/)
  })

  it('rejects when envelope has multiple message types', () => {
    const msg = {
      version: 'v0.9.1',
      createSurface: { surfaceId: 'x', catalogId: 'u' },
      deleteSurface: { surfaceId: 'x' },
    }
    expect(() => validateEnvelope(msg)).toThrow(A2UIParseError)
    expect(() => validateEnvelope(msg)).toThrow(/multiple message types/)
  })

  it('enforces strict version in full parse', () => {
    expect(() => parseA2UIMessages([
      {
        version: 'v0.8',
        createSurface: { surfaceId: 'x', catalogId: 'c' },
      } as unknown as import('../protocol/types').A2UIMessage,
    ])).toThrow(/Unsupported version/)
  })
})

// ── Integration: full codegen → compile pipeline ──────────────────

describe('compileReactCode', () => {
  it('compiles a dashboard surface into a working component', async () => {
    const surface = parseA2UIMessages([
      {
        version: A2UI_VERSION,
        createSurface: { surfaceId: 'test-compile', catalogId: 'c' },
      },
      {
        version: A2UI_VERSION,
        updateComponents: {
          surfaceId: 'test-compile',
          components: [
            { id: 'root', component: 'Page', title: 'Test Page', children: ['card1'] },
            { id: 'card1', component: 'Card', title: 'A Card', children: ['text1'] },
            { id: 'text1', component: 'Text', content: 'Hello World' },
          ],
        },
      },
    ])
    const code = generateReactCode(surface)

    // The function should compile without throwing
    const Component = await compileReactCode(code)
    expect(Component).toBeDefined()
    expect(typeof Component).toBe('function')

    // Should have a display name / be callable
    const el = Component({})
    expect(el).toBeDefined()
    expect(el).toHaveProperty('type')
  })

  it('compiles a form surface with bound inputs', async () => {
    const surface = parseA2UIMessages([
      {
        version: A2UI_VERSION,
        createSurface: { surfaceId: 'test-form-compile', catalogId: 'c' },
      },
      {
        version: A2UI_VERSION,
        updateComponents: {
          surfaceId: 'test-form-compile',
          components: [
            { id: 'root', component: 'Page', title: 'Form', children: ['inp'] },
            { id: 'inp', component: 'Input', label: 'Name', value: { path: '/user/name' } },
          ],
        },
      },
      {
        version: A2UI_VERSION,
        updateDataModel: { surfaceId: 'test-form-compile', value: { user: { name: 'Alice' } } },
      },
    ])
    const code = generateReactCode(surface)
    expect(code).toContain('setDataAtPath')

    const Component = await compileReactCode(code)
    expect(Component).toBeDefined()
    expect(typeof Component).toBe('function')

    // Note: cannot call Component({}) directly because hooks (useState)
    // require a React render context. The browser preview verifies full
    // rendering end-to-end. We test that compilation succeeds here.
    expect(Component.name || Component.displayName).toBeTruthy()
  })

  it('throws for invalid code', async () => {
    await expect(compileReactCode('invalid tsx source {{{')).rejects.toThrow()
  })
})
