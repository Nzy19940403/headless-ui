import { defineComponent, h } from 'vue'
import {
  HCard,
  HContainer,
  HGrid,
  HSplit,
  HSpacer,
  HStack,
  HVStack,
  HTag,
} from '@demo/ui-react'
import {
  HCard as VueHCard,
  HContainer as VueHContainer,
  HGrid as VueHGrid,
  HSplit as VueHSplit,
  HSpacer as VueHSpacer,
  HStack as VueHStack,
  HVStack as VueHVStack,
  HTag as VueHTag,
} from '@demo/ui-vue'
import { mountWc } from '../wc-mount'
import { ComponentPage } from './ComponentPage'
import type { ViewDefinition } from './types'

function DemoBox({ label, tall }: { label: string; tall?: boolean }) {
  return (
    <div className={`layout-demo-box${tall ? ' layout-demo-box--tall' : ''}`}>{label}</div>
  )
}

function ReactLayoutDemo() {
  return (
    <HVStack gap="xl" className="layout-demo">
      <section className="layout-demo-section">
        <h3 className="layout-demo-title">HContainer</h3>
        <p className="layout-demo-hint">size=&quot;lg&quot; · padded · center</p>
        <HContainer size="lg" className="layout-demo-container">
          <DemoBox label="Contained content (max-width lg)" />
        </HContainer>
      </section>

      <section className="layout-demo-section">
        <h3 className="layout-demo-title">HStack + HSpacer</h3>
        <p className="layout-demo-hint">gap=&quot;sm&quot; · align=&quot;center&quot; · justify with spacer grow</p>
        <HStack gap="sm" align="center" className="layout-demo-surface">
          <HTag tone="info">Logo</HTag>
          <HTag tone="neutral">Nav</HTag>
          <HSpacer />
          <HTag tone="success">User</HTag>
        </HStack>
      </section>

      <section className="layout-demo-section">
        <h3 className="layout-demo-title">HVStack</h3>
        <p className="layout-demo-hint">gap=&quot;sm md:lg&quot; (responsive gap)</p>
        <HVStack gap="sm md:lg" className="layout-demo-surface">
          <DemoBox label="Row A" />
          <DemoBox label="Row B" />
          <DemoBox label="Row C" />
        </HVStack>
      </section>

      <section className="layout-demo-section">
        <h3 className="layout-demo-title">HGrid</h3>
        <p className="layout-demo-hint">
          columns=&quot;1 md:2 lg:4&quot; · gap=&quot;sm md:md&quot; — resize the window
        </p>
        <HGrid columns="1 md:2 lg:4" gap="sm md:md">
          {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map(id => (
            <HCard key={id} className="layout-demo-card">
              <strong>Cell {id}</strong>
              <span className="layout-demo-muted">auto reflow</span>
            </HCard>
          ))}
        </HGrid>
      </section>

      <section className="layout-demo-section">
        <h3 className="layout-demo-title">HSplit</h3>
        <p className="layout-demo-hint">
          ratio=&quot;2:1&quot; · collapseBelow=&quot;md&quot; — stacks below md
        </p>
        <HSplit ratio="2:1" collapseBelow="md" gap="md">
          <div className="layout-demo-surface layout-demo-panel">
            <strong>Main</strong>
            <p className="layout-demo-muted">Primary region (2fr)</p>
          </div>
          <div className="layout-demo-surface layout-demo-panel">
            <strong>Side</strong>
            <p className="layout-demo-muted">Secondary (1fr)</p>
          </div>
        </HSplit>
      </section>

      <section className="layout-demo-section">
        <h3 className="layout-demo-title">HSplit sidebar-left</h3>
        <p className="layout-demo-hint">ratio=&quot;sidebar-left&quot; · sidebarWidth=&quot;200px&quot;</p>
        <HSplit ratio="sidebar-left" sidebarWidth="200px" collapseBelow="lg" gap="md">
          <div className="layout-demo-surface layout-demo-panel">
            <strong>Sidebar</strong>
          </div>
          <div className="layout-demo-surface layout-demo-panel">
            <strong>Content</strong>
            <p className="layout-demo-muted">minmax(0, 1fr)</p>
          </div>
        </HSplit>
      </section>
    </HVStack>
  )
}

function vueBox(label: string) {
  return h('div', { class: 'layout-demo-box' }, label)
}

const VueLayoutDemo = defineComponent({
  name: 'VueLayoutDemo',
  setup: () => () =>
    h(VueHVStack, { gap: 'xl', class: 'layout-demo' }, () => [
      h('section', { class: 'layout-demo-section' }, [
        h('h3', { class: 'layout-demo-title' }, 'HContainer'),
        h(VueHContainer, { size: 'lg', class: 'layout-demo-container' }, () =>
          vueBox('Contained content (max-width lg)'),
        ),
      ]),
      h('section', { class: 'layout-demo-section' }, [
        h('h3', { class: 'layout-demo-title' }, 'HStack + HSpacer'),
        h(VueHStack, { gap: 'sm', align: 'center', class: 'layout-demo-surface' }, () => [
          h(VueHTag, { tone: 'info' }, () => 'Logo'),
          h(VueHTag, { tone: 'neutral' }, () => 'Nav'),
          h(VueHSpacer),
          h(VueHTag, { tone: 'success' }, () => 'User'),
        ]),
      ]),
      h('section', { class: 'layout-demo-section' }, [
        h('h3', { class: 'layout-demo-title' }, 'HGrid'),
        h('p', { class: 'layout-demo-hint' }, 'columns="1 md:2 lg:4"'),
        h(VueHGrid, { columns: '1 md:2 lg:4', gap: 'sm md:md' }, () =>
          ['A', 'B', 'C', 'D'].map(id =>
            h(VueHCard, { class: 'layout-demo-card', key: id }, () => [
              h('strong', `Cell ${id}`),
              h('span', { class: 'layout-demo-muted' }, 'auto reflow'),
            ]),
          ),
        ),
      ]),
      h('section', { class: 'layout-demo-section' }, [
        h('h3', { class: 'layout-demo-title' }, 'HSplit'),
        h(VueHSplit, { ratio: '2:1', collapseBelow: 'md', gap: 'md' }, () => [
          h('div', { class: 'layout-demo-surface layout-demo-panel' }, [
            h('strong', 'Main'),
            h('p', { class: 'layout-demo-muted' }, 'Primary (2fr)'),
          ]),
          h('div', { class: 'layout-demo-surface layout-demo-panel' }, [
            h('strong', 'Side'),
            h('p', { class: 'layout-demo-muted' }, 'Secondary (1fr)'),
          ]),
        ]),
      ]),
    ]),
})

function LayoutWebDemo() {
  return (
    <div
      className="layout-demo"
      ref={root => {
        mountWc(
          root,
          `<h-v-stack gap="xl" class="layout-demo">
            <section class="layout-demo-section">
              <h3 class="layout-demo-title">h-container</h3>
              <h-container size="lg" class="layout-demo-container">
                <div class="layout-demo-box">Contained content (max-width lg)</div>
              </h-container>
            </section>
            <section class="layout-demo-section">
              <h3 class="layout-demo-title">h-stack + h-spacer</h3>
              <h-stack gap="sm" align="center" class="layout-demo-surface">
                <h-tag tone="info">Logo</h-tag>
                <h-tag tone="neutral">Nav</h-tag>
                <h-spacer></h-spacer>
                <h-tag tone="success">User</h-tag>
              </h-stack>
            </section>
            <section class="layout-demo-section">
              <h3 class="layout-demo-title">h-grid</h3>
              <p class="layout-demo-hint">columns="1 md:2 lg:4"</p>
              <h-grid columns="1 md:2 lg:4" gap="sm md:md">
                <div class="layout-demo-box">A</div>
                <div class="layout-demo-box">B</div>
                <div class="layout-demo-box">C</div>
                <div class="layout-demo-box">D</div>
                <div class="layout-demo-box">E</div>
                <div class="layout-demo-box">F</div>
                <div class="layout-demo-box">G</div>
                <div class="layout-demo-box">H</div>
              </h-grid>
            </section>
            <section class="layout-demo-section">
              <h3 class="layout-demo-title">h-split</h3>
              <h-split ratio="2:1" collapse-below="md" gap="md">
                <div class="layout-demo-surface layout-demo-panel"><strong>Main</strong><p class="layout-demo-muted">2fr</p></div>
                <div class="layout-demo-surface layout-demo-panel"><strong>Side</strong><p class="layout-demo-muted">1fr</p></div>
              </h-split>
            </section>
          </h-v-stack>`,
        )
      }}
    />
  )
}

export default function LayoutView() {
  const definition: ViewDefinition = {
    apiKey: 'layout',
    title: 'Layout',
    description:
      'CSS layout primitives (Container / Stack / VStack / Grid / Split / Spacer). Responsive via string grammar — no Ark, no resize JS. Try resizing for Grid & Split.',
    reactDemo: <ReactLayoutDemo />,
    vueDemo: VueLayoutDemo,
    webDemo: <LayoutWebDemo />,
  }
  return <ComponentPage {...definition} />
}
