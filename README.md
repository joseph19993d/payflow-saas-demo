# PayFlow SaaS Demo

Mini SaaS demonstrativo que eu criei para mostrar um fluxo profissional de
pagamento com Next.js, TypeScript, PostgreSQL, Prisma e Mercado Pago Checkout
Pro.

O objetivo nao e ser um produto comercial completo. O foco e demonstrar maturidade
tecnica em um fluxo real de planos: cadastro, login, checkout,
webhook validado, idempotencia, persistencia em banco e ativacao automatica da
assinatura apos confirmacao do provedor.

## Stack

- Next.js App Router
- TypeScript
- TailwindCSS
- PostgreSQL
- Prisma ORM
- Mercado Pago Checkout Pro
- JWT em cookie httpOnly
- Bcrypt para hash de senha
- Zod para validacao de entrada

## Funcionalidades

- Landing page do meu case tecnico.
- Cadastro e login com email e senha.
- Dashboard protegido com planos Free, Pro e Business.
- Checkout pago iniciado diretamente pelo dashboard.
- Retorno do checkout com mensagem centralizada no dashboard.
- Rota server-side `/api/checkout`.
- Webhook em `/api/webhooks/mercadopago`.
- Seed com planos iniciais.
- `.env.example` sem credenciais reais.

## Arquitetura

```text
src/
  app/
    api/
      auth/
      checkout/
      payments/
      webhooks/mercadopago/
    checkout/
    dashboard/
    login/
    register/
  components/
  lib/
    auth.ts
    mercado-pago.ts
    payments.ts
    plans.ts
    prisma.ts
prisma/
  schema.prisma
  seed.ts
```

As regras sensiveis ficam em `/lib`. Componentes React apenas exibem dados ou
chamam endpoints. O Access Token do Mercado Pago nunca e enviado para o frontend.

## Modelagem

O schema Prisma possui:

- `User`: usuario autenticado por email e senha.
- `Plan`: catalogo de planos disponiveis.
- `Payment`: tentativa de pagamento e estado vindo do Mercado Pago.
- `Subscription`: assinatura atual do usuario.
- `WebhookEvent`: eventos recebidos para idempotencia e auditoria.

## Fluxo de checkout

```mermaid
sequenceDiagram
  participant U as Usuario
  participant UI as Next.js UI
  participant API as /api/checkout
  participant MP as Mercado Pago
  participant DB as PostgreSQL

  U->>UI: Escolhe plano Pro ou Business
  UI->>API: POST /api/checkout
  API->>API: Valida sessao e entrada
  API->>DB: Busca plano ativo
  API->>MP: Cria preference Checkout Pro
  API->>DB: Salva Payment PENDING
  API-->>UI: Retorna checkoutUrl
  UI-->>MP: Redireciona para pagamento
```

O redirect de sucesso do Mercado Pago nao ativa a assinatura. Ele apenas melhora a
experiencia do usuario. A fonte real de confirmacao e o webhook.

## Fluxo de webhook

```mermaid
sequenceDiagram
  participant MP as Mercado Pago
  participant WH as /api/webhooks/mercadopago
  participant API as Mercado Pago API
  participant DB as PostgreSQL

  MP->>WH: Notificacao com x-signature
  WH->>WH: Valida HMAC, timingSafeEqual e janela do ts
  WH->>DB: Registra WebhookEvent unico
  WH->>API: Consulta pagamento oficial
  API-->>WH: Retorna status real
  WH->>DB: Atualiza Payment
  WH->>DB: Ativa Subscription se APPROVED
```

Implementacoes importantes:

- Validacao de assinatura via `x-signature`.
- Protecao contra replay por janela de timestamp no `ts`.
- Uso do header `x-request-id`.
- Uso de `data.id` da query string na manifest string.
- Idempotencia por `WebhookEvent.provider` + `WebhookEvent.externalEventId`.
- Consulta ao pagamento no Mercado Pago antes de confiar no payload.
- Transacao Prisma ao atualizar pagamento e assinatura.
- Persistencia apenas de payload sanitizado em `Payment.rawPayload`.

Referencias oficiais usadas:

- [Criar preferencia Checkout Pro](https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/create-payment-preference)
- [Webhooks Mercado Pago](https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks)

## Variaveis de ambiente

Crie um `.env` a partir do `.env.example`:

```bash
cp .env.example .env
```

```env
DATABASE_URL="postgresql://payflow:payflow123@localhost:5432/payflow_demo"
APP_URL="http://localhost:3000"
SESSION_SECRET="change-me-for-a-strong-local-secret-with-at-least-32-chars"
MERCADO_PAGO_ACCESS_TOKEN="TEST-your-access-token"
NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY="TEST-your-public-key"
MERCADO_PAGO_WEBHOOK_SECRET="your-webhook-secret"
```

`NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY` pode ser exposta no navegador.  
`MERCADO_PAGO_ACCESS_TOKEN` e `MERCADO_PAGO_WEBHOOK_SECRET` devem permanecer
somente no servidor.

## Como rodar localmente

Instale dependencias:

```bash
npm install
```

Copie as variaveis de ambiente:

```bash
cp .env.example .env
```

No Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Suba o PostgreSQL com Docker:

```bash
npm run db:up
```

Aplique as migrations:

```bash
npm run db:migrate
```

Cadastre os planos iniciais:

```bash
npm run db:seed
```

Gere o Prisma Client, se necessario:

```bash
npm run prisma:generate
```

Inicie a aplicacao:

```bash
npm run dev
```

Acesse `http://localhost:3000`.

Para testar webhooks em desenvolvimento local, exponha a aplicacao com ngrok:

```bash
ngrok http 3000
```

Use a URL HTTPS gerada pelo ngrok no Mercado Pago Developers:

```text
https://sua-url-ngrok/api/webhooks/mercadopago
```

Depois configure as credenciais de teste e o segredo do webhook no `.env`.

Nunca versione o arquivo `.env`.

## Rodando com PostgreSQL via Docker

O projeto inclui um `docker-compose.yml` apenas para o banco PostgreSQL. A
aplicacao Next.js continua rodando diretamente na maquina com `npm run dev`.

Copie o arquivo de exemplo:

```bash
cp .env.example .env
```

No Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Suba o PostgreSQL:

```bash
npm run db:up
```

Aplique as migrations:

```bash
npm run db:migrate
```

Rode o seed:

```bash
npm run db:seed
```

Inicie a aplicacao:

```bash
npm run dev
```

O Docker Compose usa:

- Imagem `postgres:16-alpine`.
- Banco `payflow_demo`.
- Usuario `payflow`.
- Senha `payflow123`.
- Porta local `5432`.
- Volume persistente `payflow_postgres_data`.
- Healthcheck com `pg_isready`.

Persistencia dos dados:

- `npm run db:down` para o container sem apagar os dados.
- `docker compose down -v` apaga o volume e remove os dados.
- `npm run db:reset` apaga o volume, recria o banco, aplica migrations e roda seed.

## Teste com sandbox do Mercado Pago

1. Crie uma aplicacao no Mercado Pago Developers.
2. Use credenciais de teste.
3. Configure `MERCADO_PAGO_ACCESS_TOKEN` com o Access Token de teste.
4. Configure `NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY` com a Public Key de teste.
5. Exponha o ambiente local com uma URL publica, por exemplo usando ngrok.
6. Configure o webhook para:

```text
https://sua-url-publica/api/webhooks/mercadopago
```

7. Copie o segredo de webhook para `MERCADO_PAGO_WEBHOOK_SECRET`.
8. Crie uma conta, escolha um plano pago e finalize o pagamento em sandbox.
9. Confira `/dashboard`.

Importante:

- Use credenciais de teste do Mercado Pago durante o desenvolvimento.
- Configure o webhook no mesmo ambiente das credenciais usadas.
- O ngrok e apenas uma ponte local para receber notificacoes externas.

## Telas

- `/`: landing page compacta do meu case tecnico.
- `/login`: autenticacao por email e senha.
- `/register`: criacao de conta com plano Free inicial.
- `/dashboard`: planos, checkout, assinatura atual e ultimo pagamento.
- `/checkout/success`, `/checkout/pending` e `/checkout/failure`: retornos do
  Mercado Pago que redirecionam para o dashboard com uma mensagem clara.

## Cuidados de seguranca

- Senhas sao salvas com hash Bcrypt.
- Sessao usa cookie httpOnly com JWT assinado.
- APIs validam entrada com Zod.
- Access Token do Mercado Pago fica apenas no backend.
- Webhook exige assinatura valida e timestamp recente.
- Evento duplicado nao reprocessa a mesma notificacao por provider + chave externa.
- Pagamento aprovado so ativa assinatura se metadata, valor, moeda e referencia local forem consistentes.
- Payload salvo em `Payment.rawPayload` e sanitizado para evitar dados pessoais desnecessarios.
- A assinatura so e ativada apos consulta server-side ao pagamento oficial.

## Limitacoes conhecidas da demo

- Nao e uma implementacao completa de cobranca recorrente nativa.
- A assinatura e controlada internamente apos pagamento aprovado.
- Ngrok e apenas para desenvolvimento local.
- Um ambiente de producao exigiria dominio HTTPS fixo e banco gerenciado.

## Padrao de commits e hooks

O projeto usa Husky, lint-staged, Prettier e commitlint para manter um padrao
profissional antes do codigo chegar ao GitHub.

As mensagens de commit seguem Conventional Commits. Exemplos validos:

```bash
feat: add mercado pago checkout flow
fix: handle duplicated webhook events
docs: update local setup instructions
chore: configure git hooks
refactor: improve payment status mapping
```

Hooks configurados:

- `pre-commit`: roda `lint-staged`, aplicando Prettier nos arquivos alterados e
  ESLint com `--fix` em arquivos `ts` e `tsx`.
- `commit-msg`: valida a mensagem do commit com commitlint.
- `pre-push`: roda `npm run lint`, `npm run typecheck` e `npm run build`.

Os hooks nao executam Docker, migrations, seed ou qualquer comando que dependa do
PostgreSQL. A ideia e manter o commit rapido e deixar verificacoes completas para
o push.

Para corrigir problemas de formatacao ou lint manualmente:

```bash
npm run format
npm run lint
```

Para apenas verificar formatacao:

```bash
npm run format:check
```

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run typecheck
npm run format
npm run format:check
npm run lint-staged
npm run prisma:generate
npm run prisma:migrate
npm run prisma:studio
npm run db:up
npm run db:down
npm run db:reset
npm run db:migrate
npm run db:seed
npm run db:studio
```

## Status do projeto

Projeto de portfolio pronto para evoluir. Possiveis melhorias futuras:

- Testes automatizados para autenticacao, checkout e webhook.
- Tela administrativa para listar eventos de webhook.
- Captura de screenshots reais para o README.
