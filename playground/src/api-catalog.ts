/** Public API surface shown on each playground component page. */

export interface ApiField {
  name: string
  type: string
  defaultValue?: string
  description?: string
}

export interface ComponentApiDoc {
  /** Core contract symbol, e.g. ButtonContract */
  contract: string
  /** packages/core path */
  contractFile: string
  props: ApiField[]
  events?: ApiField[]
  slots?: ApiField[]
  notes?: string[]
  /** Framework event mapping (same payload, different names). */
  eventMapping?: {
    react: string
    vue: string
    webComponent: string
  }
}

export const componentApis = {
  button: {
    contract: 'ButtonContract',
    contractFile: 'packages/core/src/button-contract.ts',
    props: [
      { name: 'variant', type: "'primary' | 'secondary' | 'ghost'", defaultValue: "'primary'" },
      { name: 'size', type: "'sm' | 'md' | 'lg'", defaultValue: "'md'" },
      { name: 'disabled', type: 'boolean', defaultValue: 'false' },
      { name: 'children / default slot / light DOM', type: 'content', description: 'Button label' },
    ],
    events: [
      { name: 'click', type: 'native', description: 'Native click on all stacks' },
    ],
    notes: ['React: <HButton>', 'Vue: <HButton>', 'WC: <h-button>'],
  },
  input: {
    contract: 'InputContract',
    contractFile: 'packages/core/src/input-contract.ts',
    props: [
      { name: 'label', type: 'string' },
      { name: 'placeholder', type: 'string' },
      { name: 'value', type: 'string', description: 'Controlled' },
      { name: 'defaultValue / default-value', type: 'string' },
      { name: 'type', type: 'text | password | email | …', defaultValue: "'text'" },
      { name: 'disabled', type: 'boolean', defaultValue: 'false' },
      { name: 'required', type: 'boolean', defaultValue: 'false' },
      { name: 'readOnly / readonly', type: 'boolean', defaultValue: 'false' },
      { name: 'error', type: 'string' },
      { name: 'helperText / helper-text', type: 'string' },
      { name: 'size', type: "'sm' | 'md' | 'lg'", defaultValue: "'md'" },
      { name: 'name', type: 'string' },
    ],
    events: [
      { name: 'value-change', type: '{ value: string }' },
    ],
    eventMapping: {
      react: 'onValueChange({ value })',
      vue: 'value-change / update:value',
      webComponent: 'onValueChange prop + value-change event',
    },
  },
  select: {
    contract: 'SelectContract',
    contractFile: 'packages/core/src/select-contract.ts',
    props: [
      { name: 'items', type: '{ value: string; label: string; disabled?: boolean }[]', description: 'Required' },
      { name: 'value', type: 'string' },
      { name: 'defaultValue / default-value', type: 'string' },
      { name: 'placeholder', type: 'string', defaultValue: "'Select…'" },
      { name: 'disabled', type: 'boolean', defaultValue: 'false' },
      { name: 'name', type: 'string' },
      { name: 'label', type: 'string' },
    ],
    events: [{ name: 'value-change', type: '{ value: string }' }],
    eventMapping: {
      react: 'onValueChange({ value })',
      vue: 'value-change / update:value',
      webComponent: 'onValueChange prop + value-change event',
    },
  },
  radio: {
    contract: 'RadioGroupContract',
    contractFile: 'packages/core/src/radio-group-contract.ts',
    props: [
      { name: 'items', type: '{ value: string; label: string; disabled?: boolean }[]', description: 'Required' },
      { name: 'value', type: 'string', description: 'Controlled current value — use this to display selection' },
      { name: 'defaultValue / default-value', type: 'string', description: 'Uncontrolled initial only' },
      { name: 'disabled', type: 'boolean', defaultValue: 'false' },
      { name: 'name', type: 'string' },
      { name: 'label', type: 'string' },
    ],
    events: [{ name: 'value-change', type: '{ value: string }', description: 'Payload always { value }' }],
    eventMapping: {
      react: 'onValueChange({ value })',
      vue: 'update:value / value-change',
      webComponent: 'onValueChange prop + value-change event',
    },
    notes: [
      'Show current selection from controlled `value`, not from DOM/input.checked.',
      'Same pattern as Tabs/Select: value + value-change details.',
    ],
  },
  checkbox: {
    contract: 'CheckboxContract',
    contractFile: 'packages/core/src/checkbox-contract.ts',
    props: [
      { name: 'label', type: 'string', description: 'Required' },
      { name: 'checked', type: 'boolean' },
      { name: 'defaultChecked / default-checked', type: 'boolean' },
      { name: 'disabled', type: 'boolean', defaultValue: 'false' },
    ],
    events: [{ name: 'checked-change', type: '{ checked: boolean }' }],
    eventMapping: {
      react: 'onCheckedChange({ checked })',
      vue: 'checked-change',
      webComponent: 'onCheckedChange prop + checked-change event',
    },
  },
  toggle: {
    contract: 'ToggleContract',
    contractFile: 'packages/core/src/toggle-contract.ts',
    props: [
      { name: 'checked', type: 'boolean' },
      { name: 'defaultChecked / default-checked', type: 'boolean' },
      { name: 'disabled', type: 'boolean', defaultValue: 'false' },
      { name: 'children / default slot / label part', type: 'content' },
    ],
    events: [{ name: 'checked-change', type: '{ checked: boolean }' }],
    eventMapping: {
      react: 'onCheckedChange({ checked })',
      vue: 'checked-change',
      webComponent: 'onCheckedChange prop + checked-change event',
    },
  },
  card: {
    contract: 'CardContract',
    contractFile: 'packages/core/src/card-contract.ts',
    props: [
      { name: 'title', type: 'content / string' },
      { name: 'description', type: 'content / string' },
      { name: 'variant', type: "'surface' | 'muted'", defaultValue: "'surface'" },
      { name: 'children / default slot', type: 'content' },
    ],
  },
  tag: {
    contract: 'TagContract',
    contractFile: 'packages/core/src/tag-contract.ts',
    props: [
      { name: 'tone', type: "'neutral' | 'success' | 'warning' | 'danger' | 'info'", defaultValue: "'neutral'" },
      { name: 'children / default slot / light DOM', type: 'content' },
    ],
  },
  badge: {
    contract: 'BadgeContract',
    contractFile: 'packages/core/src/badge-contract.ts',
    props: [
      { name: 'tone', type: "TagTone", defaultValue: "'neutral'" },
      { name: 'dot', type: 'boolean', defaultValue: 'false' },
      { name: 'children', type: 'content', description: 'Hidden when dot' },
    ],
  },
  avatar: {
    contract: 'AvatarContract',
    contractFile: 'packages/core/src/avatar-contract.ts',
    props: [
      { name: 'src', type: 'string' },
      { name: 'alt', type: 'string' },
      { name: 'fallback', type: 'string' },
      { name: 'size', type: "'sm' | 'md' | 'lg'", defaultValue: "'md'" },
    ],
  },
  tooltip: {
    contract: 'TooltipContract',
    contractFile: 'packages/core/src/tooltip-contract.ts',
    props: [
      { name: 'content', type: 'content / string', description: 'Required' },
      { name: 'open', type: 'boolean' },
      { name: 'defaultOpen / default-open', type: 'boolean' },
      { name: 'disabled', type: 'boolean', defaultValue: 'false' },
      { name: 'positioning', type: "'top' | 'bottom' | 'left' | 'right'", defaultValue: "'top'" },
      { name: 'children / trigger', type: 'content' },
    ],
    events: [{ name: 'open-change', type: '{ open: boolean }' }],
    eventMapping: {
      react: 'onOpenChange({ open })',
      vue: 'open-change',
      webComponent: 'onOpenChange prop + open-change event',
    },
  },
  progress: {
    contract: 'ProgressContract',
    contractFile: 'packages/core/src/progress-contract.ts',
    props: [
      { name: 'value', type: 'number' },
      { name: 'min', type: 'number', defaultValue: '0' },
      { name: 'max', type: 'number', defaultValue: '100' },
      { name: 'label', type: 'string' },
      { name: 'indeterminate', type: 'boolean', defaultValue: 'false' },
    ],
  },
  skeleton: {
    contract: 'SkeletonContract',
    contractFile: 'packages/core/src/skeleton-contract.ts',
    props: [
      { name: 'width', type: 'string', defaultValue: "'100%'" },
      { name: 'height', type: 'string', defaultValue: "'1rem'" },
      { name: 'circle', type: 'boolean', defaultValue: 'false' },
      { name: 'animated', type: 'boolean', defaultValue: 'true' },
    ],
  },
  empty: {
    contract: 'EmptyContract',
    contractFile: 'packages/core/src/empty-contract.ts',
    props: [
      { name: 'title', type: 'content / string', defaultValue: "'No data'" },
      { name: 'description', type: 'content / string' },
    ],
    slots: [
      { name: 'children / default slot / light-DOM children', type: 'action area', description: 'e.g. Add device button' },
    ],
    notes: [
      'Action buttons must wire their own onClick — Empty only hosts the action slot.',
      'WC: light-DOM children stay in place (no Shadow slot, no reparent) so React/Vue click handlers work.',
    ],
  },
  separator: {
    contract: 'SeparatorContract',
    contractFile: 'packages/core/src/separator-contract.ts',
    props: [
      { name: 'orientation', type: "'horizontal' | 'vertical'", defaultValue: "'horizontal'" },
    ],
  },
  dialog: {
    contract: 'DialogContract',
    contractFile: 'packages/core/src/dialog-contract.ts',
    props: [
      { name: 'trigger', type: 'content / string' },
      { name: 'title', type: 'content / string' },
      { name: 'description', type: 'content / string' },
      { name: 'open', type: 'boolean' },
      { name: 'defaultOpen / default-open', type: 'boolean' },
      { name: 'children / default slot', type: 'body content' },
    ],
    events: [{ name: 'open-change', type: '{ open: boolean }' }],
    eventMapping: {
      react: 'onOpenChange({ open })',
      vue: 'open-change',
      webComponent: 'onOpenChange prop + open-change event',
    },
  },
  drawer: {
    contract: 'DrawerContract',
    contractFile: 'packages/core/src/drawer-contract.ts',
    props: [
      { name: 'trigger', type: 'content / string' },
      { name: 'title', type: 'content / string' },
      { name: 'description', type: 'content / string' },
      { name: 'open / defaultOpen', type: 'boolean' },
      { name: 'placement', type: "'left' | 'right' | 'top' | 'bottom'", defaultValue: "'right'" },
      { name: 'size', type: 'CSS length', defaultValue: "'360px'", description: 'Width (L/R) or height (T/B)' },
      { name: 'children / default slot', type: 'body content' },
    ],
    events: [{ name: 'open-change', type: '{ open: boolean }' }],
    eventMapping: {
      react: 'onOpenChange({ open })',
      vue: 'open-change',
      webComponent: 'onOpenChange prop + open-change event',
    },
    notes: [
      'Ark UI Drawer / @zag-js/drawer. placement maps to swipeDirection (left→start, right→end, top→up, bottom→down).',
      'Theme: ui-drawer__* classes in packages/theme.',
    ],
  },
  tabs: {
    contract: 'TabsContract',
    contractFile: 'packages/core/src/tabs-contract.ts',
    props: [
      { name: 'items', type: '{ value; label; content }[]', description: 'Required' },
      { name: 'value', type: 'string' },
      { name: 'defaultValue / default-value', type: 'string' },
    ],
    events: [{ name: 'value-change', type: '{ value: string }' }],
    eventMapping: {
      react: 'onValueChange({ value })',
      vue: 'value-change',
      webComponent: 'onValueChange prop + value-change event',
    },
  },
  accordion: {
    contract: 'AccordionContract',
    contractFile: 'packages/core/src/accordion-contract.ts',
    props: [
      { name: 'items', type: '{ value; title; content }[]', description: 'Required' },
      { name: 'multiple', type: 'boolean', defaultValue: 'false' },
      { name: 'value', type: 'string[]' },
      { name: 'defaultValue / default-value', type: 'string[] / comma list (WC)' },
    ],
    events: [{ name: 'value-change', type: '{ value: string[] }' }],
    eventMapping: {
      react: 'onValueChange({ value: string[] })',
      vue: 'value-change',
      webComponent: 'onValueChange prop + value-change event',
    },
  },
  textarea: {
    contract: 'TextareaContract',
    contractFile: 'packages/core/src/textarea-contract.ts',
    props: [
      { name: 'label', type: 'string' },
      { name: 'value', type: 'string', description: 'Controlled — MeshFlow field value' },
      { name: 'defaultValue / default-value', type: 'string' },
      { name: 'rows', type: 'number', defaultValue: '3' },
      { name: 'disabled / readOnly / required', type: 'boolean' },
      { name: 'error / helperText', type: 'string' },
      { name: 'name', type: 'string', description: 'Field key for MeshFlow / form' },
    ],
    events: [{ name: 'value-change', type: '{ value: string }' }],
    eventMapping: {
      react: 'onValueChange({ value })',
      vue: 'update:value / value-change',
      webComponent: 'onValueChange prop + value-change event',
    },
  },
  numberInput: {
    contract: 'NumberInputContract',
    contractFile: 'packages/core/src/number-input-contract.ts',
    props: [
      { name: 'value', type: 'string', description: 'Ark string number; MeshFlow may coerce' },
      { name: 'min / max / step', type: 'number' },
      { name: 'label / name / error / helperText', type: 'string' },
      { name: 'disabled / readOnly / required', type: 'boolean' },
    ],
    events: [{ name: 'value-change', type: '{ value: string }' }],
    eventMapping: {
      react: 'onValueChange({ value })',
      vue: 'update:value / value-change',
      webComponent: 'onValueChange prop + value-change event',
    },
  },
  passwordInput: {
    contract: 'PasswordInputContract',
    contractFile: 'packages/core/src/password-input-contract.ts',
    props: [
      { name: 'value', type: 'string' },
      { name: 'label / placeholder / name / error / helperText', type: 'string' },
      { name: 'autoComplete', type: "'current-password' | 'new-password'" },
      { name: 'disabled / readOnly / required', type: 'boolean' },
    ],
    events: [{ name: 'value-change', type: '{ value: string }' }],
    eventMapping: {
      react: 'onValueChange({ value })',
      vue: 'update:value / value-change',
      webComponent: 'onValueChange prop + value-change event',
    },
    notes: ['Visibility toggle is local UI state; not a MeshFlow field.'],
  },
  combobox: {
    contract: 'ComboboxContract',
    contractFile: 'packages/core/src/combobox-contract.ts',
    props: [
      { name: 'items', type: '{ value; label; disabled? }[]', description: 'Required' },
      { name: 'value', type: 'string', description: 'Selected item value (single)' },
      { name: 'placeholder / label / name', type: 'string' },
      { name: 'disabled', type: 'boolean' },
    ],
    events: [{ name: 'value-change', type: '{ value: string }' }],
    eventMapping: {
      react: 'onValueChange({ value })',
      vue: 'update:value / value-change',
      webComponent: 'onValueChange prop + value-change event',
    },
  },
  slider: {
    contract: 'SliderContract',
    contractFile: 'packages/core/src/slider-contract.ts',
    props: [
      { name: 'value', type: 'number', description: 'Single thumb' },
      { name: 'min / max / step', type: 'number', defaultValue: '0 / 100 / 1' },
      { name: 'label / name', type: 'string' },
      { name: 'disabled', type: 'boolean' },
    ],
    events: [{ name: 'value-change', type: '{ value: number }' }],
    eventMapping: {
      react: 'onValueChange({ value: number })',
      vue: 'update:value / value-change',
      webComponent: 'onValueChange prop + value-change event',
    },
  },
  segmentGroup: {
    contract: 'SegmentGroupContract',
    contractFile: 'packages/core/src/segment-group-contract.ts',
    props: [
      { name: 'items', type: '{ value; label; disabled? }[]', description: 'Required' },
      { name: 'value', type: 'string' },
      { name: 'label / name', type: 'string' },
      { name: 'disabled', type: 'boolean' },
    ],
    events: [{ name: 'value-change', type: '{ value: string }' }],
    eventMapping: {
      react: 'onValueChange({ value })',
      vue: 'update:value / value-change',
      webComponent: 'onValueChange prop + value-change event',
    },
  },
  datePicker: {
    contract: 'DatePickerContract',
    contractFile: 'packages/core/src/date-picker-contract.ts',
    props: [
      { name: 'value / defaultValue', type: 'string[]', description: 'ISO dates; single/range/multiple' },
      { name: 'open / defaultOpen', type: 'boolean' },
      { name: 'min / max', type: 'string (ISO)' },
      { name: 'selectionMode', type: "'single' | 'multiple' | 'range'", defaultValue: "'single'" },
      { name: 'view / defaultView / minView / maxView', type: "'day' | 'month' | 'year'" },
      { name: 'label / name / placeholder / locale / timeZone', type: 'string' },
      { name: 'disabled / readOnly / required / invalid / inline', type: 'boolean' },
      { name: 'positioning', type: "'top' | 'bottom' | 'left' | 'right'" },
    ],
    events: [
      { name: 'value-change', type: '{ value: string[]; valueAsString: string[]; view }' },
      { name: 'open-change', type: '{ open: boolean; value: string[] }' },
      { name: 'focus-change', type: 'value-change + focusedValue: string' },
      { name: 'view-change', type: '{ view }' },
      { name: 'visible-range-change', type: '{ view; visibleRange: { start; end } }' },
    ],
    eventMapping: {
      react: 'onValueChange / onOpenChange / onFocusChange / onViewChange / onVisibleRangeChange',
      vue: 'value-change / open-change / focus-change / view-change / visible-range-change',
      webComponent: 'same property names + kebab CustomEvents (Lit + Zag)',
    },
    notes: [
      'Core never exposes Zag DateValue — convert at renderer boundary only.',
      'WC: packages/web-components/src/h-date-picker.ts (Lit + @zag-js/date-picker).',
    ],
  },
  table: {
    contract: 'TableContract',
    contractFile: 'packages/core/src/table-contract.ts',
    props: [
      { name: 'columns', type: 'TableColumnContract[]', description: 'accessorKey + header' },
      { name: 'data', type: 'Record<string, unknown>[]' },
      { name: 'enableSorting', type: 'boolean', defaultValue: 'true' },
      { name: 'sorting / defaultSorting', type: '{ id; desc }[]' },
      { name: 'enablePagination', type: 'boolean', defaultValue: 'false' },
      { name: 'pageSize', type: 'number', defaultValue: '10' },
      { name: 'pagination / defaultPagination', type: '{ pageIndex; pageSize }' },
      { name: 'emptyText / caption / loading', type: 'string / boolean' },
    ],
    events: [
      { name: 'sorting-change', type: '{ sorting: { id; desc }[] }' },
      { name: 'pagination-change', type: '{ pagination: { pageIndex; pageSize } }' },
    ],
    eventMapping: {
      react: 'onSortingChange / onPaginationChange',
      vue: 'sorting-change / pagination-change',
      webComponent: 'onSortingChange / onPaginationChange props + kebab CustomEvents',
    },
    notes: [
      'Powered by TanStack Table (react-table / vue-table / lit-table).',
      'Offline AI docs: docs/ai/tanstack-table/.',
    ],
  },
  tree: {
    contract: 'TreeContract',
    contractFile: 'packages/core/src/tree-contract.ts',
    props: [
      { name: 'nodes', type: 'TreeNodeContract[]', description: 'Forest roots: id, label, children?' },
      { name: 'label', type: 'string' },
      { name: 'selectionMode', type: "'single' | 'multiple'", defaultValue: "'single'" },
      { name: 'expandedValue / defaultExpandedValue', type: 'string[]' },
      { name: 'selectedValue / defaultSelectedValue', type: 'string[]' },
      { name: 'virtual', type: 'boolean', defaultValue: 'true', description: 'TanStack Virtual flat rows' },
      { name: 'height', type: 'number | string', defaultValue: '360' },
      { name: 'rowHeight', type: 'number', defaultValue: '32' },
      { name: 'overscan', type: 'number', defaultValue: '8' },
      { name: 'expandOnClick', type: 'boolean', defaultValue: 'true' },
    ],
    events: [
      { name: 'expanded-change', type: '{ expandedValue: string[] }' },
      { name: 'selection-change', type: '{ selectedValue: string[] }' },
    ],
    eventMapping: {
      react: 'onExpandedChange / onSelectionChange',
      vue: 'expanded-change / selection-change',
      webComponent: 'onExpandedChange / onSelectionChange + kebab CustomEvents',
    },
    notes: [
      'Engine: Ark/Zag TreeView + TanStack Virtual (getVisibleNodes flat list).',
      'Keyboard navigation scrolls via scrollToIndexFn.',
    ],
  },
  chart: {
    contract: 'ChartContract',
    contractFile: 'packages/core/src/chart-contract.ts',
    props: [
      { name: 'type', type: "'line' | 'bar' | 'pie' | 'area' | 'gauge' | 'scatter'", defaultValue: "'line'" },
      { name: 'categories', type: 'string[]', description: 'X axis / labels' },
      { name: 'series', type: '{ name; data; type? }[]', description: 'Cartesian series' },
      { name: 'data', type: '{ name; value }[]', description: 'Pie / gauge shorthand' },
      { name: 'title', type: 'string' },
      { name: 'height', type: 'number | string', defaultValue: '320' },
      { name: 'loading', type: 'boolean', defaultValue: 'false' },
      { name: 'emptyText / empty-text', type: 'string', defaultValue: "'No data'" },
      { name: 'legend', type: 'boolean', description: 'Default auto when multi-series' },
      { name: 'smooth', type: 'boolean', defaultValue: 'false' },
      { name: 'stack', type: 'boolean', defaultValue: 'false' },
      { name: 'unit', type: 'string', description: 'Y-axis unit suffix' },
      { name: 'option', type: 'EChartsCoreOption', description: 'React/Vue escape hatch only' },
    ],
    events: [{ name: 'chart-click', type: '{ name?; value?; seriesName?; dataIndex?; seriesIndex? }' }],
    eventMapping: {
      react: 'onChartClick(details)',
      vue: 'chart-click + onChartClick prop',
      webComponent: 'onChartClick prop + chart-click CustomEvent',
    },
    notes: [
      'Engine: Apache ECharts via shared @demo/ui-chart controller.',
      'Colors read from --ui-* tokens on each update.',
    ],
  },
  layout: {
    contract: 'ContainerContract | StackContract | VStackContract | GridContract | SplitContract | SpacerContract',
    contractFile: 'packages/core/src/layout-contract.ts',
    props: [
      { name: 'HContainer.size', type: "'sm'|'md'|'lg'|'xl'|'2xl'|'full' | responsive", defaultValue: "'xl'" },
      { name: 'HContainer.padded / center', type: 'boolean', defaultValue: 'true' },
      { name: 'HStack/HVStack.gap', type: 'LayoutGap | responsive string', defaultValue: "'md'" },
      { name: 'HStack/HVStack.align', type: "'start'|'center'|'end'|'stretch'|'baseline'", defaultValue: "'stretch'" },
      { name: 'HStack/HVStack.justify', type: "'start'|'center'|'end'|'between'|'around'|'evenly'", defaultValue: "'start'" },
      { name: 'HStack.wrap / reverse', type: 'boolean', defaultValue: 'false' },
      { name: 'HGrid.columns', type: "1|2|…|12|'auto-fit'|'auto-fill' | '1 md:2 lg:4'", defaultValue: "'auto-fit'" },
      { name: 'HGrid.minChildWidth', type: 'CSS length', defaultValue: "'240px'" },
      { name: 'HGrid.gap / rowGap / columnGap', type: 'LayoutGap | responsive' },
      { name: 'HGrid.equalHeight', type: 'boolean', defaultValue: 'false' },
      { name: 'HSplit.ratio', type: "'1:1'|'2:1'|…|'sidebar-left'|'sidebar-right'", defaultValue: "'1:1'" },
      { name: 'HSplit.collapseBelow', type: "'sm'|'md'|'lg'|'xl'|'never'", defaultValue: "'md'" },
      { name: 'HSplit.sidebarWidth', type: 'CSS length', defaultValue: "'320px'" },
      { name: 'HSpacer.size', type: 'LayoutGap | CSS length', defaultValue: "'md'" },
      { name: 'HSpacer.grow', type: 'boolean', defaultValue: 'true' },
    ],
    slots: [
      { name: 'default / light DOM', type: 'children', description: 'Layout regions and content' },
    ],
    notes: [
      'CSS-only primitives — no Ark/Zag/TanStack, no resize listeners.',
      'Responsive grammar: "1 md:2 lg:4", "sm md:lg" (mobile-first).',
      'React: HContainer/HStack/HVStack/HGrid/HSplit/HSpacer',
      'Vue: same names',
      'WC: h-container / h-stack / h-v-stack / h-grid / h-split / h-spacer',
      'See docs/api/layout/README.md',
    ],
  },
} as const satisfies Record<string, ComponentApiDoc>

export type ComponentApiKey = keyof typeof componentApis
