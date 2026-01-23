---
project_name: 'VenteFlash'
user_name: 'Fabrice'
date: '2026-01-23'
sections_completed: ['technology_stack', 'language_rules', 'framework_rules', 'testing_rules', 'quality_rules', 'workflow_rules', 'anti_patterns']
existing_patterns_found: 0
status: 'complete'
rule_count: 43
optimized_for_llm: true
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

- **Monorepo**: Turborepo (`create-turbo@latest`) + **pnpm** (standard).
- **Frontend**: Next.js App Router (latest stable via `create-next-app@latest`), React, Tailwind, shadcn/ui.
- **Backend**: Node.js + TypeScript (API route handlers Next + worker Node).
- **DB**: PostgreSQL (Supabase).
- **ORM**: Prisma **7.3.0** + Prisma Client **7.3.0**.
- **Validation**: Zod **4.3.6**.
- **Auth**: Supabase Auth (email + OTP, password fallback).
- **Storage**: Supabase Storage (URLs signées time‑limited).
- **WhatsApp Provider (MVP)**: Twilio WhatsApp (webhooks entrants + API sortante).
- **Worker**: jobs DB queue + retries + DLQ (Postgres tables).
- **Monitoring**: Sentry (web + worker), PostHog (analytics).
- **Infra**: Vercel (web/API), Railway/Render (worker).
- **Node constraint**: Node **20+** requis (Prisma + Supabase CLI).

## Critical Implementation Rules

### Language-Specific Rules

- TypeScript strict ; pas de `any` non justifié.
- Async/await partout (pas de `.then()` mélangé).
- Erreurs : toujours `throw` avec code métier + message clair.
- Ne jamais logger des secrets/PII (tokens, numéros complets).
- Utiliser `packages/config/env.ts` pour valider toutes les env vars.

### Framework-Specific Rules

- App Router obligatoire (pas de Pages Router).
- API Routes sous `app/api/**/route.ts` uniquement.
- React Query pour data serveur ; Zustand pour état UI local.
- Live Board : polling adaptatif (2s live / 5–10s hors live).
- Components React en kebab-case fichiers, export nommés.

### Testing Rules

- Tests co‑locatés `*.test.ts(x)` près des modules.
- `tests/e2e` = Playwright (web).
- `tests/api` = tests contract API (supertest/fetch).
- Tester RLS : au moins 1 test API multi‑tenant.
- Mocks : isoler WhatsApp provider (Twilio) via `packages/whatsapp` mocks.

### Code Quality & Style Rules

- DB snake_case, JSON camelCase (mapping Prisma `@map` / `@@map`).
- REST endpoints pluriels (`/api/orders`, `/api/live-items`).
- Dates JSON en ISO 8601 UTC.
- Errors standard: `{ error: { code, message, details?, requestId } }`.
- No business logic inside route handlers -> utiliser `lib/domain/*`.

### Development Workflow Rules

- Monorepo pnpm : `apps/web`, `apps/worker`, `packages/*`.
- Lancer dev via `turbo dev`.
- Envs séparées (Vercel dev/preview/prod + worker envs).
- Ne jamais committer de `.env` (utiliser `.env.example`).

### Critical Don't-Miss Rules

- **Séparation ItemLive vs Commande** : ne jamais mélanger leurs statuts.
- **Idempotence webhooks** obligatoire (`processed_events`).
- **RLS Supabase activé** + tests multi‑tenant.
- **Queue jobs**: `jobs/outbox_messages/dead_letter` (max 5 retries).
- **Twilio WhatsApp** encapsulé dans `packages/whatsapp` (pas d’appels directs).
- **STOP opt‑out** : bloquer messages non essentiels.

---

## Usage Guidelines

**For AI Agents:**
- Lire ce fichier avant d’implémenter du code.
- Suivre toutes les règles exactement.
- En cas de doute, choisir l’option la plus restrictive.
- Mettre à jour ce fichier si de nouveaux patterns apparaissent.

**For Humans:**
- Garder le document lean et orienté agents.
- Mettre à jour lors des changements de stack/patterns.
- Revoir trimestriellement pour retirer les règles devenues évidentes.

Last Updated: 2026-01-23
