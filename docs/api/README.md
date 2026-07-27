# Component API

这里的 API 以 `packages/core/src/*-contract.ts` 为规范来源（**一组件一文件**，不要再塞回单文件大杂烩）。
React、Vue 和 Web Component 的命名、默认值、状态属性和事件 payload 必须保持语义一致。

| 组件 | Core 契约文件 |
| --- | --- |
| Button | `packages/core/src/button-contract.ts` |
| Card | `packages/core/src/card-contract.ts` |
| Tag | `packages/core/src/tag-contract.ts` |
| Toggle | `packages/core/src/toggle-contract.ts` |
| Checkbox | `packages/core/src/checkbox-contract.ts` |
| Dialog | `packages/core/src/dialog-contract.ts` |
| Tabs | `packages/core/src/tabs-contract.ts` |
| Accordion | `packages/core/src/accordion-contract.ts` |
| Input | `packages/core/src/input-contract.ts` |
| Select | `packages/core/src/select-contract.ts` |
| RadioGroup | `packages/core/src/radio-group-contract.ts` |
| Badge | `packages/core/src/badge-contract.ts` |
| Avatar | `packages/core/src/avatar-contract.ts` |
| Tooltip | `packages/core/src/tooltip-contract.ts` |
| Progress | `packages/core/src/progress-contract.ts` |
| Skeleton | `packages/core/src/skeleton-contract.ts` |
| Empty | `packages/core/src/empty-contract.ts` |
| Separator | `packages/core/src/separator-contract.ts` |
| DatePicker | `packages/core/src/date-picker-contract.ts` |
| Table | `packages/core/src/table-contract.ts` |
| Container / Stack / VStack / Grid / Split / Spacer | `packages/core/src/layout-contract.ts` |
| 公共 | `packages/core/src/shared.ts`（如 `ComponentContent`） |

`packages/core/src/index.ts` 只做 re-export；改契约请改对应组件文件。

## 命名约定（H 前缀）

库内公开组件统一使用 **`H` 前缀**（Headless / 内部库标识）：

| 层 | 规则 | 示例 |
| --- | --- | --- |
| React / Vue 导出 | `H` + PascalCase | `HButton`, `HDialog` |
| 源文件名 | 与导出同名 | `HButton.tsx`, `HButton.vue` |
| Web Component 类名 | 同 React/Vue | `class HButton` |
| Custom element 标签 | `h-` + kebab-case | `h-button`, `h-dialog-trigger` |
| Props 类型 | `H` + 组件名 + `Props` | `HButtonProps` |
| Core 契约 | **不加 H** | `ButtonContract`, `ToggleContract` |
| CSS 皮肤 class | 保持 `ui-*` BEM | `.ui-button`, `.ui-card--muted` |

新增组件必须遵守上表。业务页（如 `playground/src/views`）可自定命名，但引用库组件时使用 `H*` / `h-*`。

三种技术栈的语法不同，但状态事件统一传递 details 对象：

```ts
{ checked: boolean }
{ open: boolean }
{ value: string }
{ value: string[] }
```

| 组件 | React | Vue | Web Component |
| --- | --- | --- | --- |
| Button | `HButton` | `HButton` | `h-button` |
| Card | `HCard` | `HCard` | `h-card` |
| Tag | `HTag` | `HTag` | `h-tag` |
| Toggle | `HToggle` | `HToggle` | `h-toggle` |
| Checkbox | `HCheckbox` | `HCheckbox` | `h-checkbox` |
| Dialog | `HDialog` | `HDialog` | `h-dialog` |
| Tabs | `HTabs` | `HTabs` | `h-tabs` |
| Accordion | `HAccordion` | `HAccordion` | `h-accordion` |
| Input | `HInput` | `HInput` | `h-input` |
| Select | `HSelect` | `HSelect` | `h-select` |
| RadioGroup | `HRadioGroup` | `HRadioGroup` | `h-radio-group` |
| Badge | `HBadge` | `HBadge` | `h-badge` |
| Avatar | `HAvatar` | `HAvatar` | `h-avatar` |
| Tooltip | `HTooltip` | `HTooltip` | `h-tooltip` |
| Progress | `HProgress` | `HProgress` | `h-progress` |
| Skeleton | `HSkeleton` | `HSkeleton` | `h-skeleton` |
| Empty | `HEmpty` | `HEmpty` | `h-empty` |
| Separator | `HSeparator` | `HSeparator` | `h-separator` |
| DatePicker | `HDatePicker` | `HDatePicker` | `h-date-picker` |
| Table | `HTable` | `HTable` | `h-table` |
| Container | `HContainer` | `HContainer` | `h-container` |
| Stack | `HStack` | `HStack` | `h-stack` |
| VStack | `HVStack` | `HVStack` | `h-v-stack` |
| Grid | `HGrid` | `HGrid` | `h-grid` |
| Split | `HSplit` | `HSplit` | `h-split` |
| Spacer | `HSpacer` | `HSpacer` | `h-spacer` |

Web Component 的交互组件不创建业务内容，页面通过 `data-part` 提供 light DOM anatomy，组件只注入 Zag.js 的行为、ARIA 和状态属性。
