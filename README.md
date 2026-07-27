# Headless UI

这是一个面向 React、Vue 和 Web Component 的统一 UI 组件原型。

```text
packages/core
  └─ 统一组件契约、事件 payload 和组件目录
        ↓
React / Vue / Web Component Renderer
  ├─ React/Vue：Ark UI renderer
  └─ Web Component：Zag.js vanilla machine + light DOM
        ↓
packages/theme
  └─ 共享 Design Token 和状态样式
```

`packages/core/src/*-contract.ts` 按组件拆分，是三端公开 API 的规范来源（一组件一文件）。Renderer 可以采用不同的语法，但必须遵守对应契约里的属性、默认值和事件 details。

Web Component 没有使用 Lit。当前实现使用原生 `HTMLElement`、`customElements.define` 和 `@zag-js/vanilla`，业务页面提供 light DOM，Zag machine 负责注入行为、ARIA 和状态属性。

组件 API 文档位于 [docs/api](docs/api/README.md)，每个组件都有独立的 README。

库内公开组件统一 `H` 前缀：React/Vue 为 `HButton`，Web Component 标签为 `h-button`。Core 契约保持 `ButtonContract`（不加 H）。CSS 皮肤 class 仍为 `ui-*`。详见 [docs/api 命名约定](docs/api/README.md#命名约定h-前缀)。

### 主题

在 `html` 上设置 `data-theme`：

| 值 | 说明 |
| --- | --- |
| `default` | 默认产品皮肤 |
| `compact` | 紧凑紫色演示 |
| `industry` | 工业物联网浅色（日班），对齐 `wc-ui` DESIGN |
| `industry-dark` | 工业物联网深色（夜班） |

Theme 按文件拆分：`packages/theme/src/themes/*.css` 只写 token，`components.css` 写组件皮肤。说明见 [packages/theme/src/themes.md](packages/theme/src/themes.md)。

Web Component 以手写 `HTMLElement` + Zag light-DOM 增强为主；**复杂自渲染组件**（当前：`h-select`）使用 **Lit + Zag**，默认 light DOM 以复用主题。策略见 [packages/web-components/src/lit-policy.md](packages/web-components/src/lit-policy.md)。

## 开发

```bash
npm install
npm run dev
```

## 验证

```bash
npm run typecheck
npm run build
npx vite build playground
```
