import { useState } from 'react'
import { parseAvailability, runChecks, fmtDate } from './checks.js'
import './App.css'

const SAMPLE_TEXT = `BIO 101 - Problem Set 3 due Nov 30. Estimated 3 hours.
HIST 210 - Essay draft due Dec 2 (about 5 hours of work).
MATH 140 - Midterm on Dec 4. Plan on 6 hours of review.`
const SAMPLE_AVAIL = `Mon 18:00-21:00
Tue 18:00-20:00
Thu 18:00-20:00
Sat 10:00-14:00`

export default function App() {
  const [text, setText] = useState(SAMPLE_TEXT)
  const [avail, setAvail] = useState(SAMPLE_AVAIL)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  async function generate() {
    const { slots, errors } = parseAvailability(avail)
    if (errors.length || !slots.length) return setError(errors.join('\n') || 'No free slots found.')
    setLoading(true); setError(''); setResult(null)
    try {
      const r = await fetch('/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, slots, today: fmtDate(new Date()) }),
      })
      const plan = await r.json()
      if (!r.ok) throw new Error(plan.error || 'Request failed')
      setResult({ plan, checks: runChecks(plan, text, slots), source: text })
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  const sessions = result?.plan.sessions || []
  const byDate = {}
  sessions.forEach(s => (byDate[s.date] ||= []).push(s))
  const title = id => result.plan.tasks?.find(t => t.id === id)?.title || '?'
  const norm = s => String(s).toLowerCase().replace(/\s+/g, ' ').trim()

  return (
    <main>
      <h1>Study Planner</h1>
      <p>Paste your syllabus or assignments, tell us when you're free, get a plan you can verify.</p>
      <label>Assignments / syllabus text</label>
      <textarea rows={6} value={text} onChange={e => setText(e.target.value)} />
      <label>Free time each week (one per line, e.g. Mon 18:00-21:00)</label>
      <textarea rows={4} value={avail} onChange={e => setAvail(e.target.value)} />
      <button onClick={generate} disabled={loading}>{loading ? 'Planning...' : 'Generate plan'}</button>
      {error && <pre className="err">{error}</pre>}

      {result && (<>
        <h2>Checks on the AI's output</h2>
        <ul className="checks">
          {result.checks.map(c => (
            <li key={c.name} className={c.pass ? 'ok' : 'bad'}>
              {c.pass ? '✅' : '❌'} {c.name}{!c.pass && c.detail ? `: ${c.detail}` : ''}
            </li>
          ))}
        </ul>

        <h2>What it found in your text</h2>
        {(result.plan.tasks || []).map(t => {
          const grounded = norm(result.source).includes(norm(t.source_quote || ''))
          return (
            <div key={t.id} className="task">
              <b>{t.title}</b> · due {t.due} · ~{t.est_hours}h
              <div className="quote">{grounded ? '✅' : '❌'} “{t.source_quote}”</div>
            </div>
          )
        })}

        <h2>Your schedule</h2>
        {Object.keys(byDate).sort().map(d => (
          <div key={d} className="day">
            <b>{d}</b>
            {byDate[d].sort((a, b) => a.start.localeCompare(b.start)).map((s, i) => (
              <div key={i}>{s.start}-{s.end} · {title(s.task_id)} — {s.focus}</div>
            ))}
          </div>
        ))}
      </>)}
    </main>
  )
}