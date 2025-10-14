import React, { useState } from 'react'

const SAMPLE = [
  {
    q: "A 4-stroke diesel engine has a brake power of 40 kW at 2000 rpm and brake torque T. Find T.",
    a: "T = 60 * P / (2πN) = 60*40,000/(2π*2000) ≈ 191 N·m."
  },
  {
    q: "For fully developed laminar flow in a pipe, the Nusselt number is:",
    a: "Nu = 3.66 (constant wall temperature)."
  },
  {
    q: "An Euler buckling load (pinned-pinned) for column is?",
    a: "P_cr = π²EI / L²."
  }
]

export default function QuestionCard() {
  const [idx, setIdx] = useState(0)
  const [show, setShow] = useState(false)

  const next = () => { setIdx((idx + 1) % SAMPLE.length); setShow(false) }

  return (
    <div className="space-y-3">
      <div className="text-sm text-white/80">{SAMPLE[idx].q}</div>
      {show && <div className="text-sm text-primary/90">{SAMPLE[idx].a}</div>}
      <div className="flex gap-2">
        <button className="btn" onClick={() => setShow(s=>!s)}>{show ? 'Hide' : 'Reveal'}</button>
        <button className="btn" onClick={next}>Next</button>
      </div>
      <div className="text-xs text-white/50">Quick conceptual checks. Add your own later.</div>
    </div>
  )
}
