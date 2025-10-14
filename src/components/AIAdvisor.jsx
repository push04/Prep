import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";

export default function AIAdvisor({ profile, today, progress }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([
    {
      role: "assistant",
      content:
        "👋 Hi! I’m your AI mentor. Tell me your current challenge — I’ll craft a smart plan or revision guide.",
    },
  ]);
  const messagesEndRef = useRef(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

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
              content: `You are an AI mentor for UPSC ESE (Mechanical) and GATE ME.
              Analyze the aspirant's profile, progress, and today's plan to suggest actionable micro-plans and revision strategy.
              Keep it motivational, structured, and under 180 words.`,
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

      // Handle multiple possible API shapes safely
      const text =
        data?.choices?.[0]?.message?.content ||
        data?.message?.content ||
        data?.error?.message ||
        "⚠️ I couldn’t generate a response. Try again.";

      setHistory((h) => [...h, { role: "assistant", content: text }]);
    } catch (e) {
      console.error("AIAdvisor fetch error:", e);
      setHistory((h) => [
        ...h,
        {
          role: "assistant",
          content: "❌ Network or API error — please retry in a few seconds.",
        },
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
              m.role === "assistant" ? "bg-white/5" : "bg-white/0"
            }`}
          >
            <ReactMarkdown
              className="prose prose-invert prose-sm"
              components={{
                p: (props) => <p className="text-white/80 mb-1" {...props} />,
                strong: (props) => <strong className="text-primary" {...props} />,
                ul: (props) => (
                  <ul className="list-disc list-inside text-white/80" {...props} />
                ),
              }}
            >
              {m.content}
            </ReactMarkdown>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-2">
        <input
          className="input"
          placeholder="Ask for help, e.g. 'I’m weak in Machine Design, 20 days left…'"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ask()}
        />
        <button className="btn" onClick={() => ask()} disabled={loading}>
          {loading ? "Thinking…" : "Ask"}
        </button>
      </div>

      <div className="text-xs text-white/50">
        💡 Example: “Give me a 3-day plan to strengthen Fluid Mechanics.”
      </div>
    </div>
  );
}
