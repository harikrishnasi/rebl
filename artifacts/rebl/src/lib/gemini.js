export async function callGeminiAPI(prompt, systemPrompt) {
  const apiKey = (import.meta.env.VITE_GEMINI_API_KEY || '').trim()
  if (!apiKey) throw new Error('Gemini API key is not configured.')

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: systemPrompt ? { parts: [{ text: systemPrompt }] } : undefined,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 800 },
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    const msg = data?.error?.message || `Gemini error ${response.status}`
    console.error('[gemini] API error:', msg, data)
    throw new Error(msg)
  }

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) {
    console.error('[gemini] Unexpected response shape:', data)
    throw new Error('No content returned from Gemini.')
  }

  return text
}
