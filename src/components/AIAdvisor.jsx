import React, { useEffect, useRef, useState } from "react";

export default function AIAdvisor({ profile, today, progress }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([
    {
      role: "assistant",
      content:
        "👋 Hi! I’m your Mechanical Engineering mentor for UPSC ESE & GATE ME. Ask for plans, topic priorities, PYQ strategy, or revision tips.",
    },
  ]);
  const [error, setError] = useState("");
  const abortRef = useRef(null);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, loading, error]);

  const systemPrompt = `
You are a **Mechanical Engineering AI Mentor** for UPSC ESE (ME) and GATE ME.
Only discuss Mechanical Engineering: Thermodynamics, Fluid Mechanics, Heat Transfer,
Strength of Materials, Machine Design, Theory of Machines, Manufacturing, Industrial Engg., Engg. Math.
Never discuss Netlify, web dev, coding, or unrelated topics.

When asked for a plan, ALWAYS structure responses like:
Day 1 — …
Day 2 — …
Day 3 — …

Keep answers concise (<= 180 words), technical, exam-oriented, with formulas/PYQs/revision targets.
`;

  const buildUserContext = (query) => {
    // compact, readable context (plain text, no stringify noise)
    const strengths = (profile?.strengths || []).join(", ") || "—";
    const weaknesses = (profile?.weaknesses || []).join(", ") || "—";
    const level = profile?.level || "intermediate";
    const hours = profile?.dailyHours || 4;
    const target = profile?.targetExam || "GATE ME";
    const date = profile?.examDate || "(not set)";

    return `
Profile:
- Level: ${level}
- Strengths: ${strengths}
- Weaknesses: ${weaknesses}
- Daily Hours: ${hours}
- Target: ${target}
- Exam Date: ${date}

Today’s auto-plan blocks (titles only):
${(today?.blocks || []).map((b, i) => `  ${i + 1}. ${b.title} (${b.type}, ${b.duration} min)`).join("\n") || "  —"}

Progress summary:
- Current Day: ${progress?.day ?? 1}
- Completed items: ${progress?.completed?.length ?? 0}
- Mock scores: ${(progress?.mockScores || []).join(", ") || "—"}

User Query:
${query}
`.trim();
  };

  const send = async (message) => {
    setError("");
    if (!message.trim()) return;

    // add user's message
    setHistory((h) => [...h, { role: "user", content: message }]);
    setInput("");
    setLoading(true);

    try {
      // allow cancellation
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      const payload = {
        model: "openai/gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: buildUserContext(message) },
        ],
        max_tokens: 400,
        temperature: 0.6,
      };

      const res = await fetch("/.netlify/functions/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: abortRef.current.signal,
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        // If upstream returns non-JSON, still show something useful
        setHistory((h) => [...h, { role: "assistant", content: text || "⚠️ Upstream returned non-JSON." }]);
        return;
      }

      const reply =
        data?.choices?.[0]?.message?.content ||
        data?.message?.content ||
        data?.error?.message ||
        "⚠️ I couldn’t generate a response. Try again.";
      setHistory((h) => [...h, { role: "assistant", content: reply }]);
    } catch (e) {
      if (e.name === "AbortError") {
        setHistory((h) => [...h, { role: "assistant", content: "⏹️ Stopped." }]);
      } else {
        setError("❌ Network or server error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAsk = () => send(input);
  const handleKey = (e) => e.key === "Enter" && !e.shiftKey && handleAsk();
  const stop = () => abortRef.current?.abort();
  const reset = () => {
    abortRef.current?.abort();
    setHistory([
      {
        role: "assistant",
        content:
          "👋 Hi! I’m your Mechanical Engineering mentor for UPSC ESE & GATE ME. Ask for plans, topic priorities, PYQ strategy, or revision tips.",
      },
    ]);
    setError("");
    setInput("");
  };

  const quickPrompts = [
    "Give me a 3-day plan to strengthen Fluid Mechanics.",
    "I’m weak in Machine Design and SOM — prioritize scoring topics for 10 days.",
    "With 20 days left for GATE ME, create a daily micro-plan (4h/day).",
    "List must-know formulas in Thermodynamics with a short practice drill.",
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {quickPrompts.map((q) => (
          <button key={q} className="btn" onClick={() => send(q)} disabled={loading}>
            {q.length > 34 ? q.slice(0, 34) + "…" : q}
          </button>
        ))}
      </div>

      <div className="h-56 overflow-auto pr-2 space-y-2 card p-2">
        {history.map((m, i) => (
          <div key={i} className={`p-2 rounded-lg text-sm ${m.role === "assistant" ? "bg-white/5" : "bg-white/0"}`}>
            <div className="text-white/80 whitespace-pre-line">{m.content}</div>
          </div>
        ))}
        {error && <div className="text-red-400 text-xs">{error}</div>}
        <div ref={endRef} />
      </div>

      <div className="flex gap-2">
        <textarea
          className="input min-h-[42px]"
          placeholder="Ask for a micro-plan, topic focus, or formula drill… (Shift+Enter for newline)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
        />
        <button className="btn" onClick={handleAsk} disabled={loading || !input.trim()}>
          {loading ? "Thinking…" : "Ask"}
        </button>
        <button className="btn" onClick={stop} disabled={!loading}>Stop</button>
        <button className="btn" onClick={reset}>Reset</button>
      </div>

      <div className="text-xs text-white/50">
        Tip: Be specific about weaknesses, remaining days, and daily hours for sharper plans.
      </div>
    </div>
  );
}
