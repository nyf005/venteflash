# VenteFlash

Monorepo Turborepo pour VenteFlash (apps web + worker + packages partages).

## Prerequis

- Node 20+
- pnpm (via Corepack recommande)

## Quick start

```sh
pnpm install
pnpm dev
pnpm lint
```

## Apps et packages

- `apps/web`: Next.js App Router
- `apps/worker`: worker Node/TypeScript
- `packages/config`: validation des env vars
- `packages/shared`: schemas/types partages
- `packages/db`: acces DB/Prisma (a venir)
- `packages/whatsapp`: integration WhatsApp (a venir)
- `packages/ui`: UI partagee
- `packages/eslint-config`: configs ESLint
- `packages/typescript-config`: configs TypeScript

## Reference setup

```sh
pnpm dlx create-turbo@latest
```
