# Story 1.5: Entitlements et quotas d'abonnement

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As an Owner/Admin,
I want voir l'etat d'abonnement et mes quotas,
so that je sache si mon plan limite mes actions.

## Acceptance Criteria

1. Given un tenant actif, When il consulte la page abonnement, Then les quotas restants et l'etat trial/actif/expire sont affiches.
2. Given une action soumise a entitlements, When le quota est depasse ou le plan est expire, Then l'action est bloquee avec un message clair cote UI et une erreur API standardisee.
3. Given un tenant multi-tenant, When un utilisateur tente de consulter ou modifier des entitlements d'un autre tenant, Then l'acces est refuse par RLS et journalise.
4. Given une action sensible de type changement de plan ou ajustement quota, When elle est executee, Then un audit event est enregistre avec acteur, tenantId, action et timestamp.

## Tasks / Subtasks

- [x] Definir le modele d'abonnement/plan/quotas (AC: 1, 2, 4)
  - [x] Etendre `schema.prisma` (snake_case) pour `subscriptions`, `plan_limits` et compteurs `usage` par tenant
  - [x] Mettre a jour policies RLS pour garantir le scope tenant
- [x] Implementer la logique d'entitlements (AC: 2)
  - [x] Ajouter `apps/web/lib/domain/entitlements/*` (check quota, status, erreurs standard)
  - [x] Brancher les checks sur les actions sensibles existantes (guard reutilisable)
- [x] Exposer les APIs abonnement/quotas (AC: 1, 2)
  - [x] `GET /api/subscription` (etat, plan, quotas, usage)
  - [x] `POST /api/entitlements/check` (optionnel, usage interne)
- [x] UI page abonnement (AC: 1, 2)
  - [x] Afficher plan, etat, quotas restants + message blocage
  - [x] Brancher React Query + schemas Zod partages
- [x] Audit & tests (AC: 2, 3, 4)
  - [x] Tests RLS multi-tenant (acces interdit)
  - [x] Tests API entitlements (blocked vs allowed)

## Dev Notes

### Developer Context

- Story liee a FR6/FR7: etat abonnement + quotas, blocage des actions depassant les limites.
- Le tenantId vient du tenant context; ne jamais accepter un tenantId client.
- Les entitlements doivent etre appliques a toutes les actions sensibles (creation live, commandes, envois, etc.).
- Toute modification de plan/quotas doit generer un audit event (dot-notation) avec acteur et tenantId.
- Erreurs API conformes au format `{ error: { code, message, details?, requestId } }`.

### Technical Requirements

- RLS actif sur toutes les tables d'abonnement/usage; acces strict par tenant.
- Compteurs de quota mis a jour de facon atomique (transaction Prisma ou requete unique).
- Statuts abonnement normalises: trial, actif, expire (mapping DB snake_case si besoin).
- Ne jamais logger de PII ni tokens; suivre `packages/config/env.ts` pour les env vars.

### Architecture Compliance

- App Router uniquement; routes API sous `apps/web/app/api/**/route.ts`.
- Logique metier dans `apps/web/lib/domain/entitlements/*`, pas dans les handlers.
- DB snake_case, JSON camelCase via Prisma `@map` / `@@map`.
- Audit events en dot-notation + timestamps ISO 8601 UTC.

### Library / Framework Requirements

- Next.js App Router + React Query (data serveur) + Zustand (etat UI local).
- Prisma 7.3.0 + Supabase Postgres + RLS.
- Zod 4.3.6 pour validation des DTOs.
- Supabase Auth (email + OTP, password fallback).

### File Structure Requirements

- API: `apps/web/app/api/subscription/route.ts`, `apps/web/app/api/entitlements/check/route.ts`.
- Domaine: `apps/web/lib/domain/entitlements/*` (check quota, status, errors).
- Schemas partages: `packages/shared/src/schemas/subscription.ts`.
- DB/RLS: `packages/db/prisma/schema.prisma`, `packages/db/prisma/rls.sql`.
- UI: page settings abonnement sous `apps/web/app/(dashboard)/settings/subscription/page.tsx` avec `DashboardLayout`.

### Testing Requirements

- Tests co-locates `*.test.ts(x)` pour la logique entitlements.
- Tests API dans `tests/api` pour limites depassees vs autorisees.
- Au moins 1 test RLS multi-tenant sur tables abonnement/usage.
- Tests UI de base pour affichage quotas/etat + message blocage.

### Previous Story Intelligence

- Story 1.3 a etabli RLS + audit_events; reutiliser les helpers dans `packages/db/src/rls.ts`.
- Story 1.4 a fixe le pattern `DashboardLayout` + dual-view responsive et tokens `--vf-*`.
- Le tenant context est enforce via `apps/web/lib/auth/tenant-context.ts`.

### Git Intelligence Summary

- Le dernier commit renforce l'isolation multi-tenant et l'audit logging; suivre ces conventions pour les entitlements.
- Le bootstrap monorepo definit la structure `apps/web`, `apps/worker`, `packages/*`.

### Latest Tech Information

- Prisma 7.3.0: option `compilerBuild` (fast/small) et bypass du query compiler pour `$executeRaw`/`$queryRaw` si besoin. Source: https://github.com/prisma/prisma/releases/tag/7.3.0
- Zod 4.3.6: release stable sans breaking changes majeurs; garder compatibilite avec schemas partages. Source: https://github.com/colinhacks/zod/releases/tag/v4.3.6
- Next.js 16.1.5: release securite (CVE-2025-59471/59472, CVE-2026-23864). Source: https://github.com/vercel/next.js/releases/tag/v16.1.5

### Project Structure Notes

- Aligner les nouveaux modules entitlements avec la structure monorepo.
- Garder la separation ItemLive vs Commande; entitlements doivent verifier la ressource cible sans melanger les statuts.

### References

- [Source: _bmad-output/planning-artifacts/epics-and-stories.md#L224] Story 1.5 definition + AC
- [Source: _bmad-output/planning-artifacts/prd.md#L374] FR6 entitlements
- [Source: _bmad-output/planning-artifacts/prd.md#L375] FR7 quotas
- [Source: _bmad-output/planning-artifacts/architecture.md#L151] RLS + tenant context + audit
- [Source: _bmad-output/project-context.md#L18] Stack versions + conventions
- [Source: _bmad-output/implementation-artifacts/1-4-gestion-des-utilisateurs-et-roles.md#L236] Dashboard layout + responsive pattern

## Story Completion Status

- Status: review
- Completion note: Corrections CR appliquees, tests passes (pnpm vitest run)

## Dev Agent Record

### Agent Model Used

openai/gpt-5.2-codex

### Debug Log References

- Validation workflow indisponible: `/_bmad/core/tasks/validate-workflow.xml` non trouve.

### Completion Notes List

- Analyse epics/PRD/architecture/UX/project-context terminee pour entitlements.
- Contexte RLS + audit + tenant context integre au plan.
- Sources versions verifiees (Prisma 7.3.0, Zod 4.3.6, Next.js 16.1.5).
- Story file complete avec AC, taches, garde-fous techniques et references.
- Modeles subscription/plan/usage ajoutes avec policies RLS et migration associee.
- Domaine entitlements + audit subscription implementes et connectes au guard d'invite utilisateur.
- APIs abonnement/entitlements ajoutees avec schemas Zod partages et UI Subscription & Quotas.
- Tests ajoutes pour entitlements, APIs, RLS et UI. Tests: `pnpm vitest run`.
- Avatars migres vers composants Radix/shadcn avec badges pour status (layout + users + subscription).
- Corrections CR: statut abonnement dynamique, quotas seed a zero, guard entitlements atomique, endpoint quotas + audit.
- Corrections CR: controle admin sur l'ajustement des quotas + test d'autorisation.
- File list limitee aux fichiers de la story; autres changements repo hors scope.

### File List

- `_bmad-output/implementation-artifacts/1-5-entitlements-et-quotas-dabonnement.md`
- `apps/web/app/(dashboard)/settings/subscription/page.tsx`
- `apps/web/app/(dashboard)/settings/subscription/page.module.css`
- `apps/web/app/api/entitlements/check/route.ts`
- `apps/web/app/api/entitlements/check/route.test.ts`
- `apps/web/app/api/subscription/route.ts`
- `apps/web/app/api/subscription/route.test.ts`
- `apps/web/app/api/subscription/limits/route.ts`
- `apps/web/app/api/subscription/limits/route.test.ts`
- `apps/web/app/api/users/invite/route.ts`
- `apps/web/components/layout/dashboard-layout.tsx`
- `apps/web/components/layout/dashboard-layout.module.css`
- `apps/web/components/subscription/subscription-dashboard.tsx`
- `apps/web/components/subscription/subscription-dashboard.module.css`
- `apps/web/components/subscription/subscription-dashboard.test.tsx`
- `apps/web/components/ui/avatar.tsx`
- `apps/web/components/users/users-dashboard.tsx`
- `apps/web/components/users/users-dashboard.module.css`
- `apps/web/lib/domain/entitlements/entitlements.ts`
- `apps/web/lib/domain/entitlements/entitlements.test.ts`
- `apps/web/lib/domain/entitlements/errors.ts`
- `apps/web/lib/domain/entitlements/types.ts`
- `apps/web/lib/domain/users/invite-user.ts`
- `apps/web/lib/domain/users/user-management.test.ts`
- `packages/db/prisma/migrations/20260127101000_apply_rls_policies/migration.sql`
- `packages/db/prisma/migrations/20260128120000_add_subscriptions/migration.sql`
- `packages/db/prisma/rls.sql`
- `packages/db/prisma/schema.prisma`
- `packages/db/src/rls.ts`
- `packages/db/src/rls.test.ts`
- `packages/shared/src/index.ts`
- `packages/shared/src/schemas/subscription.ts`
- `tests/api/rls.test.ts`

## Change Log

- 2026-01-28: Ajout des modeles abonnement/quotas, logique entitlements, APIs et page Subscription & Quotas avec tests associes.
- 2026-01-28: Migration des avatars vers Radix Avatar + badge de statut sur les vues dashboard.
- 2026-01-28: Ajout controle admin sur ajustement quotas + test autorisation.
