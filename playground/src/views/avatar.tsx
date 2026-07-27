import { defineComponent, h } from 'vue'
import { HAvatar } from '@demo/ui-react'
import { HAvatar as VueHAvatar } from '@demo/ui-vue'
import { ComponentPage } from './ComponentPage'
import type { ViewDefinition } from './types'

const VueAvatarDemo = defineComponent({
  name: 'VueAvatarDemo',
  setup: () => () => h('div', { class: 'tag-demo-row' }, [
    h(VueHAvatar, { fallback: 'LC', size: 'sm' }),
    h(VueHAvatar, { fallback: 'MZ', size: 'md' }),
    h(VueHAvatar, { fallback: 'NW', size: 'lg' }),
  ]),
})

export default function AvatarView() {
  const definition: ViewDefinition = {
    apiKey: 'avatar',
    title: 'Avatar',
    description: 'User or entity portrait with fallback initials.',
    reactDemo: (
      <div className="tag-demo-row">
        <HAvatar fallback="LC" size="sm" />
        <HAvatar fallback="MZ" size="md" />
        <HAvatar fallback="NW" size="lg" />
      </div>
    ),
    vueDemo: VueAvatarDemo,
    webDemo: (
      <div className="tag-demo-row">
        <h-avatar fallback="LC" size="sm" />
        <h-avatar fallback="MZ" size="md" />
        <h-avatar fallback="NW" size="lg" />
      </div>
    ),
  }
  return <ComponentPage {...definition} />
}
