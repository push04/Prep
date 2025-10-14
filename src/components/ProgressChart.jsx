import React, { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function ProgressChart({ progress, onAddScore }) {
  const [score, setScore] = useState("");
  const data = (progress.mockScores || []).map((s, idx) => ({ name: `Mock ${idx + 1}`, score: s }));

  const add = () => {
    const n = Number(score);
    if (!Number.isFinite(n) || n < 0 || n > 100) return;
    onAddScore(n);
    setScore("");
  };

  return (
    <div className="space-y-3">
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
      </div>

      <div className="flex gap-2 items-center">
        <input
          className="input w-28"
          placeholder="Score"
          value={score}
          onChange={(e) => setScore(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
        />
        <button className="btn" onClick={add}>Add mock score</button>
      </div>

      <div className="text-xs text-white/60">
        Track your mock trend. Aim for 65+ for safety, 75+ for top ranks.
      </div>
    </div>
  );
}
