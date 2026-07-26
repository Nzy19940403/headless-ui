export type ArkComponentCategory = 'disclosure' | 'form' | 'overlay' | 'selection' | 'data' | 'feedback' | 'navigation' | 'media' | 'utility'

export interface ComponentManifest {
  name: string
  aliases: string[]
  category: ArkComponentCategory
  source: 'ark-ui'
  renderers: { react: 'available'; vue: 'available'; webComponent: 'planned' }
}

export const arkComponentCatalog: ComponentManifest[] = [
  ['Accordion', 'disclosure'], ['AngleSlider', 'form'], ['Avatar', 'media'], ['Carousel', 'media'],
  ['Checkbox', 'form'], ['Clipboard', 'utility'], ['Collapsible', 'disclosure'], ['ColorPicker', 'form'],
  ['Combobox', 'selection'], ['DateInput', 'form'], ['DatePicker', 'form'], ['Dialog', 'overlay'],
  ['Drawer', 'overlay'], ['Editable', 'form'], ['Field', 'form'], ['Fieldset', 'form'],
  ['FileUpload', 'form'], ['FloatingPanel', 'overlay'], ['ImageCropper', 'media'], ['HoverCard', 'overlay'],
  ['Listbox', 'selection'], ['Marquee', 'media'], ['Menu', 'navigation'], ['NumberInput', 'form'],
  ['Pagination', 'navigation'], ['PasswordInput', 'form'], ['PinInput', 'form'], ['Popover', 'overlay'],
  ['ProgressCircular', 'feedback'], ['ProgressLinear', 'feedback'], ['QRCode', 'utility'], ['RadioGroup', 'form'],
  ['RatingGroup', 'form'], ['ScrollArea', 'data'], ['SegmentGroup', 'selection'], ['Select', 'selection'],
  ['SignaturePad', 'media'], ['Slider', 'form'], ['Splitter', 'data'], ['Steps', 'navigation'],
  ['Switch', 'form'], ['Tabs', 'navigation'], ['TagsInput', 'form'], ['Timer', 'feedback'],
  ['Toast', 'feedback'], ['Toggle', 'form'], ['ToggleGroup', 'selection'], ['Tooltip', 'overlay'],
  ['Tour', 'navigation'], ['TreeView', 'data'],
].map(([name, category]) => ({
  name,
  aliases: [name, name.replace(/[A-Z]/g, value => ` ${value}`).trim()],
  category: category as ArkComponentCategory,
  source: 'ark-ui' as const,
  renderers: { react: 'available' as const, vue: 'available' as const, webComponent: 'planned' as const },
}))
