import { useState } from 'react'
import { defineComponent, h, ref } from 'vue'
// Direct file imports — avoid package barrels (index.ts) evaluating HTable and other heavy modules.
import { HNumberInput } from '../../../packages/react/src/HNumberInput'
import { HStack } from '../../../packages/react/src/HStack'
import { HVStack } from '../../../packages/react/src/HVStack'
import { HTag } from '../../../packages/react/src/HTag'
import VueHNumberInput from '@demo/ui-vue/HNumberInput.vue'
import VueHVStack from '@demo/ui-vue/HVStack.vue'
import VueHStack from '@demo/ui-vue/HStack.vue'
import VueHTag from '@demo/ui-vue/HTag.vue'
import { mountWc } from '../wc-mount'
import { ComponentPage } from './ComponentPage'
import type { ViewDefinition } from './types'

/**
 * NumberInput demos — parity with Ark UI control examples:
 * Basic · Min/Max · Precision · Scrubber · Mouse wheel · Formatting · Controlled.
 * Same sections on React / Vue / WC.
 * Field helper/error/required belong to form layer — not demoed here.
 * RootProvider is Ark-only composition; use Controlled value instead.
 */

const FRACTION: Intl.NumberFormatOptions = {
  minimumFractionDigits: 2,
  maximumFractionDigits: 3,
}

const CURRENCY: Intl.NumberFormatOptions = {
  style: 'currency',
  currency: 'USD',
}

function DemoTags() {
  return (
    <HStack gap="sm" wrap>
      <HTag tone="neutral">Ark: basic · min-max · fraction · scrubber</HTag>
      <HTag tone="info">mouse-wheel · formatting · controlled</HTag>
      <HTag tone="success">onValueChange {'{ value: string | number }'}</HTag>
    </HStack>
  )
}

function vueTags() {
  return h(VueHStack, { gap: 'sm', wrap: true }, { default: () => [
    h(VueHTag, { tone: 'neutral', content: 'Ark: basic · min-max · fraction · scrubber' }),
    h(VueHTag, { tone: 'info', content: 'mouse-wheel · formatting · controlled' }),
    h(VueHTag, { tone: 'success', content: 'onValueChange { value: string | number }' }),
  ]})
}

function ReactNumberDemo() {
  const [controlled, setControlled] = useState<string | number>('3')

  return (
    <HVStack gap="lg" className="input-demo" style={{ width: '100%', maxWidth: 420 }}>
      <section className="input-demo-section">
        <h3 className="input-demo-title">Basic</h3>
        <HNumberInput label="Quantity" defaultValue="0" />
      </section>

      <section className="input-demo-section">
        <h3 className="input-demo-title">Min and Max</h3>
        <HNumberInput label="Score" defaultValue="5" min={0} max={10} step={1} />
      </section>

      <section className="input-demo-section">
        <h3 className="input-demo-title">Precision (fraction digits)</h3>
        <HNumberInput
          label="Amount"
          defaultValue="1.00"
          step={0.01}
          formatOptions={FRACTION}
        />
      </section>

      <section className="input-demo-section">
        <h3 className="input-demo-title">Scrubber</h3>
        <HNumberInput label="Drag value" defaultValue="32" scrubber min={0} max={100} step={1} />
        <span className="demo-result">Drag the ⇄ handle horizontally</span>
      </section>

      <section className="input-demo-section">
        <h3 className="input-demo-title">Mouse wheel</h3>
        <HNumberInput label="Focus + scroll" defaultValue="10" allowMouseWheel min={0} max={100} step={1} />
        <span className="demo-result">Focus the field, then use mouse wheel</span>
      </section>

      <section className="input-demo-section">
        <h3 className="input-demo-title">Formatting (currency)</h3>
        <HNumberInput label="Price (USD)" defaultValue="12.5" step={0.5} formatOptions={CURRENCY} />
      </section>

      <section className="input-demo-section">
        <h3 className="input-demo-title">Controlled</h3>
        <HNumberInput
          label="Controlled quantity"
          value={controlled}
          min={0}
          max={99}
          step={1}
          onValueChange={d => setControlled(d.value)}
        />
        <span className="demo-result">Value: {controlled || '—'}</span>
        <HStack gap="sm">
          <button type="button" className="demo-btn" onClick={() => setControlled('0')}>
            Set 0
          </button>
          <button type="button" className="demo-btn" onClick={() => setControlled('50')}>
            Set 50
          </button>
        </HStack>
      </section>

      <DemoTags />
    </HVStack>
  )
}

const VueNumberDemo = defineComponent({
  name: 'VueNumberDemo',
  setup() {
    const controlled = ref<string | number>('3')
    const on =
      (target: { value: string | number }) =>
      (v: string | number) => {
        target.value = v
      }
    const onDetails =
      (target: { value: string | number }) =>
      (d: { value: string | number }) => {
        target.value = d.value
      }

    return () =>
      h(VueHVStack, { gap: 'lg', class: 'input-demo', style: 'width:100%;max-width:420px' }, { default: () => [
        h('section', { class: 'input-demo-section' }, [
          h('h3', { class: 'input-demo-title' }, 'Basic'),
          h(VueHNumberInput, { label: 'Quantity', defaultValue: '0' }),
        ]),
        h('section', { class: 'input-demo-section' }, [
          h('h3', { class: 'input-demo-title' }, 'Min and Max'),
          h(VueHNumberInput, {
            label: 'Score',
            defaultValue: '5',
            min: 0,
            max: 10,
            step: 1,
          }),
        ]),
        h('section', { class: 'input-demo-section' }, [
          h('h3', { class: 'input-demo-title' }, 'Precision (fraction digits)'),
          h(VueHNumberInput, {
            label: 'Amount',
            defaultValue: '1.00',
            step: 0.01,
            formatOptions: FRACTION,
          }),
        ]),
        h('section', { class: 'input-demo-section' }, [
          h('h3', { class: 'input-demo-title' }, 'Scrubber'),
          h(VueHNumberInput, {
            label: 'Drag value',
            defaultValue: '32',
            scrubber: true,
            min: 0,
            max: 100,
            step: 1,
          }),
          h('span', { class: 'demo-result' }, 'Drag the ⇄ handle horizontally'),
        ]),
        h('section', { class: 'input-demo-section' }, [
          h('h3', { class: 'input-demo-title' }, 'Mouse wheel'),
          h(VueHNumberInput, {
            label: 'Focus + scroll',
            defaultValue: '10',
            allowMouseWheel: true,
            min: 0,
            max: 100,
            step: 1,
          }),
          h('span', { class: 'demo-result' }, 'Focus the field, then use mouse wheel'),
        ]),
        h('section', { class: 'input-demo-section' }, [
          h('h3', { class: 'input-demo-title' }, 'Formatting (currency)'),
          h(VueHNumberInput, {
            label: 'Price (USD)',
            defaultValue: '12.5',
            step: 0.5,
            formatOptions: CURRENCY,
          }),
        ]),
        h('section', { class: 'input-demo-section' }, [
          h('h3', { class: 'input-demo-title' }, 'Controlled'),
          h(VueHNumberInput, {
            label: 'Controlled quantity',
            value: controlled.value,
            min: 0,
            max: 99,
            step: 1,
            'onUpdate:value': on(controlled),
            'onValue-change': onDetails(controlled),
          }),
          h('span', { class: 'demo-result' }, `Value: ${controlled.value || '—'}`),
          h(VueHStack, { gap: 'sm' }, { default: () => [
            h(
              'button',
              { type: 'button', class: 'demo-btn', onClick: () => { controlled.value = '0' } },
              'Set 0',
            ),
            h(
              'button',
              { type: 'button', class: 'demo-btn', onClick: () => { controlled.value = '50' } },
              'Set 50',
            ),
          ]}),
        ]),
        vueTags(),
      ]})
  }
})

function NumberWebDemo() {
  return (
    <div
      style={{ width: '100%', maxWidth: 420, minWidth: 0 }}
      ref={root => {
        mountWc(
          root,
          `<h-v-stack gap="lg" style="width:100%">
             <div class="input-demo-section">
               <h3 class="input-demo-title">Basic</h3>
               <h-number-input label="Quantity" default-value="0" style="width:100%"></h-number-input>
             </div>
             <div class="input-demo-section">
               <h3 class="input-demo-title">Min and Max</h3>
               <h-number-input label="Score" default-value="5" min="0" max="10" step="1" style="width:100%"></h-number-input>
             </div>
             <div class="input-demo-section">
               <h3 class="input-demo-title">Precision (fraction digits)</h3>
               <h-number-input id="ni-frac" label="Amount" default-value="1.00" step="0.01" style="width:100%"></h-number-input>
             </div>
             <div class="input-demo-section">
               <h3 class="input-demo-title">Scrubber</h3>
               <h-number-input label="Drag value" default-value="32" scrubber min="0" max="100" step="1" style="width:100%"></h-number-input>
               <span class="demo-result">Drag the ⇄ handle horizontally</span>
             </div>
             <div class="input-demo-section">
               <h3 class="input-demo-title">Mouse wheel</h3>
               <h-number-input label="Focus + scroll" default-value="10" allow-mouse-wheel min="0" max="100" step="1" style="width:100%"></h-number-input>
               <span class="demo-result">Focus the field, then use mouse wheel</span>
             </div>
             <div class="input-demo-section">
               <h3 class="input-demo-title">Formatting (currency)</h3>
               <h-number-input data-demo="currency" label="Price (USD)" default-value="12.5" step="0.5" style="width:100%"></h-number-input>
             </div>
             <div class="input-demo-section">
               <h3 class="input-demo-title">Controlled</h3>
               <h-number-input id="ni-ctrl" label="Controlled quantity" value="3" min="0" max="99" step="1" style="width:100%"></h-number-input>
               <span class="demo-result" data-out="ctrl">Value: 3</span>
               <h-stack gap="sm">
                 <button type="button" class="demo-btn" data-set="0">Set 0</button>
                 <button type="button" class="demo-btn" data-set="50">Set 50</button>
               </h-stack>
             </div>
             <h-stack gap="sm" wrap>
               <h-tag tone="neutral" content="Ark: basic · min-max · fraction · scrubber"></h-tag>
               <h-tag tone="info" content="mouse-wheel · formatting · controlled"></h-tag>
               <h-tag tone="success" content="onValueChange { value: string | number }"></h-tag>
             </h-stack>
           </h-v-stack>`,
          host => {
            type NiEl = HTMLElement & {
              formatOptions?: Intl.NumberFormatOptions
              value?: string | number
              setValue?: (v: string | number) => void
              onValueChange?: (d: { value: string | number }) => void
            }

            // formatOptions via property (JSON attrs are awkward in markup)
            const frac = host.querySelector('#ni-frac') as NiEl | null
            if (frac) frac.formatOptions = FRACTION

            const cur = host.querySelector('[data-demo="currency"]') as NiEl | null
            if (cur) cur.formatOptions = CURRENCY

            const ctrl = host.querySelector('#ni-ctrl') as NiEl | null
            const out = host.querySelector('[data-out="ctrl"]')
            if (ctrl && out) {
              ctrl.onValueChange = d => {
                ctrl.value = d.value
                out.textContent = `Value: ${d.value || '—'}`
              }
              host.querySelectorAll<HTMLButtonElement>('[data-set]').forEach(btn => {
                btn.addEventListener('click', () => {
                  const v = btn.getAttribute('data-set') ?? '0'
                  if (typeof ctrl.setValue === 'function') ctrl.setValue(v)
                  else ctrl.value = v
                  out.textContent = `Value: ${v}`
                })
              })
            }
          },
        )
      }}
    />
  )
}

export default function NumberInputView() {
  const definition: ViewDefinition = {
    apiKey: 'numberInput',
    title: 'Number Input',
    description:
      'Ark NumberInput gallery: basic, min/max, precision, scrubber, mouse wheel, currency formatting, controlled. Same on React / Vue / WC. Field chrome (helper/error/required) is form-layer.',
    reactDemo: <ReactNumberDemo />,
    vueDemo: VueNumberDemo,
    webDemo: <NumberWebDemo />,
  }
  return <ComponentPage {...definition} />
}
