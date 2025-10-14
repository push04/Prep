import React from 'react'

export default function DailyPlan({ profile, today, onComplete, onNextDay }) {
  const hours = profile.dailyHours || 4
  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-3 text-sm text-white/80">
        <span className="badge">{profile.targetExam}</span>
        {profile.examDate && <span className="badge">Exam: {new Date(profile.examDate).toLocaleDateString()}</span>}
        <span className="badge">Study: {hours}h/day</span>
      </div>

      <ol className="space-y-3">
        {today.blocks.map((b, i) => (
          <li key={b.id} className="p-4 card flex items-start gap-3">
            <div className="text-primary font-semibold shrink-0">{i+1}.</div>
            <div className="flex-1">
              <div className="font-medium">{b.title}</div>
              <div className="text-sm text-white/70">{b.detail}</div>
              <div className="flex gap-2 mt-2">
                <span className="badge">{b.type}</span>
                <span className="badge">{b.duration} min</span>
                {b.source && <span className="badge">{b.source}</span>}
              </div>
            </div>
            <button className="btn" onClick={()=>onComplete(b)}>Done</button>
          </li>
        ))}
      </ol>

      <div className="flex justify-end mt-4">
        <button className="btn" onClick={onNextDay}>Generate next day ▶</button>
      </div>
    </div>
  )
}
