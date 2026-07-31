import { useState } from 'react'
import { defineComponent, h, ref, onMounted, nextTick } from 'vue'
import { HButton, HInput, HNumberInput, HSelect, HCheckbox, HEmpty, HStack, HVStack, HCard } from '@demo/ui-react'
import {
  HForm,
  HStack as VueHStack,
  HVStack as VueHVStack,
  HButton as VueHButton,
  HCard as VueHCard,
  from,
} from '@demo/ui-vue'
import type { MeshFormSchema, FromDescriptor } from '@demo/ui-vue'
import { ComponentPage } from './ComponentPage'
import type { ViewDefinition } from './types'
import { ObjectSchemaX } from '@demo/ui-form'

// ── Shared data ────────────────────────────────────────────────────────

const cityOptionsByCountry: Record<string, { label: string; value: string }[]> = {
  cn: [
    { label: 'Shanghai', value: 'sh' },
    { label: 'Beijing', value: 'bj' },
    { label: 'Shenzhen', value: 'sz' },
  ],
  us: [
    { label: 'New York', value: 'nyc' },
    { label: 'Los Angeles', value: 'la' },
    { label: 'Chicago', value: 'chi' },
  ],
  jp: [
    { label: 'Tokyo', value: 'tk' },
    { label: 'Osaka', value: 'os' },
    { label: 'Kyoto', value: 'ky' },
  ],
}

// ── JSON Schema (MeshFlow JSON Schema format) ─────────────────────────

const formSchema: ObjectSchemaX = {
  type: 'object',
  title: 'User Profile',
  properties: {
    country: {
      type: 'string',
      title: 'Country',
      default: 'cn',
      'x-widget': 'select',
      'x-options': [
        { label: 'China', value: 'cn' },
        { label: 'USA', value: 'us' },
        { label: 'Japan', value: 'jp' },
      ],
      'x-required': true,
    },
    city: {
      type: 'string',
      title: 'City',
      default: 'sh',
      'x-widget': 'select',
      'x-required': true,
    },
    firstName: {
      type: 'string',
      title: 'First Name',
      default: '',
      'x-row': 'name',
      'x-required': true,
      'x-maxLength': 50,
    },
    lastName: {
      type: 'string',
      title: 'Last Name',
      default: '',
      'x-row': 'name',
      'x-required': true,
      'x-maxLength': 50,
    },
    fullName: {
      type: 'string',
      title: 'Full Name (computed)',
      default: '',
      'x-disabled': true,
      'x-readonly': true,
      'x-maxLength': 100,
    },
    age: {
      type: 'integer',
      title: 'Age',
      default: '',
      'x-min': 0,
    },
    active: {
      type: 'boolean',
      title: 'Active',
      default: true,
    },
  },
}

// ── Linkage rules ──────────────────────────────────────────────────────

const linkageRules: Record<string, ReturnType<typeof from>> = {
  // Country → city options
  'city.options': from('country', (country: string) => {
    return cityOptionsByCountry[country] ?? []
  }),
  // Country → city default value (reset city when country changes)
  'city.value': from('country', (country: string) => {
    const cities = cityOptionsByCountry[country] ?? []
    return cities[0]?.value ?? ''
  }),
  // First + Last → Full Name
  'fullName.value': from(['firstName', 'lastName'], (first: string, last: string) => {
    if (!first && !last) return ''
    return `${first} ${last}`.trim()
  }),
}

// ── Shared layout helpers ──────────────────────────────────────────────

const FORM_CARD_STYLE = {
  maxWidth: '420px',
  width: '100%',
}

const RESULT_BLOCK_STYLE = { maxWidth: '420px', width: '100%' }

// ═══════════════════════════════════════════════════════════════════════
// Example 1: Declarative <HForm> — SFC / template convenience
// ═══════════════════════════════════════════════════════════════════════

const DeclarativeVueDemo = defineComponent({
  name: 'DeclarativeVueDemo',
  setup() {
    const formRef = ref<any>(null)
    const formDataDisplay = ref('{}')
    const submitMsg = ref('')
    const formId = 'vue-playground-form'

    function refreshFormData() {
      if (formRef.value) {
        try {
          formDataDisplay.value = JSON.stringify(formRef.value.getFormData(), null, 2)
        } catch {
          formDataDisplay.value = '{}'
        }
      }
    }

    function handleSubmit() {
      const ok = formRef.value?.submit()
      if (ok) {
        submitMsg.value = '✅ Form submitted successfully!'
      } else {
        submitMsg.value = '❌ Validation failed — check errors below each field.'
      }
    }

    onMounted(() => {
      nextTick(() => refreshFormData())
    })

    return () =>
      h(VueHVStack, { gap: 'lg' }, () => [
        h(VueHCard, { title: formSchema.title, style: FORM_CARD_STYLE }, () =>
          h(HForm, {
            ref: formRef,
            id: formId,
            schema: formSchema,
            rules: linkageRules,
            onChange: () => refreshFormData(),
          }),
        ),
        h(VueHStack, { gap: 'sm', align: 'center' }, () => [
          h(VueHButton, { onClick: handleSubmit }, () => 'Submit'),
          h('span', { style: { fontSize: '14px' } }, submitMsg.value),
        ]),
        h('div', { style: RESULT_BLOCK_STYLE }, [
          h('h4', { style: { margin: '0 0 8px' } }, 'Live Form Data'),
          h('pre', { class: 'ui-form__result' }, formDataDisplay.value),
        ]),
      ])
  },
})

// ── React demo (standalone, no meshflow) ──────────────────────────────

function ReactFormDemo() {
  const [country, setCountry] = useState('cn')
  const [city, setCity] = useState('sh')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [age, setAge] = useState('')
  const [active, setActive] = useState(true)

  const cities = cityOptionsByCountry[country] ?? []
  const fullName = `${firstName} ${lastName}`.trim()

  const formData = JSON.stringify(
    { country, city, firstName, lastName, fullName, age, active },
    null,
    2,
  )

  return (
    <div className="demo-stack" style={{ gap: 16 }}>
      <HCard title="User Profile" style={FORM_CARD_STYLE}>
        <HVStack gap="md">
          <HSelect
            label="Country"
            items={[
              { label: 'China', value: 'cn' },
              { label: 'USA', value: 'us' },
              { label: 'Japan', value: 'jp' },
            ]}
            value={country}
            onValueChange={d => {
              const nextCountry = String(d.value)
              setCountry(nextCountry)
              setCity(cityOptionsByCountry[nextCountry]?.[0]?.value ?? '')
            }}
          />

          <HSelect
            label="City"
            items={cities}
            value={city}
            onValueChange={d => setCity(String(d.value))}
          />

          <HStack gap="sm">
            <HInput
              label="First Name"
              value={firstName}
              onValueChange={d => setFirstName(String(d.value))}
            />
            <HInput
              label="Last Name"
              value={lastName}
              onValueChange={d => setLastName(String(d.value))}
            />
          </HStack>

          <HInput label="Full Name (computed)" value={fullName} disabled readOnly />

          <HNumberInput
            label="Age"
            value={age}
            min={0}
            onValueChange={d => setAge(String(d.value))}
          />

          <HCheckbox label="Active" checked={active} onCheckedChange={d => setActive(d.checked)} />
        </HVStack>
      </HCard>

      <div style={RESULT_BLOCK_STYLE}>
        <h4 style={{ margin: '0 0 8px' }}>Live Form Data</h4>
        <pre className="ui-form__result">{formData}</pre>
      </div>
    </div>
  )
}

// ── View ──────────────────────────────────────────────────────────────

export default function FormView() {
  const definition: ViewDefinition = {
    apiKey: undefined as any,
    title: 'Form',
    description:
      'Schema-driven form with DAG-based field linkage. Vue demo powered by @meshflow/form; React demo is standalone.',
    reactDemo: <ReactFormDemo />,
    vueDemo: DeclarativeVueDemo,
    webDemo: <HEmpty title="暂未实现" />,
    // examples: [
    //   {
    //     title: 'Declarative <HForm>',
    //     description:
    //       'Drop-in SFC — pass schema, rules, data as props. The component owns engine lifecycle, node map provision, UI schema generation, and initial-data hydration.',
    //     reactDemo: <ReactFormDemo />,
    //     vueDemo: DeclarativeVueDemo,
    //     webDemo: <HEmpty title="暂未实现" />,
    //   },
    // ],
    api: {
      contract: 'MeshFormSchema',
      contractFile: 'packages/vue/src/form/useMeshFormJson.ts',
      props: [
        { name: 'schema', type: 'MeshFormSchema', description: 'JSON Schema describing all fields' },
        { name: 'data', type: 'Record<string, any>', description: 'Initial form values (flat key-value)' },
        { name: 'rules', type: 'Record<string, FromDescriptor>', description: 'Linkage rules via from()' },
        { name: 'uischema', type: 'UISchemaElement', description: 'Optional UI schema override' },
        { name: 'renderers', type: 'JsonFormsRendererRegistryEntry[]', description: 'Additional custom renderers' },
        { name: 'useGreedy', type: 'boolean', defaultValue: 'false', description: 'Greedy DAG scheduling' },
      ],
      events: [
        { name: 'change', type: 'Record<string, any>', description: 'Emitted after any field change + DAG propagation' },
        { name: 'submit', type: 'Record<string, any>', description: 'Emitted on form submission' },
      ],
      notes: [
        'Powered by @meshflow/form (DAG engine) + direct uiSchema tree rendering.',
        'from("source.path", logic) creates descriptive linkage rules.',
        'Custom renderers use our headless-ui components (HInput, HSelect, etc.).',
        'Use <HForm> for declarative templates with full engine lifecycle management.',
      ],
    },
  }
  return <ComponentPage {...definition} />
}
