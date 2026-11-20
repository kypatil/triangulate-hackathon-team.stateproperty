const DOW = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 }
const pad = n => String(n).padStart(2, '0')
export const fmtDate = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const toMin = hm => { const [h, m] = hm.split(':').map(Number); return h * 60 + m }
const toHM = min => `${pad(Math.floor(min / 60))}:${pad(min % 60)}`
const norm = s => String(s).toLowerCase().replace(/\s+/g, ' ').trim()

// Lines like "Mon 18:00-21:00" -> concrete slots for the next 14 days
export function parseAvailability(text, days = 14) {
  const rules = [], errors = []
  text.split('\n').map(l => l.trim()).filter(Boolean).forEach(line => {
    const m = line.match(/^(sun|mon|tue|wed|thu|fri|sat)\w*\s+(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})$/i)
    if (!m) return errors.push(`Can't read "${line}" (use e.g. Mon 18:00-21:00)`)
    rules.push({ dow: DOW[m[1].toLowerCase()], start: +m[2] * 60 + +m[3], end: +m[4] * 60 + +m[5] })
  })
  const slots = []
  for (let i = 1; i <= days; i++) {
    const d = new Date(); d.setDate(d.getDate() + i)
    rules.filter(r => r.dow === d.getDay()).forEach(r =>
      slots.push({ date: fmtDate(d), start: toHM(r.start), end: toHM(r.end) }))
  }
  return { slots, errors }
}

export function runChecks(plan, sourceText, slots) {
  const tasks = plan.tasks || [], sessions = plan.sessions || []
  const src = norm(sourceText)
  const byId = Object.fromEntries(tasks.map(t => [t.id, t]))
  const list = a => a.join('; ')
  const out = []

  const ungrounded = tasks.filter(t => !t.source_quote || !src.includes(norm(t.source_quote)))
  out.push({ name: 'Every task quotes your pasted text', pass: ungrounded.length === 0, detail: list(ungrounded.map(t => t.title)) })

  const orphan = sessions.filter(s => !byId[s.task_id])
  out.push({ name: 'Every session maps to a real task', pass: orphan.length === 0, detail: list(orphan.map(s => `${s.date} ${s.start}`)) })

  const outside = sessions.filter(s => !slots.some(sl => sl.date === s.date && toMin(s.start) >= toMin(sl.start) && toMin(s.end) <= toMin(sl.end)))
  out.push({ name: 'Every session fits your free time', pass: outside.length === 0, detail: list(outside.map(s => `${s.date} ${s.start}-${s.end}`)) })

  const sorted = [...sessions].sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start))
  const overlaps = sorted.filter((s, i) => i > 0 && sorted[i - 1].date === s.date && toMin(s.start) < toMin(sorted[i - 1].end))
  out.push({ name: 'No overlapping sessions', pass: overlaps.length === 0, detail: list(overlaps.map(s => `${s.date} ${s.start}`)) })

  const late = sessions.filter(s => byId[s.task_id] && s.date > byId[s.task_id].due)
  out.push({ name: 'Every session is before its due date', pass: late.length === 0, detail: list(late.map(s => `${byId[s.task_id].title} on ${s.date}`)) })

  const short = tasks.filter(t => {
    const hrs = sessions.filter(s => s.task_id === t.id).reduce((a, s) => a + (toMin(s.end) - toMin(s.start)) / 60, 0)
    return hrs < t.est_hours * 0.9
  })
  out.push({ name: 'Each task gets enough hours', pass: short.length === 0, detail: list(short.map(t => t.title)) })

  return out
}