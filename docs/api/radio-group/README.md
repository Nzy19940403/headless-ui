# Radio Group

Core: `packages/core/src/radio-group-contract.ts`

| Prop | Type | Default |
| --- | --- | --- |
| `items` | `{ value: string; label: string; disabled?: boolean }[]` | required |
| `value` | `string` | - |
| `defaultValue` / `default-value` | `string` | - |
| `disabled` | `boolean` | `false` |
| `name` | `string` | - |
| `label` | `string` | - |

### 显示当前选中值（统一用法）

页面自己持有 `value`（受控），变更走同一 payload：`{ value: string }`。

| Stack | 绑定当前值 | 监听变更 | 展示 |
| --- | --- | --- | --- |
| React | `value={v}` | `onValueChange={d => setV(d.value)}` | `{v}` |
| Vue | `v-model:value` / `:value` + `@update:value` | 同上 | `{{ v }}` |
| Web Component | `value="…"` 属性 | **`el.onValueChange = d => …`**（对齐 React）或 `value-change` 事件 | 宿主 state |

WC 的 `onValueChange` **仅因 React `HRadioGroup` 有该 prop 才提供**；payload 同为 `{ value: string }`。

```tsx
// React
const [v, setV] = useState('day')
<>
  <HRadioGroup items={items} value={v} onValueChange={d => setV(d.value)} />
  <span>Selected: {v}</span>
</>
```

```vue
const v = ref('day')
<HRadioGroup :items="items" v-model:value="v" />
<span>Selected: {{ v }}</span>
```

```js
// WC
el.setAttribute('value', v)
el.addEventListener('value-change', (e) => { v = e.detail.value })
```

不要从 `input:checked` 或 DOM 反推选中值；以受控 `value` / 事件为准。

Value change events use `{ value: string }` on all stacks:

| Stack | Event |
| --- | --- |
| React | `onValueChange({ value })` |
| Vue | `value-change` / `update:value` |
| Web Component | `value-change` CustomEvent `detail: { value }` |

### Vue note

Ark Vue controlled state uses **`modelValue`**. Our `HRadioGroup` maps Core prop `value` → `:model-value` so you still write `value` / `update:value`.

### Web Component

Prefer the **same high-level API** as React/Vue. Because hosts may assign attributes after `connectedCallback`, machine start is deferred one microtask.

```html
<h-radio-group
  label="Shift"
  default-value="day"
  items='[{"value":"day","label":"Day shift"},{"value":"night","label":"Night shift"}]'
></h-radio-group>
```

Or set the **property** (recommended from React):

```js
el.items = [{ value: 'day', label: 'Day shift' }, { value: 'night', label: 'Night shift' }]
el.setAttribute('default-value', 'day')
```

`items` accepts a JSON string **or** an array. Anatomy is rendered by the component.
