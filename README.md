# ITS — Sistema Tutor Inteligente para Álgebra Linear
### Modo: Google Gemini · Servidor Node.js local (sem Vercel)

---

## Estrutura do projeto

```
its-algebra-linear/
├── public/
│   └── index.html          ← aplicação frontend
├── api/
│   └── chat.js             ← referência para deploy futuro
├── server.js               ← servidor local (use este para rodar)
├── package.json
├── .env.local              ← VOCÊ CRIA ESSE ARQUIVO
├── .env.local.example      ← modelo do arquivo acima
└── README.md
```

---

## Como rodar (passo a passo)

### 1. Criar o arquivo .env.local

Na pasta do projeto, crie um arquivo chamado `.env.local` com:

```
GEMINI_API_KEY=AIzaSua_chave_aqui
```

Substitua pelo valor real da sua chave do Google AI Studio.
Veja o arquivo `.env.local.example` como referência.

**Como criar pelo terminal (cmd):**
```cmd
echo GEMINI_API_KEY=AIzaSua_chave_aqui > .env.local
```

### 2. Iniciar o servidor

```cmd
node server.js
```

Vai aparecer:
```
  ✓ ITS Álgebra Linear rodando!
  → Acesse: http://localhost:3000
```

### 3. Abrir no navegador

Acesse: **http://localhost:3000**

---

## Para rodar novamente (próximas vezes)

```cmd
cd C:\caminho\para\its-vercel
node server.js
```

---

## Obter a chave Gemini (gratuito)

1. Acesse **aistudio.google.com**
2. Clique em **Get API Key → Create API Key**
3. Copie a chave (começa com `AIza...`)
4. Cole no arquivo `.env.local`

---

## Solução de problemas

| Erro | Causa | Solução |
|------|-------|---------|
| "GEMINI_API_KEY não encontrada" | `.env.local` não existe ou está errado | Crie o arquivo conforme o Passo 1 |
| "Chave inválida" | Chave errada | Gere uma nova em aistudio.google.com |
| "Porta 3000 em uso" | Outro processo usando a porta | Feche o outro processo ou edite `PORT` no server.js |
