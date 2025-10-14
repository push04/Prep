// Secure serverless proxy to OpenRouter
// Uses OPENROUTER_API_KEY from Netlify environment variables

export default async (event) => {
  try {
    // 🧠 Handle both string and object bodies safely
    let body = {};
    if (typeof event.body === "string") {
      try {
        body = JSON.parse(event.body);
      } catch (err) {
        console.error("JSON parse error:", err);
      }
    } else if (typeof event.body === "object" && event.body !== null) {
      body = event.body;
    }

    const {
      messages = [],
      model = "openai/gpt-4o-mini",
      max_tokens = 350,
    } = body || {};

    if (!process.env.OPENROUTER_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Missing OPENROUTER_API_KEY" }),
        { status: 500 }
      );
    }

    // Fallback message if messages array is empty
    const finalMessages =
      messages && messages.length
        ? messages
        : [{ role: "user", content: "Hello from Netlify!" }];

    console.log("Final messages to send:", finalMessages);

    const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: finalMessages,
        temperature: 0.6,
        max_tokens,
        top_p: 0.9,
      }),
    });

    const data = await r.json();

    if (!r.ok) {
      console.error("OpenRouter error:", data);
      return new Response(JSON.stringify({ error: data }), { status: r.status });
    }

    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e) {
    console.error("Serverless function error:", e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
