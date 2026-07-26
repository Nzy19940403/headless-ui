import { Tabs as ArkTabs } from '@ark-ui/react/tabs'

export interface TabItem {
  value: string
  label: string
  content: React.ReactNode
}

export interface TabsProps {
  defaultValue: string
  items: TabItem[]
}

export function Tabs({ defaultValue, items }: TabsProps) {
  return (
    <ArkTabs.Root defaultValue={defaultValue}>
      <ArkTabs.List>
        {items.map(item => <ArkTabs.Trigger key={item.value} value={item.value}>{item.label}</ArkTabs.Trigger>)}
      </ArkTabs.List>
      {items.map(item => <ArkTabs.Content key={item.value} value={item.value}>{item.content}</ArkTabs.Content>)}
    </ArkTabs.Root>
  )
}
