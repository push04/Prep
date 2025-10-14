import React, { useState } from 'react'

export default function AIAdvisor({ profile, today, progress }) {
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState([
    { role: 'assistant', content: "Tell me your hurdles today. I’ll tweak your plan, recommend targeted problems, and give revision micro-goals." }
  ])

  const ask = async (customPrompt) => {
    const message = customPrompt || input
    if (!message.trim()) return
    setLoading(true)
    setHistory(h => [...h, { role: 'user', content: message }])
    setInput("")
    try {
      const res = await fetch('/.netlify/functions/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content:
                `You are an expert mentor for UPSC ESE (Mechanical) and GATE (ME).
                 Create personal, day-by-day strategies rooted in mechanical engineering syllabi.
                 Consider: profile (strengths, weaknesses, level, exam date, daily hours),
                 today's blocks, progress history, and standard topic weightage.
                 Keep answers crisp with bulleted steps, 90-150 words where possible.`
            },
            { role: "user", content: JSON.stringify({ profile, today, progress, query: message }) }
          ]
        })
      })
      const data = await res.json()
      const text =
        data?.choices?.[0]?.message?.content ||
        data?.message || "I couldn’t generate a response. Try again."
      setHistory(h => [...h, { role: 'assistant', content: text }])
    } catch (e) {
      setHistory(h => [...h, { role: 'assistant', content: "Network or API error. Please retry." }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="h-56 overflow-auto pr-2 space-y-2">
        {history.map((m, i) => (
          <div key={i} className={`${m.role === 'assistant' ? 'bg-white/5' : 'bg-white/0'} p-2 rounded-lg text-sm`}>
            <div className="text-white/70">{m.content}</div>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="input"
          placeholder="Ask for a micro-plan, topic sequence, or revision drills…"
          value={input}
          onChange={e=>setInput(e.target.value)}
          onKeyDown={e=>e.key==='Enter' && ask()}
        />
        <button className="btn" onClick={()=>ask()} disabled={loading}>
          {loading ? 'Thinking…' : 'Ask'}
        </button>
      </div>
      <div className="text-xs text-white/50">
        Tip: Try “I’m weak in Fluid Mechanics & Machine Design, 20 days left—prioritize scoring topics.”
      </div>
    </div>
  )
}
