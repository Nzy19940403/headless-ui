import { defineComponent, h } from 'vue'
import { HSkeleton } from '@demo/ui-react'
import { HSkeleton as VueHSkeleton } from '@demo/ui-vue'
import { ComponentPage } from './ComponentPage'
import type { ViewDefinition } from './types'

const VueSkeletonDemo = defineComponent({
  name: 'VueSkeletonDemo',
  setup: () => () => h('div', { class: 'demo-stack', style: 'width:100%' }, [
    h(VueHSkeleton, { height: '16px' }),
    h(VueHSkeleton, { height: '16px', width: '70%' }),
    h(VueHSkeleton, { circle: true, height: '40px' }),
  ]),
})

export default function SkeletonView() {
  const definition: ViewDefinition = {
    apiKey: 'skeleton',
    title: 'Skeleton',
    description: 'Loading placeholder blocks.',
    reactDemo: (
      <div className="demo-stack" style={{ width: '100%' }}>
        <HSkeleton height="16px" />
        <HSkeleton height="16px" width="70%" />
        <HSkeleton circle height="40px" />
      </div>
    ),
    vueDemo: VueSkeletonDemo,
    webDemo: (
      <div className="demo-stack" style={{ width: '100%' }}>
        <h-skeleton height="16px" />
        <h-skeleton height="16px" width="70%" />
        <h-skeleton circle height="40px" />
      </div>
    ),
  }
  return <ComponentPage {...definition} />
}
