// netlify/functions/chat.js
// Secure proxy to OpenRouter. Make sure OPENROUTER_API_KEY is set in Netlify → Environment variables.

export default async (event) => {
  try {
    // Parse body safely
    let body = {};
    if (typeof event.body === "string") {
      try {
        body = JSON.parse(event.body);
      } catch {
        console.error("Invalid JSON body");
        return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400 });
      }
    } else {
      body = event.body || {};
    }

    const {
      messages = [],
      model = "openai/gpt-4o-mini",
      max_tokens = 400,
    } = body;

    if (!process.env.OPENROUTER_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing OPENROUTER_API_KEY" }), { status: 500 });
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "No messages provided" }), { status: 400 });
    }

    console.log("➡️ Sending to OpenRouter:", messages.map((m) => m.role));

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
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

    const raw = await response.text();
    let data;

    try {
      data = JSON.parse(raw);
    } catch {
      console.error("❌ Failed to parse OpenRouter response:", raw);
      return new Response(
        JSON.stringify({ error: "Invalid response from OpenRouter", raw }),
        { status: 502 }
      );
    }

    console.log("✅ OpenRouter reply received");

    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
      status: response.ok ? 200 : response.status,
    });
  } catch (err) {
    console.error("❌ Serverless function error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
