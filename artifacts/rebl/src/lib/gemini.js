// Models tried in order — each has its own free quota bucket
const MODELS = [
  'gemini-1.5-flash',
  'gemini-1.5-flash-8b',
  'gemini-2.0-flash-lite',
  'gemini-2.0-flash',
]

async function tryModel(model, apiKey, prompt, systemPrompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: systemPrompt ? { parts: [{ text: systemPrompt }] } : undefined,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 600 },
    }),
  })
  const data = await response.json()
  if (!response.ok) {
    const msg = data?.error?.message || `Gemini error ${response.status}`
    // 429 = quota exhausted — try next model
    if (response.status === 429 || (data?.error?.code === 429)) {
      return { exhausted: true, msg }
    }
    throw new Error(msg)
  }
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error('No content returned from Gemini.')
  return { text }
}

export async function callGeminiAPI(prompt, systemPrompt) {
  const apiKey = (import.meta.env.VITE_GEMINI_API_KEY || '').trim()
  if (!apiKey) throw new Error('Gemini API key is not configured.')

  let lastErr = 'All models quota-exhausted.'
  for (const model of MODELS) {
    const result = await tryModel(model, apiKey, prompt, systemPrompt)
    if (result.exhausted) { lastErr = result.msg; continue }
    return result.text
  }
  throw new Error('AI is taking a short break — try again in a minute.')
}
