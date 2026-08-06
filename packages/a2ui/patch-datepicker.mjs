import { readFileSync, writeFileSync } from 'fs'
const file = new URL('./measure-verify.jsonl', import.meta.url)
const lines = readFileSync(file, 'utf8').split('\n').filter(Boolean)
const msgs = lines.map(l => JSON.parse(l))
const comps = msgs[1].updateComponents.components

const start = comps.find(c => c.id === 'f-date-start')
if (start) {
  start.component = 'DatePicker'
  start.value = start.value ?? '2026-07-04'
  delete start.placeholder
}

const end = comps.find(c => c.id === 'f-date-end')
if (end) {
  end.component = 'DatePicker'
  end.value = end.value ?? '2026-08-02'
}

writeFileSync(file, msgs.map(m => JSON.stringify(m)).join('\n') + '\n', 'utf8')
console.log('f-date-start:', JSON.stringify(start))
console.log('f-date-end:', JSON.stringify(end))
