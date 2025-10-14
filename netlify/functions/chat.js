// netlify/functions/chat.js
export default async (event) => {
  try {
    // Read body safely
    const rawBody = typeof event.body === "string" ? event.body : JSON.stringify(event.body || {});
    if (!rawBody || rawBody === "{}") {
      const content = "I didn’t receive any input. Please ask your Mechanical Engineering question again.";
      return new Response(JSON.stringify({ choices: [{ message: { role: "assistant", content } }] }), {
        headers: { "Content-Type": "application/json" },
        status: 200
      });
    }

    let body;
    try {
      body = JSON.parse(rawBody);
    } catch {
      const content = "Your request wasn’t valid JSON. Please try again.";
      return new Response(JSON.stringify({ choices: [{ message: { role: "assistant", content } }] }), {
        headers: { "Content-Type": "application/json" },
        status: 200
      });
    }

    const { messages, model = "openai/gpt-4o-mini", max_tokens = 400, temperature = 0.6 } = body || {};

    if (!process.env.OPENROUTER_API_KEY) {
      const content = "Server is missing OPENROUTER_API_KEY. Set it in Netlify → Site settings → Environment variables.";
      return new Response(JSON.stringify({ choices: [{ message: { role: "assistant", content } }] }), {
        headers: { "Content-Type": "application/json" },
        status: 200
      });
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      const content = "No messages were provided. Please ask your Mechanical Engineering query again.";
      return new Response(JSON.stringify({ choices: [{ message: { role: "assistant", content } }] }), {
        headers: { "Content-Type": "application/json" },
        status: 200
      });
    }

    // Call OpenRouter
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

    const raw = await upstream.text();

    // Try to parse normal response
    try {
      const data = JSON.parse(raw);
      // Even if upstream errored, try to surface a readable message
      if (!upstream.ok) {
        const content =
          data?.error?.message ||
          "Upstream model error. Please retry your Mechanical Engineering question.";
        return new Response(JSON.stringify({ choices: [{ message: { role: "assistant", content } }] }), {
          headers: { "Content-Type": "application/json" },
          status: 200
        });
      }
      // Success — pass through
      return new Response(JSON.stringify(data), {
        headers: { "Content-Type": "application/json" },
        status: 200
      });
    } catch {
      // Non-JSON from upstream — still respond normally
      const content =
        raw?.slice(0, 400) ||
        "Received an unexpected response from the model. Please try again.";
      return new Response(JSON.stringify({ choices: [{ message: { role: "assistant", content } }] }), {
        headers: { "Content-Type": "application/json" },
        status: 200
      });
    }
  } catch (err) {
    // Last-resort safety net
    const content = `Server error: ${err?.message || "unknown"}. Please try again.`;
    return new Response(JSON.stringify({ choices: [{ message: { role: "assistant", content } }] }), {
      headers: { "Content-Type": "application/json" },
      status: 200
    });
  }
};
