/**
 * Engineering Quote — Complex Form Showcase
 *
 * Replicates the meshform-vue engineering-quote demo:
 *   7 sections · ~46 nodes · 30 DAG rules · 2 entangle pairs
 *
 * Demonstrates the full HForm architecture at scale:
 *   - Nested JSON Schema → meshflow uiSchema tree
 *   - DAG-based cross-section field linkage (from / define)
 *   - Entangle syntax sugar (bidirectional proposal-converge)
 *   - x-row layout grouping
 *   - JSON Schema annotation validators (x-required, x-min, x-maxLength)
 */
import { useEffect, useRef, useState } from 'react'
import { createApp, defineComponent, h, ref, onMounted, nextTick } from 'vue'
import { HForm, HDrawer, HButton as VueHButton } from '@demo/ui-vue'
import {
  engineeringQuoteSchema,
  engineeringQuoteRules,
  createEntangleQuote,
  createEntangleResource,
} from './engineering-quote-schema'

const EngineeringQuoteForm = defineComponent({
  name: 'EngineeringQuoteForm',
  setup() {
    const formRef = ref<any>(null)
    const formDataDisplay = ref('{}')
    const drawerOpen = ref(false)
    const submitMsg = ref('')
    const formId = 'vue-eng-quote-showcase'

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
        submitMsg.value = '✅ 报价单提交成功！'
      } else {
        submitMsg.value = '❌ 验证失败 — 请检查标红字段。'
      }
    }

    onMounted(() => {
      nextTick(() => {
        if (formRef.value) {
          const getFormData = () => formRef.value?.getFormData() ?? {}
          formRef.value.entangle(createEntangleQuote(getFormData))
          formRef.value.entangle(createEntangleResource(getFormData))
        }
        refreshFormData()
      })
    })

    return () =>
      h('div', { style: { maxWidth: '800px', margin: '0 auto', padding: '24px 0' } }, [
        h(HForm, {
          ref: formRef,
          id: formId,
          schema: engineeringQuoteSchema,
          rules: engineeringQuoteRules,
          onChange: () => refreshFormData(),
        }),
        h('div', { style: { marginTop: '20px', display: 'flex', gap: '12px', alignItems: 'center' } }, [
          h(VueHButton, { onClick: handleSubmit }, () => '提交报价单'),
          h('span', { style: { fontSize: '14px', fontWeight: 500 } }, submitMsg.value),
        ]),

        // -- Drawer: floating trigger on right edge; opens live data panel --
        h(HDrawer, {
          title: '📊 Live Form Data',
          trigger: '📊',
          floatingTrigger: true,
          size: '420px',
          open: drawerOpen.value,
          'onOpen-change': (d: { open: boolean }) => { drawerOpen.value = d.open },
        }, {
          default: () =>
            h('pre', {
              style: {
                fontSize: '12px',
                lineHeight: 1.5,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
                margin: 0,
                padding: '16px',
              },
            }, formDataDisplay.value),
        }),
      ])
  },
})

function VueMount({ component }: { component: ReturnType<typeof defineComponent> }) {
  const host = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!host.current) return
    const app = createApp(component)
    app.config.errorHandler = (err) => {
      console.error('[Vue error handler]', err)
    }
    app.mount(host.current)
    return () => app.unmount()
  }, [component])
  return <div ref={host} />
}

export default function EngineeringQuoteView() {
  return (
    <div style={{ padding: '0 24px 48px' }}>
      <div style={{ marginBottom: '24px' }}>
        <p style={{ margin: 0, fontSize: '13px', color: 'var(--ui-color-text-secondary, #6b7280)' }}>
          SHOWCASE / ENGINEERING QUOTE
        </p>
        <h1 style={{ margin: '4px 0 8px', fontSize: '28px', fontWeight: 700 }}>工程报价单</h1>
        <p style={{ margin: 0, fontSize: '14px', color: 'var(--ui-color-text-secondary, #6b7280)', maxWidth: '720px' }}>
          7 个分组 · ~46 个节点 · 30 条 DAG 联动规则 · 2 对双向纠缠 (Entangle)。
          切换项目类型联动费率、填写人天自动汇总成本、利润率与报价双向联动、工期与团队规模双向换算——
          全部由 @meshflow/form 的 DAG 引擎 + 幽灵提案机制驱动，无需手写联动逻辑。
        </p>
      </div>
      <VueMount component={EngineeringQuoteForm} />
    </div>
  )
}
