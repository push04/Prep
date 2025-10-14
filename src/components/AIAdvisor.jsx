import React, { useEffect, useRef, useState } from "react";

export default function AIAdvisor({ profile, today, progress, onLogTask }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([
    { role: "assistant", content: "👋 Hi! I’m your ME mentor (UPSC ESE & GATE ME). Ask for plans, priorities, PYQs, or formula drills." },
  ]);
  const [error, setError] = useState("");
  const abortRef = useRef(null);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [history, loading, error]);

  const systemPrompt = `
You are a Mechanical Engineering AI Mentor for UPSC ESE (ME) and GATE ME.
Only discuss ME subjects: Thermodynamics, Fluid Mechanics, Heat Transfer, SOM, Machine Design, TOM, Manufacturing, Industrial Engg., Engg. Math.
Never discuss Netlify, web dev, or coding.

When asked for a plan, format strictly:
Day 1 — …
Day 2 — …
Day 3 — …
Keep ≤ 180 words; include formulas, PYQs, and revision targets. Be concise and exam-focused.
`;

  const buildUserContext = (query) => {
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

Today’s blocks:
${(today?.blocks || []).map((b, i) => `  ${i + 1}. ${b.title} (${b.type}, ${b.duration} min)`).join("\n") || "  —"}

Progress:
- Day: ${progress?.day ?? 1}
- Completed items: ${(progress?.completed || []).length}
- Mock scores: ${(progress?.mockScores || []).join(", ") || "—"}

User Query:
${query}
`.trim();
  };

  const lastAssistantText = () => {
    for (let i = history.length - 1; i >= 0; i--) if (history[i].role === "assistant") return history[i].content || "";
    return "";
  };

  const copyPlan = async () => {
    const text = lastAssistantText(); if (!text) return;
    try { await navigator.clipboard.writeText(text);
      setHistory((h) => [...h, { role: "assistant", content: "📋 Copied plan to clipboard." }]);
    } catch { setHistory((h) => [...h, { role: "assistant", content: "⚠️ Copy failed. Select and copy manually." }]); }
  };

  const downloadPlan = () => {
    const text = lastAssistantText(); if (!text) return;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a");
    a.href = url; a.download = "study-plan.txt"; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  };

  const send = async (message) => {
    setError(""); if (!message.trim()) return;
    setHistory((h) => [...h, { role: "user", content: message }]);
    setInput(""); setLoading(true);

    try {
      abortRef.current?.abort(); abortRef.current = new AbortController();

      const payload = {
        model: "openai/gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: buildUserContext(message) },
        ],
        max_tokens: 400, temperature: 0.6,
      };

      const res = await fetch("/.netlify/functions/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload), signal: abortRef.current.signal,
      });

      const text = await res.text();
      let data; try { data = JSON.parse(text); } catch {
        setHistory((h) => [...h, { role: "assistant", content: text || "⚠️ Unexpected response. Please retry." }]); return;
      }

      const reply =
        data?.choices?.[0]?.message?.content ||
        data?.message?.content ||
        data?.error?.message ||
        text || "⚠️ Please retry.";
      setHistory((h) => [...h, { role: "assistant", content: reply }]);

      // naive log: if reply includes Day 1, store a "planSuggested" event
      if (/Day\s*1/i.test(reply)) onLogTask?.({ kind: "planSuggested", at: Date.now(), note: message });
    } catch (e) {
      if (e.name === "AbortError") setHistory((h) => [...h, { role: "assistant", content: "⏹️ Stopped." }]);
      else setError("❌ Network or server error. Try again.");
    } finally { setLoading(false); }
  };

  const handleAsk = () => send(input);
  const handleKey = (e) => e.key === "Enter" && !e.shiftKey && handleAsk();
  const stop = () => abortRef.current?.abort();
  const reset = () => {
    abortRef.current?.abort();
    setHistory([{ role: "assistant", content: "👋 Hi! I’m your ME mentor (UPSC ESE & GATE ME). Ask for plans, priorities, PYQs, or formula drills." }]);
    setError(""); setInput("");
  };

  const quickPrompts = [
    "Give me a 3-day plan to strengthen Fluid Mechanics.",
    "I’m weak in Machine Design — prioritize the next 7 days.",
    "Thermodynamics formulas revision in 2 days with PYQs.",
    "4 hours/day for 10 days — micro-plan for SOM + TOM.",
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {quickPrompts.map((q) => (
          <button key={q} className="btn" onClick={() => send(q)} disabled={loading}>
            {q.length > 34 ? q.slice(0, 34) + "…" : q}
          </button>
        ))}
        <div className="ml-auto flex gap-2">
          <button className="btn" onClick={copyPlan}>Copy</button>
          <button className="btn" onClick={downloadPlan}>Download</button>
        </div>
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
          value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKey}
        />
        <button className="btn" onClick={handleAsk} disabled={loading || !input.trim()}>
          {loading ? "Thinking…" : "Ask"}
        </button>
        <button className="btn" onClick={stop} disabled={!loading}>Stop</button>
        <button className="btn" onClick={reset}>Reset</button>
      </div>

      <div className="text-xs text-white/50">
        Tip: Include weaknesses, remaining days, and daily hours for sharper plans.
      </div>
    </div>
  );
}
