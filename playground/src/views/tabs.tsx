import { defineComponent, h } from 'vue'
import { Tabs } from '@demo/ui-react'
import { UiTabs } from '@demo/ui-vue'
import { ComponentPage } from './ComponentPage'
import type { ViewDefinition } from './types'

const tabItems = [
  { value: 'overview', label: 'Overview', content: 'Overview content.' },
  { value: 'details', label: 'Details', content: 'Details content.' },
]

const VueTabsDemo = defineComponent({
  name: 'VueTabsDemo',
  setup: () => () => h(UiTabs, { defaultValue: 'overview', items: tabItems }),
})

function TabsWebDemo() {
  return (
    <ui-tabs default-value="overview">
      <div data-part="list">
        <button data-part="trigger" data-value="overview">Overview</button>
        <button data-part="trigger" data-value="details">Details</button>
      </div>
      <div data-part="content" data-value="overview">Overview content.</div>
      <div data-part="content" data-value="details">Details content.</div>
    </ui-tabs>
  )
}

export default function TabsView() {
  const definition: ViewDefinition = {
    title: 'Tabs',
    description: 'Switch between related panels.',
    reactDemo: <Tabs defaultValue="overview" items={tabItems} />,
    vueDemo: VueTabsDemo,
    webDemo: <TabsWebDemo />,
  }
  return <ComponentPage {...definition} />
}
