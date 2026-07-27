import { useState } from 'react'
import { defineComponent, h, ref } from 'vue'
import { HSlider } from '@demo/ui-react'
import { HSlider as VueHSlider } from '@demo/ui-vue'
import { mountWc } from '../wc-mount'
import { ComponentPage } from './ComponentPage'
import type { ViewDefinition } from './types'

const VueSliderDemo = defineComponent({
  name: 'VueSliderDemo',
  setup() {
    const value = ref(40)
    return () => h('div', { class: 'demo-stack', style: 'width:100%' }, [
      h(VueHSlider, {
        label: 'Volume',
        value: value.value,
        min: 0,
        max: 100,
        step: 1,
        'onUpdate:value': (v: number) => { value.value = v },
        'onValue-change': (d: { value: number }) => { value.value = d.value },
      }),
      h('span', { class: 'demo-result' }, `Value: ${value.value}`),
    ])
  },
})

function SliderWebDemo() {
  return (
    <div
      className="demo-stack"
      style={{ width: '100%' }}
      ref={root => {
        mountWc(
          root,
          `<h-slider label="Volume" default-value="40" min="0" max="100" step="1" style="width:100%"></h-slider>
           <span class="demo-result">Value: 40</span>`,
          host => {
            const el = host.querySelector('h-slider') as any
            const out = host.querySelector('.demo-result')
            if (!el || !out) return
            el.onValueChange = (d: { value: number }) => {
              out.textContent = `Value: ${d.value}`
            }
          },
        )
      }}
    />
  )
}

export default function SliderView() {
  const [value, setValue] = useState(40)
  const definition: ViewDefinition = {
    apiKey: 'slider',
    title: 'Slider',
    description: 'Single-thumb range. React/WC: onValueChange({ value: number }).',
    reactDemo: (
      <div className="demo-stack" style={{ width: '100%' }}>
        <HSlider label="Volume" value={value} min={0} max={100} step={1} onValueChange={d => setValue(d.value)} />
        <span className="demo-result">Value: {value}</span>
      </div>
    ),
    vueDemo: VueSliderDemo,
    webDemo: <SliderWebDemo />,
  }
  return <ComponentPage {...definition} />
}
