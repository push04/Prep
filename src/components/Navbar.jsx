import React, { useState } from 'react'

export default function Navbar({ profile, setProfile }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(profile)

  const save = () => {
    setProfile(form)
    setOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 backdrop-blur border-b border-white/10 bg-ink/70">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-xl bg-primary/20 grid place-items-center text-primary font-bold">ME</div>
          <span className="font-semibold tracking-wide">ESE & GATE ME Coach</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-sm text-white/70">Hi, {profile.name}</span>
          <button className="btn" onClick={() => setOpen(true)}>Profile</button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/60 grid place-items-center p-4">
          <div className="card max-w-xl w-full p-5">
            <h3 className="text-lg font-semibold mb-3">Profile</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <input className="input" placeholder="Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})}/>
              <select className="input" value={form.targetExam} onChange={e=>setForm({...form, targetExam:e.target.value})}>
                <option>GATE ME</option>
                <option>UPSC ESE ME (Prelims)</option>
                <option>UPSC ESE ME (Mains)</option>
              </select>
              <input className="input" type="date" value={form.examDate} onChange={e=>setForm({...form, examDate:e.target.value})}/>
              <input className="input" type="number" min="1" max="12" placeholder="Daily Hours" value={form.dailyHours} onChange={e=>setForm({...form, dailyHours:Number(e.target.value)})}/>
              <input className="input sm:col-span-2" placeholder="Strengths (comma-separated)" value={form.strengths.join(', ')} onChange={e=>setForm({...form, strengths: e.target.value.split(',').map(s=>s.trim()).filter(Boolean)})}/>
              <input className="input sm:col-span-2" placeholder="Weaknesses (comma-separated)" value={form.weaknesses.join(', ')} onChange={e=>setForm({...form, weaknesses: e.target.value.split(',').map(s=>s.trim()).filter(Boolean)})}/>
              <select className="input" value={form.level} onChange={e=>setForm({...form, level:e.target.value})}>
                <option>beginner</option>
                <option>intermediate</option>
                <option>advanced</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button className="btn" onClick={()=>setOpen(false)}>Close</button>
              <button className="btn border-primary/40" onClick={save}>Save</button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
