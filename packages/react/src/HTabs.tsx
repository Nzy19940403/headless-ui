import { Tabs as ArkTabs } from '@ark-ui/react/tabs'
import type { TabsContract, TabsItemContract, ValueChangeDetails } from '@demo/ui-core'

export interface HTabItem extends TabsItemContract<React.ReactNode> {}

export interface HTabsProps extends TabsContract<React.ReactNode> {
  onValueChange?: (details: ValueChangeDetails) => void
}

export function HTabs({ defaultValue, value, items, onValueChange }: HTabsProps) {
  return (
    <ArkTabs.Root defaultValue={defaultValue} value={value} onValueChange={onValueChange}>
      <ArkTabs.List>
        {items.map(item => <ArkTabs.Trigger key={item.value} value={item.value}>{item.label}</ArkTabs.Trigger>)}
      </ArkTabs.List>
      {items.map(item => <ArkTabs.Content key={item.value} value={item.value}>{item.content}</ArkTabs.Content>)}
    </ArkTabs.Root>
  )
}
