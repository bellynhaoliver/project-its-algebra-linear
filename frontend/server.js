// server.js — servidor local simples, substitui o "npx vercel dev"
// Não precisa de conta Vercel para rodar localmente.

const http = require('http');
const fs   = require('fs');
const path = require('path');

// Lê o .env.local manualmente
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const [key, ...rest] = line.trim().split('=');
    if (key && rest.length) process.env[key] = rest.join('=').trim();
  });
}

const PORT = 3000;

async function handleChat(req, res) {
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', async () => {
    try {
      const { system, messages } = JSON.parse(body);
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'GEMINI_API_KEY não encontrada no .env.local' }));
      }

      const model   = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
      const url     = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const contents = messages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

      const geminiRes = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: system ? { parts: [{ text: system }] } : undefined,
          contents,
          generationConfig: { temperature: 0.7, maxOutputTokens: 1000 },
        }),
      });

      const data = await geminiRes.json();

      if (!geminiRes.ok) {
        const msg = data?.error?.message || `Erro ${geminiRes.status}`;
        res.writeHead(geminiRes.status, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: msg }));
      }

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ text }));

    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
  });
}

function serveFile(res, filePath, contentType) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  // CORS para desenvolvimento
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }

  if (req.method === 'POST' && req.url === '/api/chat') {
    return handleChat(req, res);
  }

  // Arquivos estáticos
  const publicDir = path.join(__dirname, 'public');
  let filePath = req.url === '/' ? '/index.html' : req.url;
  filePath = path.join(publicDir, filePath);

  const ext = path.extname(filePath);
  const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.json': 'application/json' };
  serveFile(res, filePath, types[ext] || 'text/plain');
});

server.listen(PORT, () => {
  console.log('');
  console.log('  ✓ ITS Álgebra Linear rodando!');
  console.log(`  → Acesse: http://localhost:${PORT}`);
  console.log('');
  console.log('  Para parar: Ctrl + C');
  console.log('');
});
