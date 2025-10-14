import React, { useState } from "react";
import { toEmbedUrl, toWatchUrl, searchUrl } from "../utils/youtube";

export default function YouTubePanel({ onViewed }) {
  const [query, setQuery] = useState("Fluid Mechanics GATE PYQ");
  const [current, setCurrent] = useState({ id: "", title: "" });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const pickBest = async () => {
    if (!query.trim()) return;
    setBusy(true); setMessage("");
    try {
      const res = await fetch("/.netlify/functions/yt-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: query })
      });
      const data = await res.json();
      if (data?.videoId) {
        setCurrent({ id: data.videoId, title: data.title || query });
        onViewed?.({ id: data.videoId, title: data.title || query, at: Date.now() });
      } else {
        setMessage("Opening YouTube search in a new tab…");
        window.open(data?.searchUrl || searchUrl(query), "_blank");
      }
    } catch (e) {
      setMessage("Search failed. Opening YouTube search in a new tab…");
      window.open(searchUrl(query), "_blank");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="text-sm text-white/80">
        🔎 Type a topic and click <b>Best video</b>. If an API key is set, we auto-embed the top result; otherwise we open YouTube search.
      </div>

      <div className="flex gap-2">
        <input
          className="input"
          placeholder="e.g. Machine Design failure theories"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && pickBest()}
        />
        <button className="btn" onClick={pickBest} disabled={busy}>
          {busy ? "Finding…" : "Best video"}
        </button>
        <button className="btn" onClick={() => window.open(searchUrl(query), "_blank")}>
          Search
        </button>
      </div>

      {message && <div className="text-xs text-white/60">{message}</div>}

      {current.id ? (
        <div className="space-y-2">
          <div className="text-sm text-white/80">{current.title}</div>
          <div className="aspect-video w-full card overflow-hidden">
            <iframe
              title={current.title}
              className="w-full h-full"
              src={toEmbedUrl(current.id)}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture;"
              allowFullScreen
            />
          </div>
          <a className="text-primary text-xs underline" href={toWatchUrl(current.id)} target="_blank" rel="noreferrer">
            Open on YouTube
          </a>
        </div>
      ) : (
        <div className="text-xs text-white/60">No video embedded yet.</div>
      )}
    </div>
  );
}
