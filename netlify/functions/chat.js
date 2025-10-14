// netlify/functions/chat.js
export default async (event) => {
  try {
    // Safely get raw body (string)
    const rawBody =
      typeof event.body === "string" ? event.body : JSON.stringify(event.body || {});
    if (!rawBody || rawBody === "{}") {
      const content = "I didn’t receive any input. Please re-ask your Mechanical Engineering question.";
      return new Response(JSON.stringify({ choices: [{ message: { role: "assistant", content } }] }), {
        headers: { "Content-Type": "application/json" },
        status: 200
      });
    }

    // Parse JSON
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

    const {
      messages,
      model = "openai/gpt-4o-mini",
      max_tokens = 400,
      temperature = 0.6
    } = body || {};

    if (!process.env.OPENROUTER_API_KEY) {
      const content = "Server is missing OPENROUTER_API_KEY. Set it in Netlify → Site settings → Environment variables.";
      return new Response(JSON.stringify({ choices: [{ message: { role: "assistant", content } }] }), {
        headers: { "Content-Type": "application/json" },
        status: 200
      });
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      const content = "No messages were provided. Please re-ask your Mechanical Engineering question.";
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

    // Try to parse; if not JSON, still return a friendly message
    try {
      const data = JSON.parse(raw);
      if (!upstream.ok) {
        const content =
          data?.error?.message ||
          "The model returned an error. Please retry your Mechanical Engineering question.";
        return new Response(JSON.stringify({ choices: [{ message: { role: "assistant", content } }] }), {
          headers: { "Content-Type": "application/json" },
          status: 200
        });
      }
      // Success passthrough
      return new Response(JSON.stringify(data), {
        headers: { "Content-Type": "application/json" },
        status: 200
      });
    } catch {
      const content = raw?.slice(0, 400) || "Unexpected response from the model. Please try again.";
      return new Response(JSON.stringify({ choices: [{ message: { role: "assistant", content } }] }), {
        headers: { "Content-Type": "application/json" },
        status: 200
      });
    }
  } catch (err) {
    const content = `Server error: ${err?.message || "unknown"}. Please try again.`;
    return new Response(JSON.stringify({ choices: [{ message: { role: "assistant", content } }] }), {
      headers: { "Content-Type": "application/json" },
      status: 200
    });
  }
};
