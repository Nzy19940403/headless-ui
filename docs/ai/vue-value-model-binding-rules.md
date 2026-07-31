# Vue value / defaultValue 不渲染 — 根因与适配规则

> 配套：`vue-wrapper-prop-forwarding-rules.txt`（optional boolean / controlled open）  
> 现象：`defaultValue` / `value` 传了，Vue 侧首屏输入框是空的；React / WC 正常。

## 为什么「Vue 初始值不渲染」很常见

这不是 Vue 本身坏了，而是 **三层命名/语义不一致**叠在一起，写 wrapper 时很容易按 React 直觉写错。

### 1. Core 合同是 React 风格命名

跨栈合同（`@demo/ui-core`）统一用：

| 语义 | Core 名 | 事件 |
|------|---------|------|
| 受控当前值 | `value` | `onValueChange` / `value-change` / `update:value` |
| 非受控初值 | `defaultValue` | — |

React 侧可以几乎原样转发到 Ark React / 原生 DOM（`value` / `defaultValue`）。

### 2. Vue 3 组件的「受控值」惯例是 `modelValue`

Vue 官方组件 v-model 约定：

- prop：`modelValue`
- event：`update:modelValue`
- 模板：`v-model` / `:model-value`

**不是**把 DOM 的 `value` 当成组件 API 的一等公民。

因此 Ark UI 的 **Vue 适配层**会把「组件状态值」收成 `modelValue`（+ 部分组件仍保留 `defaultValue`），而不是镜像 React 的 prop 名。

### 3. Ark 同一组件，React vs Vue 的 prop 表面不同

以 `Field.Input` 为例（`@ark-ui/vue` 实现要点）：

```text
// Ark Vue Field.Input 实际声明
props: { modelValue, asChild }
emits: ['update:modelValue']
// 内部：native input 的 value ← modelValue
// types: Omit<InputHTMLAttributes, 'value'> & { modelValue?: ... }
```

含义：

| 你在 wrapper 里写的 | Ark Vue Field.Input 是否当真 |
|---------------------|------------------------------|
| `:model-value="…"` / `v-model` | ✅ 会写到 native `value`，能渲染 |
| `:value="…"` | ❌ 被类型 omit；运行时通常**不会**当受控值 |
| `:default-value="…"` | ❌ Field.Input **没有** defaultValue API |

所以「传了 `defaultValue="TKT-1001"`，页面空白」——常见根因就是 **Core 的 defaultValue 没有映射到 Ark Vue 认的 `modelValue`**。

React 对照：`HInput` 把 `value` / `defaultValue` 直接 spread 到 `Field.Input`，原生语义成立，故不易踩坑。

### 4. 和「optional boolean 变成 false」是同一类问题

| 坑 | 文档 | 症状 |
|----|------|------|
| 未传的 `open` / `disabled` 被 Vue 变成 `false` 再转发 | `vue-wrapper-prop-forwarding-rules.txt` | 弹层永远不开、看起来像受控锁死 |
| 用 React 名 `:value` / `:default-value` 绑 Ark Vue 值 | **本文** | 初值不渲染、受控改不动 |
| Zag machine 的 controlled 判定（有 onChange 无 value） | Zag / TanStack 各自指南 | state 被「冻」在初始值 |

共同点：**框架边界上 prop 名 / 缺省语义不一致，透传即 bug**。

---

## 适配规则（写 H* Vue wrapper 时）

### R1 — 先查 Ark Vue 的真实 prop 名

打开 `@ark-ui/vue` 对应 Root / Input 的 `*.vue.d.ts` 或 dist props，确认是：

- `modelValue` + `defaultValue`（多数 machine 组件：Radio、NumberInput、Select…）
- **仅** `modelValue`（如 `Field.Input`：无 defaultValue）
- 仍叫 `value` / `defaultValue`（少数；以类型为准，勿猜）

不要默认「和 React 同名就能透传」。

### R2 — Core `value` / `defaultValue` 必须在 wrapper 内映射

对外 **永远**暴露 Core 名（`value`、`defaultValue`、`update:value`），对内映射：

```vue
<!-- 模式 A：Ark 支持 modelValue + defaultValue（如 RadioGroup.Root） -->
<RadioGroup.Root
  :model-value="value"
  :default-value="defaultValue"
  @value-change="…"
  @update:model-value="…"
/>
```

```vue
<!-- 模式 B：Ark 只有 modelValue（如 Field.Input） -->
<script setup>
const isControlled = computed(() => props.value !== undefined)
</script>
<template>
  <Field.Input
    v-if="isControlled"
    :model-value="value"
    @update:model-value="onModelUpdate"
  />
  <!-- 非受控：用 defaultValue 作为 modelValue 的初始绑定；
       不要写 :value / :default-value 到 Field.Input -->
  <Field.Input
    v-else
    :model-value="defaultValue ?? ''"
    @update:model-value="onModelUpdate"
  />
</template>
```

### R3 — 区分 controlled / uncontrolled，且只在「调用方传了 value」时受控

- `value !== undefined` → controlled：持续 `:model-value="value"`（或 Ark 的等价 prop）。
- 仅 `defaultValue` → uncontrolled：只提供初值，**不要**把 `value` 绑成 `undefined` 的受控空串（除非产品明确要求空串也是合法受控值）。
- 与 `vue-wrapper-prop-forwarding-rules.txt` 一致：缺省 ≠ 故意传 `false` / `''`。

### R4 — 事件双发保持跨栈合同

```ts
emit('update:value', next)           // Vue v-model:value
emit('value-change', { value: next }) // 与 React onValueChange / WC 对齐
```

不要只发 Ark 的 `update:modelValue` 就结束；外层消费方认的是 Core 名。

### R5 — 验收清单（改完必测）

1. **Uncontrolled**：只传 `defaultValue="hello"` → 首屏 input 显示 `hello`。
2. **Controlled**：`value` + `update:value` → 输入后父 state 变、画面跟着变。
3. **与 React / WC 同 demo 对照**：playground 三栏同一用例，初值一致。
4. 若组件是 machine（Select/DatePicker/Radio），再测 `defaultValue` 与 `modelValue` 同时存在时以 controlled 为准。

---

## 本仓库对照实现

| 组件 | 状态 | 说明 |
|------|------|------|
| `HInput.vue` | ✅ | `value`/`defaultValue` → `Field.Input` 的 `modelValue`；controlled 分支 |
| `HNumberInput.vue` | ✅ | Core `value` → `:model-value`；`defaultValue` 仍直传 |
| `HSelect.vue` | ✅ | Core 单值 string → Ark `modelValue` / `defaultValue` 数组 |
| `HCombobox.vue` | ✅ | 同上（list collection 单选） |
| `HSegmentGroup.vue` | ✅ | Core `value` → `:model-value` |
| `HTabs.vue` | ✅ | Core `value` → `:model-value` |
| `HSlider.vue` | ✅ | Core number → Ark `modelValue` number[] |
| `HAccordion.vue` | ✅ | Core `value` → `:model-value` |
| `HRadioGroup.vue` | ✅ | Core `value` → `:model-value`（见 `docs/api/radio-group` Vue note） |
| `HDatePicker.vue` | ✅ | `setIfDefined(…, 'modelValue', …)` + `defaultValue` |
| `HTextarea.vue` | ⚠️ 易复发 | 仍 `:value` / `:default-value` 绑 `Field.Textarea`，需按 R1 核对 Ark Vue API |
| `HPasswordInput.vue` | ⚠️ 易复发 | `PasswordInput.Input` 上仍 `:value` / `:default-value` |
| 其它 machine Root | 以 Ark 类型为准 | 声明 `modelValue` 则禁止透传 Core 名 `value` |

新增表单控件时：**先写 Vue uncontrolled defaultValue 单测/demo，再合并**。

---

## 给调用方的说明（不必改写法）

业务侧继续写 Core 合同即可：

```vue
<!-- 非受控初值 -->
<HInput label="Ticket" default-value="TKT-1001" />

<!-- 受控 -->
<HInput v-model:value="name" label="Name" />
```

**不要**在业务里直接绑 Ark 的 `modelValue`；映射只应出现在 `packages/vue` 的 H* 包装层。

---

## 一句话

> React 透传 `value`/`defaultValue` 往往能工作；**Vue 上必须先问 Ark：「这个 prop 叫 modelValue 还是 value？」** 再在 H* 里做 Core→Ark 映射。初值空白，优先查这条，而不是查 CSS 或 playground。
