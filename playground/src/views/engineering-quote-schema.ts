/**
 * Engineering Quote Form — Schema, Rules & Entangle Configuration
 *
 * Faithfully replicates the meshform-vue engineering-quote demo:
 *   https://github.com/Nzy19940403/meshform-vue/blob/master/.vitepress/components/EngineeringQuoteForm.vue
 *
 *   9 sections · 53 nodes · 42 DAG rules · 4 entangle configs (2 bidirectional pairs)
 */

import type { MeshFormSchema } from '@demo/ui-vue'
import { from } from '@demo/ui-vue'

// ═══════════════════════════════════════════════════════════════════════════
// Lookup tables (match reference exactly)
// ═══════════════════════════════════════════════════════════════════════════

const TYPE_RATES: Record<string, { pm: number; dev: number; qa: number; mgmt: number; risk: number }> = {
  software:    { pm: 1200, dev: 1500, qa: 800,  mgmt: 0.12, risk: 0.10 },
  integration: { pm: 1000, dev: 1200, qa: 700,  mgmt: 0.15, risk: 0.12 },
  consulting:  { pm: 2000, dev: 1600, qa: 900,  mgmt: 0.10, risk: 0.08 },
  maintenance: { pm: 800,  dev: 1000, qa: 600,  mgmt: 0.08, risk: 0.06 },
}

const INDUSTRY_TAX: Record<string, number> = {
  finance: 6,
  manufacturing: 13,
  government: 9,
  retail: 13,
  healthcare: 9,
}

// ═══════════════════════════════════════════════════════════════════════════
// JSON Schema
// ═══════════════════════════════════════════════════════════════════════════

export const engineeringQuoteSchema: MeshFormSchema = {
  type: 'object',
  title: '工程报价单',
  properties: {

    // ── Section 1: 项目基础信息 ─────────────────────────────────────────
    project: {
      type: 'object',
      title: '📋 项目基础信息',
      properties: {
        projectType: {
          type: 'string', title: '项目类型', default: 'software',
          'x-widget': 'select', 'x-row': 'info', 'x-span': 2,
          'x-options': [
            { label: '软件开发 (PM 1200 / Dev 1500 / QA 800)', value: 'software' },
            { label: '系统集成 (PM 1000 / Dev 1200 / QA 700)', value: 'integration' },
            { label: '技术咨询 (PM 2000 / Dev 1600 / QA 900)', value: 'consulting' },
            { label: '运维服务 (PM 800 / Dev 1000 / QA 600)', value: 'maintenance' },
          ],
        },
        clientIndustry: {
          type: 'string', title: '客户行业', default: 'finance',
          'x-widget': 'select', 'x-row': 'info', 'x-span': 2,
          'x-options': [
            { label: '金融业 (VAT 6%)', value: 'finance' },
            { label: '制造业 (VAT 13%)', value: 'manufacturing' },
            { label: '政府机构 (VAT 9%)', value: 'government' },
            { label: '零售业 (VAT 13%)', value: 'retail' },
            { label: '医疗健康 (VAT 9%)', value: 'healthcare' },
          ],
        },
        pmRate:   { type: 'number', title: 'PM 人天单价 (¥)', default: 1200, 'x-readonly': true, 'x-disabled': true, 'x-row': 'rates' },
        devRate:  { type: 'number', title: 'Dev 人天单价 (¥)', default: 1500, 'x-readonly': true, 'x-disabled': true, 'x-row': 'rates' },
        qaRate:   { type: 'number', title: 'QA 人天单价 (¥)', default: 800,  'x-readonly': true, 'x-disabled': true, 'x-row': 'rates' },
        mgmtRate: { type: 'number', title: '管理费率 (%)', default: 12,       'x-readonly': true, 'x-disabled': true, 'x-row': 'rates' },
        riskRate: { type: 'number', title: '风险准备金率 (%)', default: 10,   'x-readonly': true, 'x-disabled': true, 'x-row': 'rates' },
        taxRate:  { type: 'number', title: '增值税率 (%)', default: 6,        'x-readonly': true, 'x-disabled': true, 'x-row': 'rates' },
      },
    },

    // ── Section 2: WBS 工作分解结构 ─────────────────────────────────────
    wbs: {
      type: 'object',
      title: '📐 WBS 工作分解结构',
      properties: {
        // Phase 1
        pm1:   { type: 'integer', title: 'PM (需求分析)', default: 5,  'x-min': 0, 'x-row': 'phase1' },
        dev1:  { type: 'integer', title: 'Dev (需求分析)', default: 5,  'x-min': 0, 'x-row': 'phase1' },
        qa1:   { type: 'integer', title: 'QA (需求分析)', default: 3,  'x-min': 0, 'x-row': 'phase1' },
        phase1Days: { type: 'integer', title: '阶段一 人天合计', default: 13,    'x-readonly': true, 'x-disabled': true, 'x-row': 'phase1' },
        phase1Cost: { type: 'number',  title: '阶段一 人力成本 (¥)', default: 15900, 'x-readonly': true, 'x-disabled': true, 'x-row': 'phase1' },
        // Phase 2
        pm2:   { type: 'integer', title: 'PM (系统设计)', default: 8,  'x-min': 0, 'x-row': 'phase2' },
        dev2:  { type: 'integer', title: 'Dev (系统设计)', default: 12, 'x-min': 0, 'x-row': 'phase2' },
        qa2:   { type: 'integer', title: 'QA (系统设计)', default: 5,  'x-min': 0, 'x-row': 'phase2' },
        phase2Days: { type: 'integer', title: '阶段二 人天合计', default: 25,    'x-readonly': true, 'x-disabled': true, 'x-row': 'phase2' },
        phase2Cost: { type: 'number',  title: '阶段二 人力成本 (¥)', default: 31600, 'x-readonly': true, 'x-disabled': true, 'x-row': 'phase2' },
        // Phase 3
        pm3:   { type: 'integer', title: 'PM (开发实施)', default: 10, 'x-min': 0, 'x-row': 'phase3' },
        dev3:  { type: 'integer', title: 'Dev (开发实施)', default: 40, 'x-min': 0, 'x-row': 'phase3' },
        qa3:   { type: 'integer', title: 'QA (开发实施)', default: 20, 'x-min': 0, 'x-row': 'phase3' },
        phase3Days: { type: 'integer', title: '阶段三 人天合计', default: 70,    'x-readonly': true, 'x-disabled': true, 'x-row': 'phase3' },
        phase3Cost: { type: 'number',  title: '阶段三 人力成本 (¥)', default: 88000, 'x-readonly': true, 'x-disabled': true, 'x-row': 'phase3' },
        // Summary
        totalPersonDays: { type: 'integer', title: '总人天', default: 108, 'x-readonly': true, 'x-disabled': true, 'x-span': 5 },
      },
    },

    // ── Section 3: 成本汇总 ─────────────────────────────────────────────
    costs: {
      type: 'object',
      title: '💰 成本汇总',
      properties: {
        laborCost:     { type: 'number', title: '人力成本合计 (¥)', default: 135500, 'x-readonly': true, 'x-disabled': true, 'x-row': 'costs-1' },
        managementFee: { type: 'number', title: '管理费 (¥)', default: 16260,       'x-readonly': true, 'x-disabled': true, 'x-row': 'costs-1' },
        hardwareCost:  { type: 'number', title: '硬件成本 (¥)', default: 20000,      'x-min': 0, 'x-step': 1000, 'x-row': 'costs-1' },
        travelCost:    { type: 'number', title: '差旅费 (¥)', default: 8000,         'x-min': 0, 'x-step': 1000, 'x-row': 'costs-1' },
        riskBuffer:    { type: 'number', title: '风险准备金 (¥)', default: 17976,    'x-readonly': true, 'x-disabled': true, 'x-row': 'costs-2' },
        totalCost:     { type: 'number', title: '项目总成本 (¥)', default: 197736,   'x-readonly': true, 'x-disabled': true, 'x-row': 'costs-2', 'x-span': 3 },
      },
    },

    // ── Section 4: 报价计算 ─────────────────────────────────────────────
    pricing: {
      type: 'object',
      title: '📊 报价计算',
      properties: {
        marginRate:     { type: 'number', title: '⟳ 利润率 (%)', default: 20, 'x-min': 0, 'x-max': 100, 'x-step': 0.5, 'x-row': 'pricing-1' },
        suggestedQuote: { type: 'number', title: '建议报价 (¥)', default: 237283, 'x-readonly': true, 'x-disabled': true, 'x-row': 'pricing-1' },
        quotePrice:     { type: 'number', title: '⟳ 最终报价 (¥)', default: 237283, 'x-min': 0, 'x-step': 1000, 'x-row': 'pricing-1' },
        marginAmount:   { type: 'number', title: '利润额 (¥)', default: 39547,     'x-readonly': true, 'x-disabled': true, 'x-row': 'pricing-1' },
        taxRate:        { type: 'number', title: '增值税率 (%)', default: 6,       'x-readonly': true, 'x-disabled': true, 'x-row': 'pricing-2' },
        taxAmount:      { type: 'number', title: '增值税额 (¥)', default: 14237,   'x-readonly': true, 'x-disabled': true, 'x-row': 'pricing-2' },
        totalWithTax:   { type: 'number', title: '含税总价 (¥)', default: 251520,  'x-readonly': true, 'x-disabled': true, 'x-row': 'pricing-2', 'x-span': 2 },
      },
    },

    // ── Section 5: 资源规划 ─────────────────────────────────────────────
    resource: {
      type: 'object',
      title: '👥 资源规划',
      properties: {
        efficiency:    { type: 'number', title: '并行效率系数', default: 0.8, 'x-widget': 'select', 'x-row': 'res-1',
          'x-options': [{ label: '0.7 (低)', value: 0.7 }, { label: '0.8 (中)', value: 0.8 }, { label: '0.9 (高)', value: 0.9 }] },
        duration:      { type: 'integer', title: '⟳ 项目工期 (天)', default: 90,  'x-min': 10, 'x-max': 730, 'x-row': 'res-1' },
        teamSize:      { type: 'integer', title: '⟳ 团队规模 (人)', default: 2,   'x-min': 1,  'x-max': 50,  'x-row': 'res-1' },
        dailyRevenue:  { type: 'number',  title: '日均产值 (¥/天)', default: 2636, 'x-readonly': true, 'x-disabled': true, 'x-row': 'res-1' },
        personDayRate: { type: 'number',  title: '人天单价 (¥/人天)', default: 2197,'x-readonly': true, 'x-disabled': true, 'x-row': 'res-1' },
      },
    },

    // ── Section 6: 付款方案 ─────────────────────────────────────────────
    payment: {
      type: 'object',
      title: '💳 付款方案',
      properties: {
        depositRate:   { type: 'integer', title: '首付比例', default: 30, 'x-widget': 'select', 'x-row': 'pay-1',
          'x-options': [{ label: '20%', value: 20 }, { label: '30%', value: 30 }, { label: '40%', value: 40 }, { label: '50%', value: 50 }] },
        depositAmount: { type: 'number', title: '签约首付款 (¥)', default: 75456,  'x-readonly': true, 'x-disabled': true, 'x-row': 'pay-1' },
        milestone:     { type: 'number', title: '里程碑付款 (¥)', default: 100608, 'x-readonly': true, 'x-disabled': true, 'x-row': 'pay-1' },
        finalPayment:  { type: 'number', title: '验收尾款 (¥)', default: 75456,   'x-readonly': true, 'x-disabled': true, 'x-row': 'pay-1' },
      },
    },

    // ── Section 7: 风险预警 ─────────────────────────────────────────────
    warnings: {
      type: 'object',
      title: '⚠️ 风险预警',
      properties: {
        lowMargin:     { type: 'string', title: '利润率风险',     default: '⚠️ 当前利润率 < 15%，项目收益偏低，建议调整报价。',                                  'x-readonly': true, 'x-disabled': true, 'x-hidden': true },
        understaff:    { type: 'string', title: '人员不足风险',   default: '⚠️ 当前团队规模不足以在规定工期内完成所有任务，建议增加人员或延长工期。',                   'x-readonly': true, 'x-disabled': true, 'x-hidden': true },
        tightSchedule: { type: 'string', title: '工期紧张风险',   default: '⚠️ 当前工期紧张，人天需求超出合理范围，请检查排期是否合理。',                               'x-readonly': true, 'x-disabled': true, 'x-hidden': true },
      },
    },
  },
}

// ═══════════════════════════════════════════════════════════════════════════
// DAG Linkage Rules — 42 rules matching the reference exactly
// ═══════════════════════════════════════════════════════════════════════════

export const engineeringQuoteRules: Record<string, ReturnType<typeof from>> = {

  // ── Rule Set ①: Project type → rates (6 rules) ───────────────────────

  'project.pmRate':   from('project.projectType', (t: string) => TYPE_RATES[t]?.pm ?? 1200),
  'project.devRate':  from('project.projectType', (t: string) => TYPE_RATES[t]?.dev ?? 1500),
  'project.qaRate':   from('project.projectType', (t: string) => TYPE_RATES[t]?.qa ?? 800),
  'project.mgmtRate': from('project.projectType', (t: string) => (TYPE_RATES[t]?.mgmt ?? 0.12) * 100),
  'project.riskRate': from('project.projectType', (t: string) => (TYPE_RATES[t]?.risk ?? 0.10) * 100),

  // clientIndustry → taxRate
  'project.taxRate': from('project.clientIndustry', (i: string) => INDUSTRY_TAX[i] ?? 6),

  // ── Rule Set ②: WBS phase person-days (3 rules) ──────────────────────

  'wbs.phase1Days': from(['wbs.pm1', 'wbs.dev1', 'wbs.qa1'], (pm: number, dev: number, qa: number) => (pm || 0) + (dev || 0) + (qa || 0)),
  'wbs.phase2Days': from(['wbs.pm2', 'wbs.dev2', 'wbs.qa2'], (pm: number, dev: number, qa: number) => (pm || 0) + (dev || 0) + (qa || 0)),
  'wbs.phase3Days': from(['wbs.pm3', 'wbs.dev3', 'wbs.qa3'], (pm: number, dev: number, qa: number) => (pm || 0) + (dev || 0) + (qa || 0)),

  // ── Rule Set ③: WBS phase labor cost (3 rules) ───────────────────────

  'wbs.phase1Cost': from(
    ['wbs.pm1', 'wbs.dev1', 'wbs.qa1', 'project.pmRate', 'project.devRate', 'project.qaRate'],
    (pm: number, dev: number, qa: number, pmR: number, devR: number, qaR: number) =>
      (pm || 0) * (pmR || 0) + (dev || 0) * (devR || 0) + (qa || 0) * (qaR || 0),
  ),
  'wbs.phase2Cost': from(
    ['wbs.pm2', 'wbs.dev2', 'wbs.qa2', 'project.pmRate', 'project.devRate', 'project.qaRate'],
    (pm: number, dev: number, qa: number, pmR: number, devR: number, qaR: number) =>
      (pm || 0) * (pmR || 0) + (dev || 0) * (devR || 0) + (qa || 0) * (qaR || 0),
  ),
  'wbs.phase3Cost': from(
    ['wbs.pm3', 'wbs.dev3', 'wbs.qa3', 'project.pmRate', 'project.devRate', 'project.qaRate'],
    (pm: number, dev: number, qa: number, pmR: number, devR: number, qaR: number) =>
      (pm || 0) * (pmR || 0) + (dev || 0) * (devR || 0) + (qa || 0) * (qaR || 0),
  ),

  // ── Rule Set ④: Total person-days (1 rule) ───────────────────────────

  'wbs.totalPersonDays': from(
    ['wbs.phase1Days', 'wbs.phase2Days', 'wbs.phase3Days'],
    (p1: number, p2: number, p3: number) => (p1 || 0) + (p2 || 0) + (p3 || 0),
  ),

  // ── Rule Set ⑤: Cost summary (4 rules) ───────────────────────────────

  'costs.laborCost': from(
    ['wbs.phase1Cost', 'wbs.phase2Cost', 'wbs.phase3Cost'],
    (p1: number, p2: number, p3: number) => (p1 || 0) + (p2 || 0) + (p3 || 0),
  ),
  'costs.managementFee': from(
    ['costs.laborCost', 'project.mgmtRate'],
    (labor: number, rate: number) => Math.round((labor || 0) * (rate || 0) / 100),
  ),
  'costs.riskBuffer': from(
    ['costs.laborCost', 'costs.managementFee', 'costs.hardwareCost', 'costs.travelCost', 'project.riskRate'],
    (labor: number, mgmt: number, hw: number, travel: number, rate: number) =>
      Math.round(((labor || 0) + (mgmt || 0) + (hw || 0) + (travel || 0)) * (rate || 0) / 100),
  ),
  'costs.totalCost': from(
    ['costs.laborCost', 'costs.managementFee', 'costs.hardwareCost', 'costs.travelCost', 'costs.riskBuffer'],
    (labor: number, mgmt: number, hw: number, travel: number, risk: number) =>
      (labor || 0) + (mgmt || 0) + (hw || 0) + (travel || 0) + (risk || 0),
  ),

  // ── Rule Set ⑥: Pricing DAG (5 rules) ────────────────────────────────

  'pricing.suggestedQuote': from(
    ['costs.totalCost', 'pricing.marginRate'],
    (tc: number, mr: number) => Math.round((tc || 0) * (1 + (mr || 0) / 100)),
  ),
  'pricing.taxRate': from('project.taxRate', (r: number) => r),
  'pricing.taxAmount': from(
    ['pricing.quotePrice', 'pricing.taxRate'],
    (quote: number, rate: number) => Math.round((quote || 0) * (rate || 0) / 100),
  ),
  'pricing.totalWithTax': from(
    ['pricing.quotePrice', 'pricing.taxAmount'],
    (quote: number, tax: number) => (quote || 0) + (tax || 0),
  ),
  'pricing.marginAmount': from(
    ['pricing.quotePrice', 'costs.totalCost'],
    (quote: number, tc: number) => (quote || 0) - (tc || 0),
  ),

  // ── Rule Set ⑦: Resource planning (2 rules) ──────────────────────────

  'resource.dailyRevenue': from(
    ['pricing.quotePrice', 'resource.duration'],
    (quote: number, dur: number) => dur > 0 ? Math.round((quote || 0) / dur) : 0,
  ),
  'resource.personDayRate': from(
    ['pricing.quotePrice', 'wbs.totalPersonDays'],
    (quote: number, pd: number) => pd > 0 ? Math.round((quote || 0) / pd) : 0,
  ),

  // ── Rule Set ⑧: Payment plan (3 rules) ───────────────────────────────

  'payment.depositAmount': from(
    ['pricing.totalWithTax', 'payment.depositRate'],
    (total: number, rate: number) => Math.round((total || 0) * (rate || 0) / 100),
  ),
  'payment.milestone': from(
    ['pricing.totalWithTax'],
    (total: number) => Math.round((total || 0) * 0.40),
  ),
  'payment.finalPayment': from(
    ['pricing.totalWithTax', 'payment.depositAmount', 'payment.milestone'],
    (total: number, deposit: number, mid: number) =>
      Math.max(0, (total || 0) - (deposit || 0) - (mid || 0)),
  ),

  // ── Rule Set ⑨: Warning visibility (3 rules — drive `hidden` property) ─

  'warnings.lowMargin.hidden': from(
    ['pricing.marginRate'],
    (mr: number) => (mr || 0) >= 15,
  ),
  'warnings.understaff.hidden': from(
    ['wbs.totalPersonDays', 'resource.duration', 'resource.teamSize', 'resource.efficiency'],
    (pd: number, dur: number, team: number, eff: number) => {
      if (!dur || !team || !eff || dur <= 0 || team <= 0 || eff <= 0) return true
      const needed = Math.ceil((pd || 0) / dur / eff)
      return team >= needed
    },
  ),
  'warnings.tightSchedule.hidden': from(
    ['wbs.totalPersonDays', 'resource.duration', 'resource.teamSize'],
    (pd: number, dur: number, team: number) => {
      if (!dur || !team || dur <= 0 || team <= 0) return true
      return (pd || 0) / dur / team <= 1.2
    },
  ),
}

// ═══════════════════════════════════════════════════════════════════════════
// Entangle Pairs — factory functions matching the reference exactly
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Entangle ①: marginRate ↔ quotePrice
 *
 * `propose.set(key, val)` — key is the PROPERTY key on the impact node
 * (not a node path). The impact node is already specified in the entangle
 * config's `impact` field.
 */
export function createEntangleQuote(_getFormData: () => Record<string, any>) {
  return {
    paths: ['pricing.marginRate', 'pricing.quotePrice'],
    via: 'value',
    emit(cause: any, _impact: any, propose: any) {
      const data = _getFormData()
      const totalCost = Number(data?.costs?.totalCost ?? 0)
      if (!totalCost || totalCost <= 0) return

      if (cause.path === 'pricing.marginRate') {
        // marginRate changed → compute quotePrice
        const mr = Number(cause.state ?? 0)
        const newQuote = Math.round(totalCost * (1 + mr / 100))
        propose.set('value', newQuote)
      } else {
        // quotePrice changed → reverse-compute marginRate
        const quote = Number(cause.state ?? 0)
        const newMargin = Math.round((quote / totalCost - 1) * 100 * 10) / 10
        propose.set('value', Math.max(0, newMargin))
      }
    },
  }
}

/**
 * Entangle ②: duration ↔ teamSize
 */
export function createEntangleResource(_getFormData: () => Record<string, any>) {
  return {
    paths: ['resource.duration', 'resource.teamSize'],
    via: 'value',
    emit(cause: any, _impact: any, propose: any) {
      const data = _getFormData()
      const totalPersonDays = Number(data?.wbs?.totalPersonDays ?? 0)
      const efficiency = Number(data?.resource?.efficiency ?? 0.8)
      if (!totalPersonDays || totalPersonDays <= 0) return

      if (cause.path === 'resource.duration') {
        // duration changed → compute teamSize
        const dur = Number(cause.state ?? 1)
        if (dur <= 0) return
        const size = Math.ceil(totalPersonDays / dur / efficiency)
        propose.set('value', size)
      } else {
        // teamSize changed → compute duration
        const size = Number(cause.state ?? 1)
        if (size <= 0) return
        const dur = Math.ceil(totalPersonDays / size / efficiency)
        propose.set('value', dur)
      }
    },
  }
}
