# Tooltip

Core: `packages/core/src/tooltip-contract.ts`

| Prop | Type | Default |
| --- | --- | --- |
| `content` | framework content / `string` | required |
| `open` | `boolean` | - |
| `defaultOpen` / `default-open` | `boolean` | `false` |
| `disabled` | `boolean` | `false` |
| `positioning` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'top'` |

Open change events use `{ open: boolean }`.

React uses `onOpenChange(details)`, Vue uses `@open-change`, and Web Component supports both the `onOpenChange` property callback and the `open-change` CustomEvent.

### Anatomy (all stacks)

```text
Trigger → Positioner → Content
```

### Web Component

```html
<h-tooltip content="Hint text" positioning="top">
  <button type="button" class="ui-button">Hover me</button>
</h-tooltip>
```

Children become the trigger body. Component ensures `trigger` / `positioner` / `content` parts and applies Zag props (including floating positioner styles). Closed content uses `hidden`.
