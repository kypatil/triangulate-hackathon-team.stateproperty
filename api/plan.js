export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })
  const key = process.env.STATE_PROPERTY || process.env.OPENROUTER_API_KEY
  if (!key) return res.status(500).json({ error: 'Missing OPENROUTER_API_KEY' })

  const { text, slots, today } = req.body || {}
  if (!text || !slots?.length) return res.status(400).json({ error: 'text and slots required' })

  const system = `You are a study planner. Today is ${today}.
Return ONLY valid JSON, no markdown, in this shape:
{"tasks":[{"id":"t1","title":"","due":"YYYY-MM-DD","est_hours":0,"source_quote":""}],
 "sessions":[{"date":"YYYY-MM-DD","start":"HH:MM","end":"HH:MM","task_id":"t1","focus":""}]}
Rules:
- Extract tasks only from the user's text. Do not invent any.
- source_quote must be copied verbatim, contiguous, from the user's text, and include the due date wording.
- Resolve dates like "Nov 30" to the next occurrence after today.
- If hours are not stated, estimate and keep est_hours realistic.
- Every session must fall entirely inside ONE of the provided free slots.
- Sessions are 30-120 minutes, must not overlap, and must be on or before the task's due date.
- Total session time per task should be about its est_hours.
- "focus" is one short sentence on what to do in that session.`

  const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: process.env.MODEL || 'openrouter/free',
      max_tokens: 4000,
      temperature: 0.2,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: `FREE SLOTS:\n${JSON.stringify(slots)}\n\nSTUDENT TEXT:\n${text}` },
      ],
    }),
  })
  const data = await r.json()
  if (!r.ok) return res.status(502).json({ error: data?.error?.message || 'AI request failed' })

  const raw = data.choices?.[0]?.message?.content || ''
  try {
    res.status(200).json(JSON.parse(raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1)))
  } catch {
    res.status(502).json({ error: 'Model returned invalid JSON', raw })
  }
}