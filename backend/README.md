# ITS Backend — NestJS + MongoDB

## Pré-requisitos
- Node.js 18+
- MongoDB rodando em localhost:27017
  - Windows: baixe em mongodb.com/try/download/community
  - Ou use MongoDB Atlas (nuvem gratuita): mongodb.com/atlas

## Como rodar

### 1. Criar o .env
```cmd
copy .env.example .env
```
Edite o `.env` e coloque sua `GEMINI_API_KEY`.

### 2. Instalar dependências
```cmd
npm install
```

### 3. Compilar
```cmd
npm run build
```

### 4. Iniciar
```cmd
npm start
```

O backend estará em: http://localhost:3001

## Endpoints disponíveis

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | /students | Cria aluno |
| GET | /students/:sessionId/progress | Progresso do aluno |
| PATCH | /students/:sessionId/mastery | Atualiza domínio |
| POST | /assessment/start | Inicia avaliação |
| POST | /assessment/answer | Responde questão |
| GET | /assessment/:id/result | Resultado |
| POST | /chat/message | Envia mensagem ao tutor |
| GET | /chat/history/:sessionId | Histórico do chat |
| GET | /knowledge-graph | Grafo completo |
| GET | /knowledge-graph/student/:sessionId | Grafo do aluno |
