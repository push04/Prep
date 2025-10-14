// netlify/functions/yt-search.js
const SEARCH_ENDPOINT = "https://www.googleapis.com/youtube/v3/search";

export default async (event) => {
  try {
    const rawBody = typeof event.body === "string" ? event.body : JSON.stringify(event.body || {});
    let body = {};
    try { body = JSON.parse(rawBody || "{}"); } catch {}
    const { q } = body;

    if (!q || !q.trim()) {
      return new Response(JSON.stringify({ error: "Query required", searchUrl: `https://www.youtube.com/results?search_query=` }), {
        headers: { "Content-Type": "application/json" }, status: 200
      });
    }

    const key = process.env.YOUTUBE_API_KEY;
    if (!key) {
      return new Response(JSON.stringify({
        videoId: null,
        title: null,
        searchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`
      }), { headers: { "Content-Type": "application/json" }, status: 200 });
    }

    const url = `${SEARCH_ENDPOINT}?part=snippet&type=video&maxResults=1&safeSearch=none&q=${encodeURIComponent(q)}&key=${key}`;
    const yt = await fetch(url);
    const data = await yt.json();

    const item = data?.items?.[0];
    const videoId = item?.id?.videoId || null;
    const title = item?.snippet?.title || null;

    if (!videoId) {
      return new Response(JSON.stringify({
        videoId: null, title: null,
        searchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`
      }), { headers: { "Content-Type": "application/json" }, status: 200 });
    }

    return new Response(JSON.stringify({ videoId, title }), {
      headers: { "Content-Type": "application/json" }, status: 200
    });
  } catch (e) {
    return new Response(JSON.stringify({
      videoId: null, title: null,
      searchUrl: "https://www.youtube.com", error: e.message
    }), { headers: { "Content-Type": "application/json" }, status: 200 });
  }
};
