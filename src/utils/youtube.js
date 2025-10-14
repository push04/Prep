// src/utils/youtube.js
export function parseYouTubeId(input = "") {
  if (!input) return "";
  if (/^[a-zA-Z0-9_-]{11}$/.test(input)) return input;
  try {
    const u = new URL(input);
    if (u.hostname.includes("youtu.be")) return u.pathname.replace("/", "");
    if (u.searchParams.get("v")) return u.searchParams.get("v");
    const parts = u.pathname.split("/");
    return parts.pop() || "";
  } catch { return ""; }
}
export const toWatchUrl = (id) => `https://www.youtube.com/watch?v=${id}`;
export const toEmbedUrl = (id) => `https://www.youtube.com/embed/${id}`;
export const searchUrl = (q) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q || "")}`;
