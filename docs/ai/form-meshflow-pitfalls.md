# MeshFlow Form 集成避坑指南

Vue 版工程报价单开发过程中踩过的所有坑，React 版不要再踩一次。

---

## 目录

1. [Ark UI 受控模式死锁](#1-ark-ui-受控模式死锁)
2. [字符串拼接 Bug](#2-字符串拼接-bug)
3. [select 数值 option 匹配失败](#3-select-数值-option-匹配失败)
4. [Entangle isProxy 问题](#4-entangle-isproxy-问题)
5. [propose.set 传参错误](#5-proposeset-传参错误)
6. [engine.define() 找不到 group node](#6-enginedefine-找不到-group-node)
7. [自定义 schema 属性 (x-step / x-max) 不生效](#7-自定义-schema-属性-x-step--x-max-不生效)
8. [entangle 与 DAG 规则冲突](#8-entangle-与-dag-规则冲突)
9. [完整检查清单](#9-完整检查清单)

---

## 1. Ark UI 受控模式死锁

### 现象

NumberInput 的 +/- 按钮点击完全不响应，input 框的值也不变。但直接键盘输入可以。

### 根因

Ark UI（以及 Zag.js）在 controlled mode 下，`:model-value` 绑定到 **Vue computed**：

```ts
// ❌ 错误写法 —— computed 绑定
const fieldValue = computed(() => String(props.node?.value ?? ''))
// 模板: <NumberInput.Root :model-value="fieldValue" @value-change="..." />
```

链路：

```
用户点 + → Ark 调用 value-change → 我们调 dependOn() → meshflow 更新 node.value
→ dirtySignal bump → computed 重新计算 → Vue 重新渲染 → Ark 收到新 prop
```

理论上同步完成。但 **Ark/Zag 内部** 在触发 `value-change` 时，如果发现当前显示的 value 和 prop 不同，会先 reject 掉内部状态 —— 它期待 prop 先更新然后自己再同步。形成死锁：

```
Ark 等待 prop 更新 → prop 等待 computed 重新计算 → computed 等待 dirtySignal → 
dirtySignal 等待 dependOn() 执行 → dependOn() 等待 Ark 的 value-change → 
value-change 被 Ark 内部 reject → 死锁
```

### 修复

绑定到 **普通 ref**，在事件回调里先更新 ref（Ark 立即看到），再通知 meshflow：

```ts
// ✅ 正确写法 —— 普通 ref + watch dirtySignal
const inputValue = ref(String(props.node?.value ?? ''))

// meshflow 外部变更（DAG rule、entangle、初始化）→ 同步回 ref
watch(
  () => props.node?.dirtySignal?.value,
  () => {
    inputValue.value = String(props.node?.value ?? '')
  },
)

// 用户交互 → 先更新 ref，再通知 meshflow
function onFieldChange(val: string) {
  inputValue.value = val           // ← 先更新本地 ref
  props.node?.dependOn?.(() => Number(val), 'value')  // ← 再通知引擎
}
```

### React 版本

React 如果用 `useMemo` 从外部 state 派生 value 传给受控组件，**同样会死锁**。解决方案 —— 用本地 state 桥接：

```tsx
const [inputValue, setInputValue] = useState(String(node.value))

// 引擎变更时同步
useEffect(() => {
  setInputValue(String(node.value))
}, [node.dirtySignal])

// 用户交互时先更新本地 state
const onChange = (val: string) => {
  setInputValue(val)
  node.dependOn(() => Number(val), 'value')
}
```

**这是遇到最多的 bug，但本质不是 Vue/React 的问题，是所有受控 UI 库 + 外部状态管理器的通用问题。**

---

## 2. 字符串拼接 Bug

### 现象

人天合计：`pm1=5, dev1=5, qa1=3` 算出 `"61558301051015"` 而不是 `13`。

### 根因

Ark NumberInput 的 `@value-change` 回调给的 value **永远是字符串**：

```
用户输入 "6" → Ark 回调 { value: "6" } → dependOn(() => "6", 'value') → 
meshflow node.value = "6" → DAG rule: pm1 + dev1 + qa1 → "6" + "5" + "3" = "653"
```

JavaScript `+` 遇字符串变拼接。meshflow 引擎不做类型转换 —— 你存什么它就是什么。

### 修复

存储前做 `Number()` 转换：

```ts
// ✅ handler 里区分类型
function onFieldChange(val: string | boolean) {
  const n = props.node
  const finalVal = n?.type === 'number' ? Number(val) : val
  props.node?.dependOn?.(() => finalVal, 'value')
}
```

### React 版本

**框架无关。** Ark UI React 版回调一样给 string。所有 number 字段 handler 必须 `Number(val)`。

---

## 3. select 数值 option 匹配失败

### 现象

下拉框默认值显示 "Select…" 而不是正确的选项文本。

### 根因

Ark Select 对 option value 做 **严格比较**（`===`）。schema `default: 0.8`（number），但 `inputValue` 被统一 String() 成了 `"0.8"`（string）。Ark 用 `"0.8" === 0.8` 匹配失败。

### 修复

select 类型保留原始值类型：

```ts
const inputValue = ref(
  props.node?.type === 'select'
    ? (props.node?.value ?? '')     // ← 保留原始类型
    : String(props.node?.value ?? ''),
)
```

### React 版本

select 的 value prop 如果是 string 而 schema default 是 number，同样无法匹配。**value 类型必须与 option value 的 JS 类型一致。**

---

## 4. Entangle isProxy 问题

### 现象

entangle 注册了但双向联动完全不触发。

### 根因

`engine.config.useEntangle()` 默认 `isProxy: false`，emit 收到完整 `MeshFlowTaskNode` 对象。`useMeshFormJson` 用 `signalCreator: () => ref(0)` 创建引擎，node 被包了一层 Vue ref proxy。直接读写 `node.nodeBucket.value` 绕过了 Vue 响应式链路。

需要设置 `isProxy: true`，emit 收到简化版 `{ value }` proxy：

```ts
// ✅ 正确
engine.config.useEntangle({
  cause: paths[i],
  impact: paths[j],
  via: viaKeys,
  isProxy: true,  // ← 必须
  emit: (causeNode, impactNode, propose) => {
    // causeNode = { value: ... } ← 简单 proxy
    // propose.set('value', newVal)
  },
})
```

### React 版本

如果用 `signalCreator` 自定义了 signal（React 里通常用 `useState` 的 setter 或 forceUpdate），同样需要 `isProxy: true`。不改这一点 entangle 完全不会触发。

---

## 5. propose.set 传参错误

### 现象

entangle emit 里 `propose.set(path, val)` 不生效。

### 根因

`propose.set(key, val)` 的 **第一个参数是属性名（如 `'value'`），不是 node path**。

`useEntangle` 的 `impact` 字段已经指定了目标 node，propose 只需要知道写哪个属性：

```ts
// ❌ 错误
propose.set('pricing.marginRate', 21)

// ✅ 正确
propose.set('value', 21)
```

---

## 6. engine.define() 找不到 group node

### 现象

`engine.define({ 'wbs.phase1Days': from(...) })` 报错 "node not found"。

### 根因

meshflow 内部的 `engine.define()` 会把 `'wbs.phase1Days'` 拆成 group path `'wbs'` + child key `'phase1Days'`，然后调 `GetNodeByPath('wbs')` 找 group node。**`GetNodeByPath` 只返回 leaf nodes，不返回 group nodes。**

### 修复

绕过 `engine.define()`，直接调 `engine.config.SetRule()`，传完整 leaf path：

```ts
// ✅ 直接调 SetRule
const nodePath = 'wbs.phase1Days'  // 完整 leaf path
engine.config.SetRule(
  ['wbs.pm1', 'wbs.dev1', 'wbs.qa1'],  // sources
  nodePath,                               // target (完整 leaf path)
  'value',                                // property key
  { logic: (h) => { ... }, triggerKeys: ['value'] },
)
```

### React 版本

**框架无关**，这是 meshflow 引擎内部行为。React 版必须绕过 `engine.define()`。

---

## 7. 自定义 schema 属性 (x-step / x-max) 不生效

### 现象

`'x-step': 0.5` 写了，NumberInput 的 step 仍是默认值 1。

### 根因

meshflow `internal-form` 只映射 JSON Schema 标准子集：

| JSON Schema | meshflow node | x-* 属性 | 自动映射 |
|------------|---------------|---------|---------|
| `minimum` | `node.min` | `x-step` | ❌ 不映射 |
| `maxLength` | `node.maxLength` | `x-max` | ❌ 不映射 |
| `default` | `node.value` | | |

而且 meshflow node 是 **冻结的 proxy**，不能 `node.step = 0.5` —— 报 `'set' on proxy: trap returned falsish`。

### 修复

用独立 **Context / inject side-map**：

```ts
// HForm.vue —— 收集扩展属性
const schemaExtras: Record<string, { step?: number; max?: number }> = {}
;(function collect(schema: any, prefix = '') {
  for (const [key, field] of Object.entries(schema.properties ?? {})) {
    const path = prefix ? `${prefix}.${key}` : key
    if (field.type === 'object' && field.properties) {
      collect(field, path)
    } else {
      if (field['x-step'] != null || field['x-max'] != null) {
        schemaExtras[path] = { step: field['x-step'], max: field['x-max'] }
      }
    }
  }
})(props.schema)
provide(SCHEMA_EXTRAS_KEY, schemaExtras)

// FormField.vue —— 读取
const extras = inject(SCHEMA_EXTRAS_KEY, {})
const fieldStep = computed(() => extras[props.node?.path]?.step)
const fieldMax  = computed(() => extras[props.node?.path]?.max)
```

### React 版本

React Context 同样模式。**规则：不要把自定义属性写到 node proxy 上，它不接受。**

---

## 8. entangle 与 DAG 规则冲突

### 现象

entangle `marginRate ↔ quotePrice` 双向联动，但改 quotePrice 时 marginRate 跳一下又弹回去了。

### 根因

同时存在 DAG 规则 `quotePrice = suggestedQuote`。两个来源都在写 `quotePrice.value`，后执行的覆盖先执行的，导致 entangle 结果被 DAG 规则覆盖。

### 修复

entangle 的成员字段 **不要同时被 DAG 规则覆盖**：

```ts
// ❌ 删除 —— entangle 已经处理了 quotePrice
'pricing.quotePrice': from('pricing.suggestedQuote', sq => sq),

// ✅ 保留 —— 只读 computed 展示字段
'pricing.suggestedQuote': from(
  ['costs.totalCost', 'pricing.marginRate'],
  (tc, mr) => Math.round(tc * (1 + mr / 100)),
),
```

原则：**entangle 成员 = 用户可编辑 | DAG rule target = 只读 computed**

---

## 9. 完整检查清单

React 封装 meshflow form 的自查表：

### 渲染层
- [ ] 受控组件绑定**本地 state**，不是 `useMemo` 派生值
- [ ] `useEffect` 监听 `dirtySignal` 变更，同步引擎值 → 本地 state
- [ ] 用户交互 handler 先更新本地 state，再调 `dependOn()`
- [ ] number 类型字段在 `dependOn` 前做 `Number(val)` 转换
- [ ] select 的 value 保持原始 JS 类型（number 不转 string）
- [ ] `x-step`/`x-max` 等自定义属性用 Context/side-map 传递，不往 node proxy 上写

### 引擎层
- [ ] define() 绕过 `engine.define()`，直接调 `engine.config.SetRule(leafPath, ...)`
- [ ] entangle 设置 `isProxy: true`
- [ ] entangle emit 里 `propose.set('value', val)` — 第一个参数是 `'value'` 不是 path
- [ ] entangle 目标字段不被 DAG 规则覆盖（或确保执行顺序正确）

### 数据结构
- [ ] schema defaults 类型与字段类型一致（number default 不要写成 string）
- [ ] select options 的 value 类型与字段 default 一致
- [ ] 初始化数据 `props.data` 的值类型与 schema default 类型一致

### 运行时验证
- [ ] 点击 +/- 按钮能正常增减
- [ ] 数字字段的值不会变成字符串拼接
- [ ] 下拉框初始显示正确的选项文本
- [ ] 修改 select 触发下游 DAG 规则
- [ ] entangle 正向+反向都能触发
- [ ] readonly/disabled/hidden 规则正确生效
- [ ] 警告/提示文本按条件显示/隐藏
