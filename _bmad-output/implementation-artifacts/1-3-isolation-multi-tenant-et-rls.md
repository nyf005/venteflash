# Story 1.3: Isolation multi-tenant et RLS

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As an Owner/Admin,
I want que mes donnees soient isolees des autres vendeurs,
so that les informations restent privees.

## Acceptance Criteria

1. Given deux tenants distincts, When un utilisateur tente de lire ou modifier des donnees d'un autre tenant, Then l'acces est refuse par RLS et aucun champ n'est retourne.
2. Given une requete API avec un tenantId non associe a l'utilisateur, When la requete est traitee, Then l'API renvoie une erreur standard `{ error: { code, message, details?, requestId } }` sans fuite d'information.
3. Given un utilisateur sans membership actif, When il accede a une ressource tenant-scopee, Then l'acces est refuse et un evenement d'audit est journalise.
4. Given une tentative d'acces inter-tenant, When le refus est applique, Then un log d'audit contient acteur, tenantId, ressource, action et timestamp.

## Tasks / Subtasks

- [x] Cartographier toutes les tables tenant-scopees existantes et confirmer les colonnes `tenant_id` (AC: 1)
  - [x] Verifier les tables deja creees (tenants, memberships, customers, orders, live_items, proofs, etc.)
- [x] Appliquer un pattern RLS unique (SELECT/INSERT/UPDATE/DELETE) base sur `auth.uid()` + membership (AC: 1, 3)
  - [x] Centraliser les policies dans `packages/db/prisma/rls.sql`
- [x] Verrouiller les endpoints pour ignorer tout tenantId fourni par le client et deriver le contexte depuis la session (AC: 2)
  - [x] Ajouter un guard re-utilisable cote `apps/web/lib/auth` ou `apps/web/lib/rls`
- [x] Journaliser les refus d'acces RLS dans l'audit trail avec un event name en dot-notation (ex: `security.rls.denied`) (AC: 4)
- [x] Tests multi-tenant (AC: 1, 2, 3, 4)
  - [x] Test RLS cross-tenant sur SELECT + UPDATE
  - [x] Test API: tenantId override rejete + format erreur standard
  - [x] Test audit: entree creee lors d'un refus d'acces

## Dev Notes

### Developer Context

- L'isolation multi-tenant est un garde-fou core (SaaS B2B) et repose sur Supabase RLS + membership (story 1.2).
- Le tenantId doit provenir de la session (auth.uid + membership) et ne jamais etre pris depuis le payload client.
- Les refus d'acces doivent etre journalises pour audit/support et litiges.

### Technical Requirements

- RLS actif sur toutes les tables tenant-scopees, policies basees sur `auth.uid()` + `tenant_id`.
- Colonne `tenant_id` obligatoire, indexes/uniques scopes par tenant.
- Audit trail conforme: event name dot-notation, timestamps ISO 8601 UTC.
- Erreurs API au format `{ error: { code, message, details?, requestId } }`.

### Architecture Compliance

- App Router uniquement, API sous `app/api/**/route.ts`.
- Prisma 7.3.0 + Postgres (Supabase) + policies RLS.
- JSON camelCase, DB snake_case (Prisma `@map` / `@@map`).
- RLS teste avec un scenario multi-tenant minimum.

### Library / Framework Requirements

- Supabase Auth + RLS.
- Prisma 7.3.0.
- Zod 4.3.6 pour validation d'entrees.

### File Structure Requirements

- `packages/db/prisma/schema.prisma` (tenant_id, indexes, contraintes uniques).
- `packages/db/prisma/rls.sql` (policies et roles).
- `packages/db/src/rls.ts` (helpers RLS/tenant context).
- `apps/web/lib/auth/*` ou `apps/web/lib/rls/*` (guard tenant context).
- `tests/api/rls.test.ts` (tests cross-tenant).

### Testing Requirements

- Tests RLS: SELECT/UPDATE refuses entre tenants.
- Tests API: tentatives tenantId override rejetees + erreur standard.
- Tests audit: evenement cree lors d'un refus d'acces.

### Previous Story Intelligence

- Story 1.2 a deja etabli tenant + membership + policies RLS de base.
- Format d'erreur standard deja utilise.
- Validation env via `packages/config/env.ts` et Node 20+ requis.

### Latest Tech Information

- Prisma 7.3.0 est la release stable actuelle (options `compilerBuild` et fixes perf). [Source: https://github.com/prisma/prisma/releases/tag/7.3.0]
- Zod 4.3.6 est la derniere release stable. [Source: https://github.com/colinhacks/zod/releases/tag/v4.3.6]
- Next.js 16.1.5 est la derniere release stable avec correctifs securite. [Source: https://github.com/vercel/next.js/releases/tag/v16.1.5]

### Project Structure Notes

- Se referer a l'arborescence complete dans `/_bmad-output/planning-artifacts/architecture.md` pour les chemins exacts.
- Garder la separation `apps/web`, `apps/worker`, `packages/*` et schemas partages dans `packages/shared`.

### Project Context Reference

- Le fichier `/_bmad-output/project-context.md` est la reference de stack (versions, conventions, RLS, erreurs standard, tests RLS).

### References

- [Source: _bmad-output/planning-artifacts/epics-and-stories.md#L199] Story 1.3 definition + AC.
- [Source: _bmad-output/planning-artifacts/prd.md#L368] FR2 isolation multi-tenant.
- [Source: _bmad-output/planning-artifacts/architecture.md#L151] RLS Supabase + tenantId obligatoire.
- [Source: _bmad-output/project-context.md#L18] Stack + versions + regles RLS.

## Story Completion Status

- Status: done
- Completion note: Revue terminee, correctifs appliques, tests mis a jour.

## Dev Agent Record

### Agent Model Used

OpenCode

### Debug Log References

- Validation workflow indisponible: `/_bmad/core/tasks/validate-workflow.xml` non trouve.

### Completion Notes List

- Contexte epics/PRD/architecture/UX/project-context analyse pour l'isolement multi-tenant.
- Guardrails RLS, audit et tests multi-tenant definis.
- Versions verifiees: Prisma 7.3.0, Zod 4.3.6, Next.js 16.1.5.
- Cartographie des tables tenant-scopees (tenants, users, memberships) avec helpers RLS et tests associes.
- Policies RLS etendues (SELECT/INSERT/UPDATE/DELETE) via membership + tests RLS mis a jour.
- Guard tenant context base sur session + erreurs standardisees et tests.
- Audit trail ajoute (table audit_events, logger, journalisation des refus RLS) + tests.
- Tests multi-tenant completes (RLS select/update, override API, audit denied).
- Tests: `pnpm exec vitest run`.
- Fix review: endpoint tenant context, RLS applique via migration, audit insert avec claims JWT.
- Fix review: tests RLS integrationnels conditionnels (DATABASE_URL) + verif synchro migration RLS.
- Fix review: is_tenant_member security definer + role authenticated pour tests RLS.

### File List

- `/_bmad-output/implementation-artifacts/1-3-isolation-multi-tenant-et-rls.md`
- `/_bmad-output/implementation-artifacts/sprint-status.yaml`
- `packages/db/src/index.ts`
- `packages/db/src/rls.test.ts`
- `packages/db/src/rls.ts`
- `packages/db/prisma/rls.sql`
- `tests/api/rls.test.ts`
- `apps/web/lib/auth/session.ts`
- `apps/web/lib/auth/tenant-context.test.ts`
- `apps/web/lib/auth/tenant-context.ts`
- `packages/db/prisma/migrations/20260127090000_add_audit_events/migration.sql`
- `packages/db/prisma/schema.prisma`
- `packages/db/src/audit.ts`
- `apps/web/app/api/tenants/context/route.ts`
- `apps/web/app/api/tenants/context/route.test.ts`
- `packages/db/prisma/migrations/20260127101000_apply_rls_policies/migration.sql`

## Change Log

- 2026-01-27: Isolation multi-tenant RLS (policies, guard, audit, tests) + table audit_events.
- 2026-01-27: Fix review (API guard applique, audit insert fiable, migration RLS, tests).
- 2026-01-27: Fix review (tests RLS integrationnels + sync migration/rls.sql).
- 2026-01-27: Fix review (security definer RLS + tests integrationnels en role authenticated).
