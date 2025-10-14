// Serverless proxy to OpenRouter. Do NOT put API keys in client code.
// Set OPENROUTER_API_KEY in Netlify > Site settings > Environment variables.
export default async (event) => {
  try {
    const { messages, model = "openai/gpt-4o-mini", max_tokens = 350 } = JSON.parse(event.body || "{}")

    if (!process.env.OPENROUTER_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing OPENROUTER_API_KEY" }), { status: 500 })
    }

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
        top_p: 0.9
      })
    })

    const data = await r.json()
    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
      status: r.ok ? 200 : r.status
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 })
  }
}
