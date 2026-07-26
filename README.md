# UI Library：Core + Adapters + Renderers

这是“AI 生成组件方案”的最小原型：一份无框架 Core，分别接入 React、Vue 和 Web Component。

```text
Core：状态、事件、行为语义
        ↓
React / Vue / Web Component Adapter
        ↓
JSX / Vue Template / DOM Renderer
```

交互逻辑不在 `packages/core` 中重复实现：React/Vue 直接使用 Ark UI，Web Component 使用同源的 Zag machine；我们的代码只维护统一 Manifest、门面 API 和各 Renderer。

```text
Ark UI / Zag.js
        ↓
React Renderer / Vue Renderer / Web Component Renderer
        ↓
我们的 UiToggle / UiSelect / UiDialog
```

## Ark UI 组件目录

`packages/core/src/ark-catalog.ts` 已登记 Ark UI 当前官方组件目录。业务和 AI 只依赖我们的 Manifest；React/Vue Renderer 可以逐步映射到 Ark UI，Web Component Renderer 标记为后续计划。

## 启动 Playground

React 宿主页面：

```bash
npm run dev
```

Vue 宿主页面（三种实现一起展示）：

```bash
npm run dev:vue
```

默认地址是 `http://localhost:5173`。Vue Playground 会由 Vue 创建页面，同时把 React 组件挂载到容器，并直接使用 Web Component。

## 下一步

增加 Component Manifest、Design Tokens、Dialog/Select/Table Core，以及从 UI Schema 到三端代码的生成器。
