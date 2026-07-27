# Empty

Core: `packages/core/src/empty-contract.ts`

| Prop | Type | Default |
| --- | --- | --- |
| `title` | framework content / `string` | `'No data'` |
| `description` | framework content / `string` | - |

Action area:

| Stack | How |
| --- | --- |
| React | `children` |
| Vue | default slot |
| Web Component | light-DOM children (moved into `.ui-empty__action`) |

### Web Component note

There is **no Shadow DOM**, so HTML `<slot>` is not used. Action content is **light-DOM children** left in place (not reparented, so framework `onClick` keeps working):

```html
<h-empty title="No devices" description="Connect a sensor…">
  <button type="button" class="ui-button ui-button--sm">Add device</button>
</h-empty>
```

`Empty` only hosts the action area — the button must define its own click behavior.
