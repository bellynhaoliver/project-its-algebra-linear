# ITS — Sistema Tutor Inteligente para Álgebra Linear

Sistema desenvolvido para a Unidade 3 da disciplina de Sistemas Tutores Inteligentes.
O tutor cobre os conteúdos de Matrizes e Vetores, avalia o conhecimento do aluno e adapta as explicações ao seu nível de domínio.

## Integrantes

- Isabelly
- Gustavo
- Luiz Gustavo

## Tecnologias

- Frontend: HTML, CSS, JavaScript, MathJax
- Backend: NestJS, TypeScript
- Banco de dados: MongoDB
- IA: Google Gemini 2.5 Flash

## Pré-requisitos

- Node.js 18 ou superior
- MongoDB instalado e rodando
- Chave da API do Google Gemini (gratuita em aistudio.google.com)

## Como rodar

### 1. Clone o repositório

git clone https://github.com/bellynhaoliver/project-its-algebra-linear.git
cd project-its-algebra-linear

### 2. Configure o backend

cd backend
copy .env.example .env

Abra o arquivo .env e coloque sua chave do Gemini no campo GEMINI_API_KEY.

npm install
npm run build
npm start

O backend vai rodar em http://localhost:3001

### 3. Configure o frontend

Abra outro terminal:

cd frontend
node server.js

O frontend vai rodar em http://localhost:3000

### 4. Inicie o MongoDB

Abra outro terminal e execute:

mongod

### 5. Acesse o sistema

Abra o navegador em http://localhost:3000

## Variáveis de ambiente

Crie o arquivo .env dentro da pasta backend com base no .env.example:

PORT=3001
MONGODB_URI=mongodb://localhost:27017/its_algebra
GEMINI_API_KEY=sua_chave_aqui
GEMINI_MODEL=gemini-2.5-flash

## Observações

- O arquivo .env nunca deve ser enviado ao GitHub
- O arquivo .env.local dentro do frontend também não deve ser enviado
- Cada integrante precisa criar seu próprio .env com sua chave do Gemini
