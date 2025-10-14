import React, { useState, useEffect, useRef } from "react";

export default function AIAdvisor() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([
    {
      role: "assistant",
      content:
        "👋 Hi! I'm your Mechanical Engineering mentor for UPSC ESE and GATE ME. Ask me for study plans or topic guidance.",
    },
  ]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const ask = async () => {
    const message = input.trim();
    if (!message) return;
    setInput("");
    setLoading(true);
    setHistory((h) => [...h, { role: "user", content: message }]);

    try {
      const res = await fetch("/.netlify/functions/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "openai/gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `You are a **Mechanical Engineering AI Mentor** for UPSC ESE and GATE ME.
Only discuss Mechanical Engineering subjects (Thermodynamics, Fluid Mechanics, SOM, Machine Design, TOM, Manufacturing, Heat Transfer, etc.).
Never talk about Netlify, web development, or coding.
Always give concise, exam-oriented study or revision plans.
If asked for a plan, always answer in this format:

Day 1 — ...
Day 2 — ...
Day 3 — ...

Include key topics, formulas, and PYQ practice.`,
            },
            { role: "user", content: message },
          ],
        }),
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        console.error("Invalid JSON:", text);
      }

      const reply =
        data?.choices?.[0]?.message?.content ||
        data?.error?.message ||
        text ||
        "⚠️ I couldn’t generate a response. Try again.";

      setHistory((h) => [...h, { role: "assistant", content: reply }]);
    } catch (err) {
      console.error("AIAdvisor error:", err);
      setHistory((h) => [
        ...h,
        { role: "assistant", content: "❌ Network or server error — please retry." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="h-56 overflow-auto pr-2 space-y-2">
        {history.map((m, i) => (
          <div
            key={i}
            className={`p-2 rounded-lg text-sm ${
              m.role === "assistant" ? "bg-white/5" : ""
            }`}
          >
            <div className="text-white/80 whitespace-pre-line">{m.content}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-2">
        <input
          className="input"
          placeholder="Ask: e.g. 'Give me a 3-day plan to strengthen Fluid Mechanics.'"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ask()}
        />
        <button className="btn" onClick={ask} disabled={loading}>
          {loading ? "Thinking…" : "Ask"}
        </button>
      </div>

      <div className="text-xs text-white/50">
        💡 Example: “Give me a 3-day plan to strengthen Fluid Mechanics.”
      </div>
    </div>
  );
}
