// netlify/functions/chat.js
// Secure proxy to OpenRouter. Set OPENROUTER_API_KEY in Netlify → Site settings → Environment variables.

export default async (event) => {
  try {
    // Read raw body (string). Netlify always gives string in prod; keep code robust anyway.
    const rawBody = typeof event.body === "string" ? event.body : JSON.stringify(event.body || {});
    if (!rawBody || rawBody === "{}") {
      return new Response(JSON.stringify({ error: "Empty request body" }), { status: 400 });
    }

    let body;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400 });
    }

    const { messages, model = "openai/gpt-4o-mini", max_tokens = 400, temperature = 0.6 } = body || {};

    if (!process.env.OPENROUTER_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing OPENROUTER_API_KEY" }), { status: 500 });
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "No messages provided" }), { status: 400 });
    }

    const upstream = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens,
        top_p: 0.9
      }),
    });

    const text = await upstream.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      // OpenRouter returned non-JSON (rare: HTML error page / gateway message)
      return new Response(JSON.stringify({ error: "Invalid response from OpenRouter", raw: text }), { status: 502 });
    }

    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
      status: upstream.ok ? 200 : upstream.status,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
