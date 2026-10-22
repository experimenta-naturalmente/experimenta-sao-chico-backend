# Experimenta São Chico - API

Backend em Node.js + Express + TypeScript que serve os dados do app (Firestore) e as imagens (MinIO).

## Requisitos

- Node.js 20+
- Uma service account do Firebase (Firestore) do projeto
- MinIO acessível (endpoint S3)

## Configuração

1. Copie `.env.example` para `.env` e preencha as variáveis.
2. Credenciais do Firebase: cole o JSON da service account em `FIREBASE_SERVICE_ACCOUNT` (uma linha) ou aponte `GOOGLE_APPLICATION_CREDENTIALS` para um arquivo.
3. Instale as dependências: `npm install`.

## Rodando

- Desenvolvimento: `npm run dev`
- Build: `npm run build` e depois `npm start`

## Endpoints

- `GET /health`
- `GET /category`
- `GET /category/:id/tags`
- `GET /tag`
- `GET /spot` e `GET /spot?profileId=:id`
- `GET /spot/:id`
- `POST /spot` (protegido; payload do cadastro do app)
- `GET /event`, `GET /event/:id`, `POST /event` (protegido)
- `GET /route`, `GET /route/:id`
- `GET /users/:id`
- `POST /upload` (multipart, campo `file`, protegido) -> `{ "url": "..." }`

As rotas de escrita exigem `Authorization: Bearer <Firebase ID token>` quando `REQUIRE_AUTH=true`.

## Coleções esperadas no Firestore

`categories`, `tags`, `spots`, `events`, `routes`, `users`. Os documentos seguem o mesmo formato retornado pelos endpoints (ver `src/mappers.ts`). O banco já é populado externamente (sem seed).

## Docker

`docker build -t experimenta-api .` e rode com as variáveis de ambiente do `.env`. Em produção use o `docker-compose.yml` na raiz do deploy (MinIO + backend + web).
