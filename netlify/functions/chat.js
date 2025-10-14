// netlify/functions/chat.js
export default async (event) => {
  try {
    const rawBody = typeof event.body === "string" ? event.body : JSON.stringify(event.body || {});
    if (!rawBody || rawBody === "{}") {
      const content = "Please re-ask your Mechanical Engineering question.";
      return new Response(JSON.stringify({ choices: [{ message: { role: "assistant", content } }] }), {
        headers: { "Content-Type": "application/json" }, status: 200
      });
    }

    let body;
    try { body = JSON.parse(rawBody); }
    catch { 
      const content = "Request wasn’t valid JSON. Try again.";
      return new Response(JSON.stringify({ choices: [{ message: { role: "assistant", content } }] }), {
        headers: { "Content-Type": "application/json" }, status: 200
      });
    }

    const { messages, model = "openai/gpt-4o-mini", max_tokens = 400, temperature = 0.6 } = body || {};

    if (!process.env.OPENROUTER_API_KEY) {
      const content = "Server missing OPENROUTER_API_KEY. Add it in Netlify env.";
      return new Response(JSON.stringify({ choices: [{ message: { role: "assistant", content } }] }), {
        headers: { "Content-Type": "application/json" }, status: 200
      });
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      const content = "No messages provided. Please re-ask your question.";
      return new Response(JSON.stringify({ choices: [{ message: { role: "assistant", content } }] }), {
        headers: { "Content-Type": "application/json" }, status: 200
      });
    }

    const upstream = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model, messages, temperature, max_tokens, top_p: 0.9 }),
    });

    const raw = await upstream.text();

    try {
      const data = JSON.parse(raw);
      if (!upstream.ok) {
        const content = data?.error?.message || "The model returned an error. Please retry.";
        return new Response(JSON.stringify({ choices: [{ message: { role: "assistant", content } }] }), {
          headers: { "Content-Type": "application/json" }, status: 200
        });
      }
      return new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json" }, status: 200 });
    } catch {
      const content = raw?.slice(0, 400) || "Unexpected response from the model. Please try again.";
      return new Response(JSON.stringify({ choices: [{ message: { role: "assistant", content } }] }), {
        headers: { "Content-Type": "application/json" }, status: 200
      });
    }
  } catch (err) {
    const content = `Server error: ${err?.message || "unknown"}. Try again.`;
    return new Response(JSON.stringify({ choices: [{ message: { role: "assistant", content } }] }), {
      headers: { "Content-Type": "application/json" }, status: 200
    });
  }
};
