// netlify/functions/chat.js
export default async (event) => {
  try {
    // Safely parse incoming request
    let body = {};
    if (typeof event.body === "string") {
      try {
        body = JSON.parse(event.body);
      } catch (err) {
        console.error("JSON parse error:", err);
        return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400 });
      }
    } else {
      body = event.body || {};
    }

    const {
      messages = [],
      model = "openai/gpt-4o-mini",
      max_tokens = 350,
    } = body;

    if (!process.env.OPENROUTER_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing OPENROUTER_API_KEY" }), { status: 500 });
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "No messages provided to OpenRouter" }),
        { status: 400 }
      );
    }

    console.log("🚀 Sending to OpenRouter:", messages.map(m => m.role));

    const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.6,
        max_tokens,
        top_p: 0.9,
      }),
    });

    const data = await r.json();
    console.log("✅ OpenRouter response:", data);

    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
      status: r.ok ? 200 : r.status,
    });
  } catch (e) {
    console.error("❌ Serverless function error:", e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
