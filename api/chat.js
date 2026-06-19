// api/chat.js
// Proxy seguro para a API do Google Gemini.
// A chave GEMINI_API_KEY fica no arquivo .env.local (nunca vai ao GitHub).

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'GEMINI_API_KEY não encontrada. Verifique o arquivo .env.local.',
    });
  }

  const { system, messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Campo "messages" inválido.' });
  }

  // Gemini usa "contents" com roles "user" e "model" (não "assistant")
  const contents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: system ? { parts: [{ text: system }] } : undefined,
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        },
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const errMsg = errData?.error?.message || `Erro ${response.status}`;

      if (response.status === 400) {
        return res.status(400).json({ error: `Requisição inválida: ${errMsg}` });
      }
      if (response.status === 403) {
        return res.status(403).json({ error: 'Chave de API inválida ou sem permissão. Verifique a GEMINI_API_KEY.' });
      }
      if (response.status === 429) {
        return res.status(429).json({ error: 'Limite de requisições atingido. Aguarde um momento e tente novamente.' });
      }
      return res.status(response.status).json({ error: errMsg });
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    res.status(200).json({ text });

  } catch (err) {
    console.error('Erro ao chamar Gemini:', err);
    res.status(500).json({ error: err.message });
  }
}
