---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments:
  - /Users/fabricendri/Developer/VenteFlash/_bmad-output/planning-artifacts/product-brief-VenteFlash-2026-01-23.md
  - /Users/fabricendri/Developer/VenteFlash/_bmad-output/planning-artifacts/prd.md
  - /Users/fabricendri/Developer/VenteFlash/_bmad-output/planning-artifacts/prd-validation-report.md
  - /Users/fabricendri/Developer/VenteFlash/_bmad-output/planning-artifacts/ux-design-specification.md
workflowType: 'architecture'
project_name: 'VenteFlash'
user_name: 'Fabrice'
date: '2026-01-23'
lastStep: 8
status: 'complete'
completedAt: '2026-01-23'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
- Bot WhatsApp + intents guidés (commande, réservation live, suivi, handoff).
- State machine live (réservation atomique, file d’attente, expiration).
- Commandes structurées + statuts + notifications.
- Livraison par commune/quartier + recalcul frais.
- Preuve de paiement + validation manuelle.
- Dashboard ops (pipeline live, preuves, statuts).
- Multi‑tenant SaaS + RBAC + audit trail.

**Non-Functional Requirements:**
- Latence P95 (bot < 3s), uptime ≥ 99.5%, idempotence webhooks.
- Atomicité réservation, notifications < 10s.
- Délivrabilité WhatsApp (échecs < 1%).
- Observabilité (logs, alerts, file d’erreurs).
- Sécurité multi‑tenant + audit.

**Scale & Complexity:**
- Primary domain: SaaS B2B + messaging ops.
- Complexity level: **medium**.
- Estimated architectural components: 6–8 (API, bot service, order service, live allocation service, queue/worker, dashboard, storage/media, observability).

### Technical Constraints & Dependencies
- WhatsApp = UI principale client, dashboard = console ops.
- Pics live + multi‑tenant → besoin de fiabilité et d’anti‑doublons.
- Preuve paiement = stockage média + audit.
- Intégrations futures : paiement via lien, coursiers.

### Cross-Cutting Concerns Identified
- **Séparation ItemLive vs Commande** : éviter la confusion d’états et litiges.
- **Event‑driven + queue/workers** : gérer pics live, retries, idempotence.
- **Observabilité + audit trail** : traçabilité, support litiges.
- **Permissioning & isolation** : strict multi‑tenant.

## Starter Template Evaluation

### Primary Technology Domain
**Full‑stack web (Next.js + Node worker) en monorepo** basé sur les contraintes live + multi‑tenant + jobs async.

### Starter Options Considered
1) **create-turbo@latest (Turborepo)**
   - ✅ Monorepo natif
   - ✅ Support multi‑apps (web + worker)
   - ✅ Compatible Next.js + pnpm workspaces
2) **create-next-app@latest (single app)**
   - ✅ Rapide pour un POC
   - ❌ Moins adapté au worker + packages partagés

### Selected Starter: create-turbo@latest

**Rationale for Selection:**
- Monorepo exigé (apps/web + apps/worker + packages/shared).
- Le template Turborepo inclut déjà Next.js → on adapte apps/web plutôt que recréer.
- Prépare une base propre pour worker async (expirations, retries WhatsApp).

**Standard package manager:** **pnpm**

**Initialization Command (recommandé):**
```bash
pnpm dlx create-turbo@latest
```

**shadcn/ui (apps/web):**
```bash
pnpm dlx shadcn@latest init
```

**Supabase local (Node 20+ si via npx):**
```bash
npx supabase init
npx supabase start
```

**Prisma (Postgres):**
```bash
npx prisma init --datasource-provider postgresql
```

### Alternative (si le template turbo ne fournit pas l’app souhaitée)
```bash
npx create-next-app@latest --ts --tailwind --app --src-dir
```

### Architectural Decisions Provided by Starter
**Language & Runtime:** TypeScript + Node.js
**Styling Solution:** Tailwind CSS
**Build Tooling:** Next.js + Turborepo pipelines
**Testing Framework:** à définir (Vitest/Jest)
**Code Organization:** monorepo (`apps/web`, `apps/worker`, `packages/shared`)
**Development Experience:** pnpm workspaces + turbo dev

**Worker & jobs:** expirations, retries WhatsApp, envois sortants, DLQ/queue.

## Core Architectural Decisions

### Decision Priority Analysis
**Critical Decisions (Block Implementation):**
- Postgres + Prisma (migrations, schemas).
- Séparation ItemLive vs Commande (domain).

**Important Decisions (Shape Architecture):**
- Validation Zod + contraintes DB multi-tenant.
- Stockage médias preuves via Supabase Storage.

**Deferred Decisions (Post-MVP):**
- Redis/queue centralisée (si besoin de scale).

### Data Architecture
**Database:** PostgreSQL (Supabase managed).
**ORM & Migrations:** Prisma Migrate (version 7.3.0). SQL manuel exceptionnel, intégré via migrations.
**Data Modeling:** séparation stricte ItemLive vs Commande ; clés composites multi-tenant (ex: `tenantId + code`).
**Validation:** Zod (version 4.3.6) côté API + contraintes Prisma/DB (`@unique`, `@index`, FK, enums, checks).
**DB ↔ API Mapping:** DB en snake_case, mapping Prisma via `@map` / `@@map` si nécessaire ; JSON en camelCase.
**Caching:** MVP sans Redis ; cache in‑memory optionnel (TTL court) pour config tenant (durée réservation, grille livraison).
**Media Storage:** Supabase Storage + URLs signées time‑limited, contrôle d’accès par tenant.

### Decision Impact Analysis
**Implementation Sequence:**
1. Modéliser ItemLive / Commande / Paiement / Client.
2. Définir migrations Prisma + contraintes multi‑tenant.
3. Ajouter schémas Zod partagés (packages/shared).
4. Intégrer Storage Supabase pour preuves.

**Cross-Component Dependencies:**
- Modèle ItemLive ↔ Commande impacte state machine + notifications.
- Storage preuves impacte API, dashboard, audit trail.

### Authentication & Security
**Auth Provider:** Supabase Auth (MVP), modes email + OTP, mot de passe en fallback.
**Tenant Access Control:** `tenantId` obligatoire sur toutes ressources + guard middleware (user → tenantId → rôle).
**DB Security:** RLS activé dès MVP (policies basées sur `auth.uid()` + table memberships).
**Uniqueness Rules:** clés composites (ex: `tenantId + code`, `tenantId + orderNumber`).
**API Security:** rate limiting par tenant + IP (webhooks, actions live, auth).
**Secrets & Env:** variables d’env (Vercel + worker host), rotation light, jamais de tokens/PII dans logs.
**Storage Security:** Supabase Storage avec policies + URLs signées time‑limited, accès restreint au tenant.
**Audit & Compliance:** audit log obligatoire pour actions sensibles (paiement, annulation, changement statut, modification total/adresse).

### API & Communication Patterns
**API Style:** REST via Next route handlers (App Router), surface d’intégration simple pour webhooks et outils externes.
**Webhooks:** endpoint dédié `/api/webhooks/whatsapp` (+ `/status` optionnel), vérification signature si supportée par le provider.
**Idempotence:** déduplication via `messageId/eventId` + table `processed_events`.
**Worker ↔ Web:** queue MVP via tables Postgres (`jobs`, `outbox_messages`, `dead_letter`), worker poll + `FOR UPDATE SKIP LOCKED`, retries exponentiels.
**Error Handling:** JSON standardisé `{ error: { code, message, details?, requestId } }`.
**Observability:** requestId/correlationId propagé sur web + worker.

### Frontend Architecture
**State Management:** React Query pour data serveur + React state ; Zustand pour état UI local (live mode, filtres, sélection, drawer).
**Data Fetching:** RSC pour pages setup/settings/analytics light ; client‑side fetch + polling pour Live Board/Proof/Orders.
**Forms:** React Hook Form + Zod (schemas partagés via packages/shared).
**Real‑time:** MVP polling adaptatif (2s en live, 5–10s hors live, refetch on focus). Growth : SSE d’abord, WebSocket si besoin multi‑agents.

### Infrastructure & Deployment
**Hosting:** Vercel pour web/API Next.js ; Railway (ou Render) pour worker Node ; Supabase pour DB/Auth/Storage.
**Env Management:** Vercel envs (dev/preview/prod) + env vars worker ; clés Supabase par env ; service role key jamais côté client.
**CI/CD:** GitHub Actions minimal (lint/typecheck/tests/build web+worker) + Turbo pipelines pour cache.
**Monitoring:** Sentry (web + worker) + PostHog pour analytics produit ; uptime ping optionnel.
**Scaling:** MVP 1 worker instance ; Growth multi‑workers via DB queue + locks, puis Redis/broker si besoin.

## Project Structure & Boundaries

### Complete Project Directory Structure
```
venteflash/
├─ package.json
├─ pnpm-workspace.yaml
├─ turbo.json
├─ README.md
├─ .env.example
├─ .gitignore
├─ .github/
│  └─ workflows/
│     └─ ci.yml
├─ apps/
│  ├─ web/
│  │  ├─ app/
│  │  │  ├─ layout.tsx
│  │  │  ├─ page.tsx
│  │  │  ├─ (auth)/
│  │  │  ├─ (dashboard)/
│  │  │  │  ├─ live/
│  │  │  │  ├─ orders/
│  │  │  │  ├─ proofs/
│  │  │  │  ├─ customers/
│  │  │  │  └─ settings/
│  │  │  └─ api/
│  │  │     ├─ webhooks/
│  │  │     │  └─ whatsapp/
│  │  │     │     └─ route.ts
│  │  │     ├─ live-items/
│  │  │     │  └─ route.ts
│  │  │     ├─ orders/
│  │  │     │  └─ route.ts
│  │  │     ├─ proofs/
│  │  │     │  └─ route.ts
│  │  │     ├─ customers/
│  │  │     │  └─ route.ts
│  │  │     └─ tenants/
│  │  │        └─ route.ts
│  │  ├─ components/
│  │  │  ├─ ui/
│  │  │  ├─ live/
│  │  │  ├─ orders/
│  │  │  ├─ proofs/
│  │  │  └─ shared/
│  │  ├─ lib/
│  │  │  ├─ auth/
│  │  │  ├─ api/
│  │  │  ├─ rls/
│  │  │  ├─ validations/
│  │  │  ├─ domain/
│  │  │  │  ├─ live/
│  │  │  │  ├─ orders/
│  │  │  │  ├─ payments/
│  │  │  │  └─ messaging/
│  │  │  └─ utils/
│  │  ├─ styles/
│  │  ├─ public/
│  │  ├─ tests/ (co-located)
│  │  └─ next.config.mjs
│  └─ worker/
│     ├─ src/
│     │  ├─ queues/        # polling + locks + retry engine
│     │  ├─ jobs/          # expiration, send_outbox, etc.
│     │  ├─ processors/    # intent → job orchestration
│     │  ├─ scheduler/
│     │  ├─ adapters/
│     │  └─ index.ts
│     ├─ tests/
│     └─ Dockerfile
├─ packages/
│  ├─ config/
│  │  ├─ src/
│  │  │  └─ env.ts
│  │  └─ package.json
│  ├─ shared/
│  │  ├─ src/
│  │  │  ├─ schemas/
│  │  │  ├─ types/
│  │  │  ├─ events/
│  │  │  └─ constants/
│  │  └─ package.json
│  ├─ db/
│  │  ├─ prisma/
│  │  │  ├─ schema.prisma
│  │  │  └─ migrations/
│  │  ├─ src/
│  │  │  ├─ client.ts
│  │  │  ├─ rls.ts
│  │  │  ├─ tenant.ts
│  │  │  └─ index.ts
│  │  └─ package.json
│  └─ whatsapp/
│     ├─ src/
│     │  ├─ signature.ts
│     │  ├─ parser.ts
│     │  ├─ sender.ts
│     │  └─ templates.ts
│     └─ package.json
├─ tests/
│  ├─ e2e/        # Playwright
│  └─ api/        # API contract tests (supertest/fetch)
└─ docs/
```

### Architectural Boundaries

**API Boundaries:**
- `/api/webhooks/whatsapp` (ingestion + idempotence)
- `/api/live-items`, `/api/orders`, `/api/proofs`, `/api/customers`, `/api/tenants`

**Component Boundaries:**
- Live UI séparé (pipeline + cards) vs Orders pipeline
- Proofs inbox isolé pour validation

**Service Boundaries:**
- `apps/web` = API REST + UI
- `apps/worker` = jobs async (expirations, retries, envois sortants)
- `packages/*` = logique partagée

**Data Boundaries:**
- `packages/db` gère Prisma + RLS
- `packages/shared` gère schemas/DTOs
- `packages/whatsapp` encapsule provider API

### Requirements to Structure Mapping

**FR: Items live & réservation**
- `apps/web/app/(dashboard)/live`
- `apps/web/app/api/live-items`
- `packages/shared/schemas/live-item.ts`
- `apps/worker/src/jobs/expiration.ts`

**FR: Commandes & statuts**
- `apps/web/app/(dashboard)/orders`
- `apps/web/app/api/orders`
- `packages/shared/schemas/order.ts`

**FR: Preuve paiement**
- `apps/web/app/(dashboard)/proofs`
- `apps/web/app/api/proofs`
- `packages/shared/schemas/payment.ts`

**FR: WhatsApp**
- `apps/web/app/api/webhooks/whatsapp/route.ts`
- `packages/whatsapp/*`
- `apps/worker/src/jobs/send_outbox_messages.ts`
- `apps/worker/src/processors/outbox_processor.ts`

**Cross‑cutting**
- Auth/RLS: `apps/web/lib/auth`, `packages/db/rls.ts`
- Env config: `packages/config/env.ts` (Zod)
- Audit/logs: `apps/worker/src/processors`, `apps/web/lib/api`

### Integration Points

**Internal Communication:**
- DB queue tables (`jobs`, `outbox_messages`, `dead_letter`) for web → worker.
- Shared DTOs in `packages/shared`.

**External Integrations:**
- Supabase Auth/DB/Storage
- WhatsApp provider API

**Data Flow:**
- Webhook → parser → enqueue job → worker → send outbound → update status.

## Architecture Validation Results

### Coherence Validation (pass)

**Decision Compatibility:**
- Stack coherente (Next.js + Node worker + Supabase + Prisma + Zod).
- Auth/RLS aligne avec multi-tenant + API REST.
- DB queue alignee avec worker + idempotence.
- WhatsApp provider (MVP) explicite : Twilio WhatsApp (inbound webhooks + outbound via API Twilio).

**Pattern Consistency:**
- Naming DB/API/JSON compatible avec Prisma + REST.
- Event/job naming aligne avec queue tables.
- Error format coherent web + worker.

**Structure Alignment:**
- Monorepo structure correspond aux boundaries (web/worker/packages).
- Packages partages couvrent schemas, DB, WhatsApp, config.
- Routes App Router coherentes avec endpoints REST.
- Abstraction provider : packages/whatsapp encapsule Twilio (MVP) et permet migration Meta Cloud API via switch env WHATSAPP_PROVIDER.

### Requirements Coverage Validation (pass)

**Functional Coverage:**
- Items live, files d'attente, expiration -> Live Board + worker jobs.
- Commandes/statuts -> API + domain modules + dashboard.
- Preuves paiement -> proofs UI + storage + audit ; worker pour notifications/retries.
- WhatsApp -> webhook Twilio + packages/whatsapp + outbox jobs + idempotence.
- Multi-tenant + RBAC + audit -> Supabase Auth + RLS + audit log.

**Non-Functional Coverage:**
- Latence/fiabilite : queue + polling + idempotence.
- Securite : RLS, signed URLs, rate limiting, audit log.
- Scalabilite : worker scalable + Redis optionnel.
- Delivrabilite WhatsApp : retries + DLQ + observabilite.

### Implementation Readiness (pass)

**Decision Completeness:**
- Stack, patterns, envs, worker, provider WhatsApp (Twilio) definis.
- Job lifecycle defini (jobs / outbox_messages / dead_letter).
- Retry SLA defini : backoff 1m -> 5m -> 15m -> 1h -> 6h, puis DLQ (max 5 retries).

**Structure Completeness:**
- Arborescence complete + mapping FR -> modules.
- Integration points documentes (Twilio webhook, Supabase, Storage, DB queue).

**Pattern Completeness:**
- Naming, formats, retries, events, erreurs standardises.

### Gap Analysis Results
- Aucun gap critique.
- Ameliorations optionnelles : metriques "pivot", SSE/WebSocket en Growth, broker Redis si charge elevee.

### Residual Risks (non-bloquants)
- Provider WhatsApp (Twilio) : couts/delivrabilite/contraintes templates pouvant impacter l'UX live (a monitorer des le pilote).
- RLS / multi-tenant : policies Supabase a tester fortement (tests API + tests RLS) pour eviter fuites ou blocages.

### Architecture Completeness Checklist
- [x] Requirements analyses
- [x] Contraintes techniques identifiees
- [x] Decisions critiques documentees
- [x] Patterns d'implementation definis
- [x] Structure projet complete
- [x] Boundaries + integrations claires

### Architecture Readiness Assessment
**Overall Status:** READY FOR IMPLEMENTATION
**Confidence Level:** High (based on defined stack + patterns + module mapping)

**Key Strengths:**
- Separation claire ItemLive vs Commande.
- Queue DB + worker pour fiabilite live.
- Multi-tenant securise (RLS + audit).
- Provider WhatsApp Twilio explicite et encapsule (migration future facilitee).

**Areas for Future Enhancement:**
- Redis/broker si montee en charge.
- SSE/WebSocket pour live temps reel.
- Optimisation couts WhatsApp (reduction messages, templates, batching).

### Implementation Handoff
**AI Agent Guidelines:**
- Suivre les decisions et patterns strictement.
- Respecter structure monorepo + naming.
- Centraliser schemas dans packages/shared.
- Integration WhatsApp via Twilio en MVP (packages/whatsapp/providers/twilio).

**First Implementation Priority (commands):**
- pnpm dlx create-turbo@latest
- pnpm dlx shadcn@latest init (apps/web)
- npx supabase init && npx supabase start
- npx prisma init --datasource-provider postgresql

## Architecture Completion Summary

### Workflow Completion

**Architecture Decision Workflow:** COMPLETED
**Total Steps Completed:** 8
**Date Completed:** 2026-01-23
**Document Location:** /_bmad-output/planning-artifacts/architecture.md

### Final Architecture Deliverables

**Complete Architecture Document**
- All architectural decisions documented with specific versions.
- Implementation patterns ensuring AI agent consistency.
- Complete project structure with all files and directories.
- Requirements to architecture mapping.
- Validation confirming coherence and completeness.

**Implementation Ready Foundation**
- 6 architectural decision categories completed.
- 6 implementation pattern categories defined.
- 8 architectural components specified.
- 54 functional requirements supported.

**AI Agent Implementation Guide**
- Technology stack with verified versions.
- Consistency rules that prevent implementation conflicts.
- Project structure with clear boundaries.
- Integration patterns and communication standards.

### Implementation Handoff

**For AI Agents:**
This architecture document is the guide for implementing VenteFlash. Follow all decisions, patterns, and structures exactly as documented.

**First Implementation Priority:**
pnpm dlx create-turbo@latest

**Development Sequence:**
1. Initialize project using documented starter template.
2. Set up development environment per architecture.
3. Implement core architectural foundations.
4. Build features following established patterns.
5. Maintain consistency with documented rules.

### Quality Assurance Checklist

- [x] All decisions work together without conflicts.
- [x] Technology choices are compatible.
- [x] Patterns support architectural decisions.
- [x] Structure aligns with all choices.
- [x] All functional requirements supported.
- [x] All non-functional requirements addressed.
- [x] Cross-cutting concerns handled.
- [x] Integration points defined.
- [x] Decisions are specific and actionable.
- [x] Patterns prevent agent conflicts.
- [x] Structure is complete and unambiguous.

### Project Success Factors

- Clear decision framework with rationale.
- Consistency guarantee for multi-agent development.
- Complete coverage of requirements and constraints.
- Production-ready foundation with verified versions.

---

**Architecture Status:** READY FOR IMPLEMENTATION
**Next Phase:** Begin implementation using the architectural decisions and patterns documented herein.
**Document Maintenance:** Update this architecture when major technical decisions change.

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined
**Critical Conflict Points Identified:** naming DB/API/JSON, job/event formats, error format, monorepo structure, retries.

### Naming Patterns

**Database Naming Conventions:**
- Tables: `snake_case` (ex: `live_items`, `orders`).
- Columns: `snake_case` (ex: `tenant_id`, `order_number`).
- Foreign keys: `tenant_id` format (snake_case partout).
- Indexes: `idx_<table>_<col>`; uniques `uidx_<table>_<col>`.

**API Naming Conventions:**
- REST endpoints pluriels: `/api/orders`, `/api/live-items`.
- Query params: `camelCase`.
- Headers: `X-Request-Id`.

**Code Naming Conventions:**
- React files: `kebab-case` (`live-item-card.tsx`).
- Functions/variables: `camelCase`.

### Structure Patterns

**Project Organization:**
- Monorepo: `apps/web`, `apps/worker`, `packages/shared`.
- Tests co‑locatés: `*.test.ts(x)` près du code.
- Shared schemas/DTOs dans `packages/shared`.

### Format Patterns

**API Response Formats:**
- Errors: `{ error: { code, message, details?, requestId } }`.

**Data Exchange Formats:**
- JSON keys: `camelCase`.
- Dates: ISO 8601 UTC.

### Communication Patterns

**Event System Patterns:**
- Event names: dot‑notation (`live.item.reserved`).
- Job tables: `jobs`, `outbox_messages`, `dead_letter`.

### Process Patterns

**Loading State Patterns:**
- Lists: skeleton.
- Actions: spinner + toast feedback.

**Retry Patterns:**
- Exponential backoff.
- Max retries = 5, puis DLQ.

### Enforcement Guidelines
**All AI Agents MUST:**
- Respecter naming DB/API/JSON définis.
- Utiliser le format d’erreur standard.
- Utiliser dot‑notation pour events et tables jobs standard.

**Pattern Enforcement:**
- PR checklists + lint rules.
- Logs d’erreur en cas de violation.
- Tout changement de pattern doit être consigné dans l’architecture.md.

### Pattern Examples
**Good Examples:**
- `/api/live-items?status=reserved`
- `live.item.reserved`
- `orders` table + `tenant_id` column

**Anti-Patterns:**
- `Orders` table / `tenantId` column.
- `/api/order`
- `LiveItemReserved` event name
