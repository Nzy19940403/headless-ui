import { useState } from 'react'
import { defineComponent, h, ref } from 'vue'
import { HInput, HStack, HVStack, HTag } from '@demo/ui-react'
import { HInput as VueHInput, HVStack as VueHVStack, HStack as VueHStack, HTag as VueHTag } from '@demo/ui-vue'
import { mountWc } from '../wc-mount'
import { ComponentPage } from './ComponentPage'
import type { ViewDefinition } from './types'

/**
 * Input demos (parity across React / Vue / WC):
 * basic controlled, uncontrolled defaultValue, sizes, types, disabled / readOnly.
 * Field chrome (helper / error / required) is form-layer — not shown here.
 */

const DEMO = {
  basicValue: 'Demo field',
  ticket: 'TKT-1001',
  password: 'secret',
  url: 'https://example.com',
  disabled: 'Cannot edit',
  readOnly: 'Read-only value',
} as const

function DemoTags() {
  return (
    <HStack gap="sm" wrap>
      <HTag tone="neutral">size sm · md · lg</HTag>
      <HTag tone="success">onValueChange {'{ value }'}</HTag>
      <HTag tone="info">defaultValue vs value</HTag>
    </HStack>
  )
}

function ReactInputDemo() {
  const [name, setName] = useState<string>(DEMO.basicValue)
  const [email, setEmail] = useState('')
  const [search, setSearch] = useState('')

  return (
    <HVStack gap="lg" className="input-demo" style={{ width: '100%', maxWidth: 480 }}>
      <section className="input-demo-section">
        <h3 className="input-demo-title">Basic (controlled)</h3>
        <HInput
          label="Project name"
          placeholder="Enter name"
          value={name}
          onValueChange={d => setName((d.value as string))}
        />
        <span className="demo-result">Value: {name || '—'}</span>
      </section>

      <section className="input-demo-section">
        <h3 className="input-demo-title">Uncontrolled (defaultValue)</h3>
        <HInput
          label="Ticket id"
          name="ticket"
          defaultValue={DEMO.ticket}
          placeholder="Auto id"
        />
      </section>

      <section className="input-demo-section">
        <h3 className="input-demo-title">Sizes</h3>
        <HVStack gap="sm">
          <HInput label="Small" size="sm" placeholder="size=sm" defaultValue="sm" />
          <HInput label="Medium" size="md" placeholder="size=md" defaultValue="md" />
          <HInput label="Large" size="lg" placeholder="size=lg" defaultValue="lg" />
        </HVStack>
      </section>

      <section className="input-demo-section">
        <h3 className="input-demo-title">Types</h3>
        <HVStack gap="sm">
          <HInput
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onValueChange={d => setEmail(String(d.value))}
          />
          <HInput
            label="Search"
            type="search"
            placeholder="Search assets…"
            value={search}
            onValueChange={d => setSearch(String(d.value))}
          />
          <HInput
            label="Password"
            type="password"
            placeholder="••••••••"
            defaultValue={DEMO.password}
          />
          <HInput label="Tel" type="tel" placeholder="+86 …" defaultValue="" />
          <HInput label="URL" type="url" placeholder="https://" defaultValue={DEMO.url} />
        </HVStack>
      </section>

      <section className="input-demo-section">
        <h3 className="input-demo-title">Disabled / readOnly</h3>
        <HVStack gap="sm">
          <HInput label="Disabled" disabled defaultValue={DEMO.disabled} />
          <HInput label="Read only" readOnly defaultValue={DEMO.readOnly} />
        </HVStack>
      </section>

      <DemoTags />
    </HVStack>
  )
}

const VueInputDemo = defineComponent({
  name: 'VueInputDemo',
  setup() {
    const name = ref<string>(DEMO.basicValue)
    const email = ref<string>('')
    const search = ref<string>('')
    return () =>
      h(VueHVStack, { gap: 'lg', class: 'input-demo', style: 'width:100%;max-width:480px' }, { default: () => [
        h('section', { class: 'input-demo-section' }, [
          h('h3', { class: 'input-demo-title' }, 'Basic (controlled)'),
          h(VueHInput, {
            label: 'Project name',
            placeholder: 'Enter name',
            value: name.value,
            'onUpdate:value': (v: string) => {
              name.value = v
            },
            'onValue-change': (d: { value: string|number }) => {
              name.value = d.value as string
            },
          }),
          h('span', { class: 'demo-result' }, `Value: ${name.value || '—'}`),
        ]),
        h('section', { class: 'input-demo-section' }, [
          h('h3', { class: 'input-demo-title' }, 'Uncontrolled (defaultValue)'),
          h(VueHInput, {
            label: 'Ticket id',
            name: 'ticket',
            defaultValue: DEMO.ticket,
            placeholder: 'Auto id',
          }),
        ]),
        h('section', { class: 'input-demo-section' }, [
          h('h3', { class: 'input-demo-title' }, 'Sizes'),
          h(VueHVStack, { gap: 'sm' }, { default: () => [
            h(VueHInput, { label: 'Small', size: 'sm', defaultValue: 'sm', placeholder: 'size=sm' }),
            h(VueHInput, { label: 'Medium', size: 'md', defaultValue: 'md', placeholder: 'size=md' }),
            h(VueHInput, { label: 'Large', size: 'lg', defaultValue: 'lg', placeholder: 'size=lg' }),
          ]}),
        ]),
        h('section', { class: 'input-demo-section' }, [
          h('h3', { class: 'input-demo-title' }, 'Types'),
          h(VueHVStack, { gap: 'sm' }, { default: () => [
            h(VueHInput, {
              label: 'Email',
              type: 'email',
              placeholder: 'you@example.com',
              value: email.value,
              'onUpdate:value': (v: string) => {
                email.value = v
              },
            }),
            h(VueHInput, {
              label: 'Search',
              type: 'search',
              placeholder: 'Search assets…',
              value: search.value,
              'onUpdate:value': (v: string) => {
                search.value = v
              },
            }),
            h(VueHInput, {
              label: 'Password',
              type: 'password',
              placeholder: '••••••••',
              defaultValue: DEMO.password,
            }),
            h(VueHInput, { label: 'Tel', type: 'tel', placeholder: '+86 …', defaultValue: '' }),
            h(VueHInput, {
              label: 'URL',
              type: 'url',
              placeholder: 'https://',
              defaultValue: DEMO.url,
            }),
          ]}),
        ]),
        h('section', { class: 'input-demo-section' }, [
          h('h3', { class: 'input-demo-title' }, 'Disabled / readOnly'),
          h(VueHVStack, { gap: 'sm' }, { default: () => [
            h(VueHInput, { label: 'Disabled', disabled: true, defaultValue: DEMO.disabled }),
            h(VueHInput, { label: 'Read only', readOnly: true, defaultValue: DEMO.readOnly }),
          ]}),
        ]),
        h(VueHStack, { gap: 'sm', wrap: true }, { default: () => [
          h(VueHTag, { tone: 'neutral', content: 'size sm · md · lg' }),
          h(VueHTag, { tone: 'success', content: 'onValueChange { value }' }),
          h(VueHTag, { tone: 'info', content: 'defaultValue vs value' }),
        ]}),
      ]})
  }
})

function InputWebDemo() {
  return (
    <div
      style={{ width: '100%', maxWidth: 480, minWidth: 0 }}
      ref={root => {
        mountWc(
          root,
          `<h-v-stack gap="lg" style="width:100%">
             <div class="input-demo-section">
               <h3 class="input-demo-title">Basic (controlled)</h3>
               <h-input label="Project name" placeholder="Enter name" default-value="${DEMO.basicValue}" style="width:100%"></h-input>
               <span class="demo-result">Value: ${DEMO.basicValue}</span>
             </div>
             <div class="input-demo-section">
               <h3 class="input-demo-title">Uncontrolled (defaultValue)</h3>
               <h-input label="Ticket id" name="ticket" default-value="${DEMO.ticket}" placeholder="Auto id" style="width:100%"></h-input>
             </div>
             <div class="input-demo-section">
               <h3 class="input-demo-title">Sizes</h3>
               <h-v-stack gap="sm">
                 <h-input label="Small" size="sm" default-value="sm" placeholder="size=sm" style="width:100%"></h-input>
                 <h-input label="Medium" size="md" default-value="md" placeholder="size=md" style="width:100%"></h-input>
                 <h-input label="Large" size="lg" default-value="lg" placeholder="size=lg" style="width:100%"></h-input>
               </h-v-stack>
             </div>
             <div class="input-demo-section">
               <h3 class="input-demo-title">Types</h3>
               <h-v-stack gap="sm">
                 <h-input label="Email" type="email" placeholder="you@example.com" style="width:100%"></h-input>
                 <h-input label="Search" type="search" placeholder="Search assets…" style="width:100%"></h-input>
                 <h-input label="Password" type="password" placeholder="••••••••" default-value="${DEMO.password}" style="width:100%"></h-input>
                 <h-input label="Tel" type="tel" placeholder="+86 …" style="width:100%"></h-input>
                 <h-input label="URL" type="url" placeholder="https://" default-value="${DEMO.url}" style="width:100%"></h-input>
               </h-v-stack>
             </div>
             <div class="input-demo-section">
               <h3 class="input-demo-title">Disabled / readOnly</h3>
               <h-v-stack gap="sm">
                 <h-input label="Disabled" disabled default-value="${DEMO.disabled}" style="width:100%"></h-input>
                 <h-input label="Read only" readonly default-value="${DEMO.readOnly}" style="width:100%"></h-input>
               </h-v-stack>
             </div>
             <h-stack gap="sm" wrap>
               <h-tag tone="neutral" content="size sm · md · lg"></h-tag>
               <h-tag tone="success" content="onValueChange { value }"></h-tag>
               <h-tag tone="info" content="defaultValue vs value"></h-tag>
             </h-stack>
           </h-v-stack>`,
          host => {
            const first = host.querySelector('h-input') as HTMLElement & {
              onValueChange?: (d: { value: string }) => void
            }
            const out = host.querySelector('.demo-result')
            if (first && out) {
              first.onValueChange = d => {
                out.textContent = `Value: ${d.value || '—'}`
              }
            }
          },
        )
      }}
    />
  )
}

export default function InputView() {
  const definition: ViewDefinition = {
    apiKey: 'input',
    title: 'Input',
    description:
      'Text field: controlled value vs defaultValue, sizes, types, disabled/readOnly. Same sections on React / Vue / WC. Field chrome (helper/error/required) is form-layer.',
    reactDemo: <ReactInputDemo />,
    vueDemo: VueInputDemo,
    webDemo: <InputWebDemo />,
  }
  return <ComponentPage {...definition} />
}
