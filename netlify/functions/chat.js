// netlify/functions/chat.js
export default async (event) => {
  try {
    // Always read raw text body first
    const rawBody = event.body || "";
    if (!rawBody) {
      console.error("❌ Empty request body");
      return new Response(JSON.stringify({ error: "Empty request body" }), { status: 400 });
    }

    let body;
    try {
      body = JSON.parse(rawBody);
    } catch (err) {
      console.error("❌ JSON parse error:", err);
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400 });
    }

    const { messages, model = "openai/gpt-4o-mini", max_tokens = 400 } = body;

    if (!process.env.OPENROUTER_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing OPENROUTER_API_KEY" }), { status: 500 });
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      console.error("❌ No messages provided:", body);
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

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      console.error("❌ Invalid OpenRouter response:", text);
      return new Response(
        JSON.stringify({ error: "Invalid response from OpenRouter", raw: text }),
        { status: 502 }
      );
    }

    console.log("✅ OpenRouter replied successfully");

    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
      status: response.ok ? 200 : response.status,
    });
  } catch (err) {
    console.error("❌ Serverless function error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
