import React from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export default function ProgressChart({ progress }) {
  const data = progress.mockScores.map((s, idx) => ({
    name: `Mock ${idx + 1}`,
    score: s
  }))

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeOpacity={0.1} />
          <XAxis dataKey="name" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Line type="monotone" dataKey="score" dot />
        </LineChart>
      </ResponsiveContainer>
      <div className="text-xs text-white/60 mt-2">
        Add mock scores as you go to watch trendlines. Target 65+ for solid safety, 75+ for top ranks.
      </div>
    </div>
  )
}
