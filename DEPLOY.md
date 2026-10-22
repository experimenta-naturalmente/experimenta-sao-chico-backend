# Deploy - Experimenta São Chico (VPS + GitHub Actions)

Guia de infraestrutura para subir MinIO + API + Web no mesmo VPS que já hospeda outro produto, usando a reverse proxy existente.

## 1. Domínios / DNS (registro.br)

Domínio: `experimentasaochico.com.br`. Crie os registros **A** apontando para o IP do VPS:

| Subdomínio | Tipo | Valor | Uso |
| --- | --- | --- | --- |
| `@` (ou `www`) | A | IP_DO_VPS | Web (app Flutter) |
| `api` | A | IP_DO_VPS | API REST (`api.experimentasaochico.com.br`) |
| `minio` | A | IP_DO_VPS | Imagens (S3/MinIO público) |
| `console.minio` (opcional) | A | IP_DO_VPS | Painel do MinIO |

> Propagação de DNS pode levar de minutos a algumas horas.

## 2. Reverse proxy (host)

Você já usa uma reverse proxy no VPS (Nginx Proxy Manager / Traefik / Caddy). Os containers deste stack só escutam em `127.0.0.1`, então basta criar os "proxy hosts" com TLS (Let's Encrypt) apontando para as portas locais:

| Host | Encaminhar para |
| --- | --- |
| `experimentasaochico.com.br` | `127.0.0.1:8082` |
| `api.experimentasaochico.com.br` | `127.0.0.1:8080` |
| `minio.experimentasaochico.com.br` | `127.0.0.1:9000` |
| `console.minio.experimentasaochico.com.br` (opcional) | `127.0.0.1:9001` |

No proxy do MinIO (`minio.*`) aumente o limite de upload (ex.: `client_max_body_size 20m;` no NPM "Advanced").

## 3. Preparar o VPS

```bash
# Docker + Compose plugin já instalados (usados pelo outro produto)
mkdir -p /opt/experimenta && cd /opt/experimenta
# copie o deploy.env.example do repositório para cá como .env e preencha
cp deploy.env.example .env && nano .env
```

Preencha `.env` (ver `deploy.env.example`): imagens do GHCR, credenciais MinIO, `FIREBASE_SERVICE_ACCOUNT` (JSON em uma linha), `MINIO_PUBLIC_URL=https://minio.experimentasaochico.com.br`, `CORS_ORIGINS`, `REQUIRE_AUTH=true`.

O `docker-compose.yml` é enviado automaticamente pelo workflow de deploy para `VPS_APP_DIR` (ex.: `/opt/experimenta`).

### Imagens no GHCR

Deixe os pacotes `experimenta-saochico-api` e `experimenta-saochico-web` **públicos** (GitHub > Packages > Package settings > Change visibility) OU faça login do Docker no GHCR dentro do VPS:

```bash
echo <PAT_com_read:packages> | docker login ghcr.io -u SEU_USUARIO --password-stdin
```

## 4. Secrets do GitHub Actions

No repo do **backend** (`experimenta-saochico-api`):

| Secret | Descrição |
| --- | --- |
| `VPS_HOST` | IP/host do VPS |
| `VPS_USER` | usuário SSH |
| `VPS_SSH_KEY` | chave privada SSH (deploy key) |
| `VPS_APP_DIR` | diretório no VPS (ex.: `/opt/experimenta`) |

`GITHUB_TOKEN` (automático) publica a imagem da API no GHCR.

No repo **mobile** (`mobile-experimenta-naturalmente`):

| Secret | Descrição |
| --- | --- |
| `API_URL` | `https://api.experimentasaochico.com.br/` |
| `GOOGLE_MAPS_API_KEY` | chave do Google Maps |

## 5. Fluxo de deploy

1. Push na `main` do repo mobile -> `build-web.yml` builda e publica `experimenta-saochico-web:latest` no GHCR.
2. Push na `main` do repo backend -> `deploy.yml` builda/publica `experimenta-saochico-api:latest`, copia o `docker-compose.yml` para o VPS e roda `docker compose pull && docker compose up -d`.
3. A reverse proxy do host serve os subdomínios com TLS.

## 6. Validação pós-deploy

```bash
curl https://api.experimentasaochico.com.br/health          # {"status":"ok"}
curl https://api.experimentasaochico.com.br/category         # lista de categorias
# upload (com token válido, se REQUIRE_AUTH=true):
curl -F "file=@foto.jpg" -H "Authorization: Bearer <ID_TOKEN>" \
  https://api.experimentasaochico.com.br/upload
```

A URL retornada pelo upload deve começar com `https://minio.experimentasaochico.com.br/<bucket>/uploads/...` e abrir no navegador.
