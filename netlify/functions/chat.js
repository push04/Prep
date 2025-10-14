// Secure serverless proxy to OpenRouter
// Do NOT hardcode API keys — set OPENROUTER_API_KEY in Netlify Environment Variables

export default async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");
    const { messages = [], model = "openai/gpt-4o-mini", max_tokens = 350 } = body;

    if (!process.env.OPENROUTER_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing OPENROUTER_API_KEY" }), { status: 500 });
    }

    // fallback if frontend sends empty messages
    const finalMessages =
      messages && messages.length
        ? messages
        : [{ role: "user", content: "Hello! This is a test from the Netlify function." }];

    console.log("Calling OpenRouter with", finalMessages.length, "messages");

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
    console.log("Response from OpenRouter:", data);

    if (!r.ok) {
      return new Response(JSON.stringify({ error: data }), { status: r.status });
    }

    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e) {
    console.error("Function error:", e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
