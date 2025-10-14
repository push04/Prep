import React, { useState } from "react";

export default function AIAdvisor({ profile, today, progress }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([
    {
      role: "assistant",
      content:
        "👋 Hi! I’m your AI mentor. Tell me your hurdles today — I’ll craft a custom plan, recommend key topics, and revision micro-goals.",
    },
  ]);

  const ask = async (customPrompt) => {
    const message = customPrompt || input.trim();
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
              content: `You are an expert mechanical engineering mentor for UPSC ESE and GATE ME.
              Analyze the user's profile, progress, and today's plan to provide actionable advice.
              Focus on concise, motivating, and technical insights in under 150 words.`,
            },
            {
              role: "user",
              content: JSON.stringify({
                profile,
                today,
                progress,
                query: message,
              }),
            },
          ],
        }),
      });

      const data = await res.json();
      const text =
        data?.choices?.[0]?.message?.content ||
        data?.error?.message ||
        "⚠️ I couldn’t generate a response. Try again.";

      setHistory((h) => [...h, { role: "assistant", content: text }]);
    } catch (e) {
      console.error("AIAdvisor error:", e);
      setHistory((h) => [
        ...h,
        { role: "assistant", content: "❌ Network or server error. Please try again." },
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
            className={`${
              m.role === "assistant" ? "bg-white/5" : "bg-white/0"
            } p-2 rounded-lg text-sm`}
          >
            <div className="text-white/80">{m.content}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          className="input"
          placeholder="Ask for topic advice, plan tuning, or focus tips..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ask()}
        />
        <button className="btn" onClick={() => ask()} disabled={loading}>
          {loading ? "Thinking…" : "Ask"}
        </button>
      </div>

      <div className="text-xs text-white/50">
        💡 Example: “I’m weak in Machine Design, 20 days left — make me a 3-day micro-plan.”
      </div>
    </div>
  );
}
