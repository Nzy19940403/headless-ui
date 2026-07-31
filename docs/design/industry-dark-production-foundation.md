# Industry Dark 基础样式与生产运营页复刻规范

> 参考页面：`https://dmstrky.sanyevi.cn/#/productionOperations/basicInfo/deviceInfo`
>
> 用途：给组件库开发、页面复刻和其他 AI 做实现校验。所有尺寸以浏览器 computed style 为准；页面通过根字号缩放，不要用 JS 监听窗口大小。

## 1. 视觉基线

页面是深色矿山物联网后台，基础层级固定为：

| 层级 | 颜色 | 用途 |
| --- | --- | --- |
| canvas | `#030b21` | 主内容、表格 body、展开行外层 |
| header | `#0b1630` | 表头 |
| detail | `#103c71` | 展开行详情内容 |
| detail container | `rgba(5,25,56,.5)` | 展开详情的中间容器 |
| text | `#bcbdbE` | 表格文字、辅助文字 |
| primary | `#1890ff` | 输入框边框、按钮、链接、展开箭头 |
| hairline | `rgba(255,255,255,.1)` | 表头分隔线 |
| fixed shadow | `rgba(0,0,0,.12) 0 0 7px 0` | 右侧固定列阴影 |

页面原站在当前窄视口的根字号是 `0.7px`。因此复刻时应验证两个档位，而不是只验证 100%：

- 窄档：根字号约 `0.7px`，控件高度 `22.39px`，表头 `25.5px`，普通行 `42.6875px`。
- 宽档：以设计基准尺寸为 1，控件高度约 `32px`，表头 `36px`，普通行 `61px`。

## 2. 基础控件

### Input / Select

Input 和 Select trigger 必须使用 `box-sizing: border-box`，避免 border 参与计算后导致行高漂移。

窄档 computed 规格：

- 外框高度：`22.39px`；CSS line-height：`22.4px`。
- 边框：`1px solid #1890ff`。
- 背景：透明或 `#030b20`，不能使用浅色 surface token。
- 字号：`9.8px`；文字颜色：`rgb(176,188,194)`。
- 普通左右 padding：`0 10.5px`；带右侧 indicator 时：`0 28px 0 10.5px`。
- 圆角：约 `3px`。

组件基础 CSS 要显式设置 `line-height: 1`；复刻页在缩放档再显式设置高度和 line-height。不要只写 `min-height`，也不要依赖浏览器默认的 input line-height。

### Button

窄档 `mini` 按钮：高度 `22.39px`、边框 `1px solid #1890ff`、主背景 `#1890ff`、字号 `9.8px`、line-height `9.8px`、padding `4.9px 10.5px`。按钮文字不换行。

### Switch

窄档 Switch 的排列顺序是“标签在左、开关在右”，对应组件 DOM 可保持 control 后 label，再由 `industry-dark` 的 `row-reverse` 排列。外层 label + control 约 `97.4px × 22.4px`，label 字号 `9.8px`、line-height `22.4px`、右 padding `8.4px`；开关轨道 `40px × 14px`，边框和关闭态背景 `#ff4949`，圆角 `7px`，thumb `11.2px × 11.2px`、颜色 `#030b21`，左右状态位移约 `18px`。不要把 Switch 当作普通 Button 处理。

### Pagination

分页器由页面 layout 提供底部区域，不能用 `position: fixed` 或按 viewport 绝对定位。原站窄档分页容器高度约 `67.16px`，上下 padding `22.4px`、左右 padding `11.2px`，内容行高 `19.6px`，并靠右排列。

内容顺序固定为：`共 3 条` → `10条/页` Select → 上一页 → 当前页 → 下一页 → `前往` → 页码 Input → `页`。窄档 Select 宽 `77px`，前后按钮和当前页各 `21px × 19.6px`，按钮水平 margin `3.5px`；跳转 Input 外框宽 `35px`、高 `19.6px`，边框 `1px solid #1890ff`。上一页/下一页背景 `#11192d`，当前页背景 `#3399ff`，圆角约 `1.4px`。

## 3. HTable 规格

### 容器与高度

原站表格容器是 `display:block`，在当前视口 computed 高度约 `706.766px`；body wrapper 高度约 `681px`，并且 `overflow-x: auto`。这说明表格高度由页面 layout 提供，内容只负责产生横向滚动，不应由行数自适应高度。

组件库提供：

```tsx
<HVStack fillHeight>
  <Toolbar />
  <HTable fillHeight {...props} />
</HVStack>
```

`fillHeight` 的前提是父 layout 有确定高度。`HVStack fillHeight` 建立纵向 flex 高度链，`HTable fillHeight` 自身 `flex: 1 1 auto; min-height: 0`，内部 `.ui-table__scroll` 再占满剩余空间。不要在 HTable 内使用 resize observer 或 JS 计算 viewport 高度。

### 列与固定列

生产运营页列宽（包含展开列）必须保持如下顺序：

```text
48, 70, 80, 170, 140, 120, 160, 220, 160, 120,
120, 120, 130, 130, 130, 130, 130, 100, 80, 80
```

总宽度 `2438px`。只有最后三列固定在右侧：`停用/恢复 100px`、`修改 80px`、`日志 80px`。展开列和前面的业务列都不固定。

右固定区的第一列必须同时具备左边界和阴影：

```css
border-left: 1px solid rgba(255,255,255,.1);
box-shadow: -7px 0 7px rgba(0,0,0,.12);
```

固定列背景必须独立设置，不能透明，否则横向滚动时会透出中间列。验证横向滚动后第一固定列边界仍存在。

### 表头与普通行

- 表头背景 `#0b1630`，窄档高度 `25.5px`，字体 `9.8px`，line-height `11.27px`。
- 普通 body cell 背景 `#030b21`，窄档高度 `42.6875px`，字体 `9.8px`，line-height `11.27px`。
- body cell 无纵向边框、无底部边框；表头仅使用左侧 hairline 分隔。
- cell padding 为 `0`，内容水平居中；长文本按页面需要截断，不允许撑高行。

### 展开行

展开行不是一块直接填蓝的 cell，而是三层结构：

```text
expanded td: #030b21, padding 0
└─ detail-container: rgba(5,25,56,.5)
   └─ detail-scroll: #103c71, full table width
      └─ detail-grid: display:flex
```

窄档外层展开 cell 高度 `58px`，中间容器和详情滚动层高度 `56px`。详情项使用 flex 排列，padding 约 `1.4px 2.8px`，最小宽度 `77px`；宽档最小宽度按比例约 `110px`。数值字号 `11.2px`，标签字号 `7.7px`，标签 line-height 约 `8.855px`。展开行不能继承普通 row 的 hover 背景，也不能增加默认 table border。

详情项不是等分列：使用内容自然宽度的横向 flex 布局，`flex-direction: column-reverse`、`justify-content: space-around`、`align-items: center`，DOM 顺序保持“标签、数值”，视觉顺序为“数值在上、标签在下”。详情滚动层使用 `overflow: auto hidden`，横向内容超出时出现底部滚动条，纵向不额外滚动。

## 4. Layout 约束

推荐页面结构：

```text
page shell: height: 100vh; display:flex; flex-direction:column
└─ content layout: min-height:0; display:flex
   └─ main vertical layout: height:100%; min-height:0
      ├─ filters: flex:none
      ├─ HTable fillHeight: flex:1; min-height:0
      └─ pagination: flex:none
```

任何中间层缺少 `min-height: 0`，都会导致滚动区溢出或 HTable 退化成内容自适应高度。`overflow:auto` 只放在表格 scroll 层，不要让页面 body 同时出现第二条纵向滚动条。

## 5. Sidebar 规格（供后续实现 HSidebar）

当前组件库没有专门的 `HSidebar`，先按以下结构实现：

```text
sidebar
├─ group heading: 基础信息 + 展开箭头
├─ active item: 设备信息
├─ item: 人员列表
├─ item: 配置信息
├─ group heading: 运营记录 + 展开箭头
├─ item: 调度管理
├─ group heading: 运营管理 + 展开箭头
└─ item: 运营报表
```

宽档侧栏宽约 `190px`；窄档宽约 `133px`。宽档 group/item 行高 `40px`，窄档约 `28px`。侧栏背景 `#030d26`，右边界使用低对比度蓝色 hairline。活动项背景 `#168ef0`，文字白色；普通文字约 `#bfcee5`，图标约 `#9db2d0`，分组图标约 `#72b7ff`。

图标应使用统一 SVG sprite 或现有资产，不要用 Unicode 字符冒充生产图标。Sidebar API 至少需要 `items / groups / activeKey / collapsible / onActiveChange`，并支持窄档尺寸 token。

## 6. AI 校验清单

- 是否使用了 `HInput / HSelect / HButton / HToggle / HTable`，而不是页面自己重写同类控件？
- input/select 是否同时设置 `box-sizing`、height、line-height？
- table 是否只有最后三列 `pinned: right`？
- 横向滚动到最右侧后，第一固定列的左边框和阴影是否仍可见？
- table 是否由 layout 提供高度，并使用 `fillHeight`？
- 展开行是否具备 expanded cell、detail container、detail scroll、detail grid 四层语义？
- 展开行高度、背景、字号是否独立于普通 body row？
- 0.7 缩放档和 1.0 宽档截图是否都通过？
- 页面是否只出现一条横向滚动条，且没有额外纵向页面滚动条？
