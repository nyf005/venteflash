# Story 1.1: Setup initial du projet (starter template)

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developpeur,
I want initialiser le monorepo via le starter template defini,
so that la base technique est conforme a l'architecture.

## Acceptance Criteria

1. Given le depot vide, When le projet est initialise via `create-turbo@latest` et `pnpm`, Then les apps `apps/web` et `apps/worker` demarrent localement sans erreur.
2. Given le projet initialise, When on lance `pnpm dev` (turbo dev), Then `apps/web` et `apps/worker` tournent ensemble sans erreurs de build.
3. Given le projet initialise, When on consulte le README, Then il liste clairement `pnpm dev` et `pnpm lint`.

## Tasks / Subtasks

- [x] Initialiser le monorepo Turborepo avec pnpm (AC: 1)
  - [x] Verifier Node 20+ et pnpm en local
  - [x] Executer `pnpm dlx create-turbo@latest`
- [x] Valider les apps par defaut et le run local (AC: 1, 2)
  - [x] Lancer `pnpm dev` et confirmer `apps/web` + `apps/worker`
  - [x] Lancer `pnpm lint`
- [x] Documenter les commandes de base dans README (AC: 3)
  - [x] Ajouter les commandes `pnpm dev` et `pnpm lint`

## Dev Notes

### Developer Context

- Monorepo obligatoire avec `apps/web`, `apps/worker`, `packages/*`.
- App Router uniquement (pas de Pages Router).
- TypeScript strict, pas de `any` non justifie.
- Ne jamais committer de `.env` (utiliser `.env.example`).

### Technical Requirements

- Node 20+ requis pour Prisma/Supabase.
- Gestion des env vars centralisee via `packages/config/env.ts`.
- Lancer le dev via `turbo dev` (alias `pnpm dev`).

### Architecture Compliance

- Starter officiel: `create-turbo@latest` avec pnpm workspaces.
- Garder la structure monorepo proposee (apps/web, apps/worker, packages/shared, packages/config, packages/db, packages/whatsapp).
- Respecter le pattern REST App Router (`app/api/**/route.ts`).

### Library / Framework Requirements

- Next.js App Router, React, Tailwind, shadcn/ui (apps/web).
- Prisma 7.3.0, Prisma Client 7.3.0.
- Zod 4.3.6 pour validation (schemas partages via packages/shared).
- Supabase (Auth/DB/Storage) pour l'infra cible.

### File Structure Requirements

- `apps/web/app` pour UI + routes API.
- `apps/worker/src` pour jobs et queues.
- `packages/*` pour config, db, schemas, integrations WhatsApp.
- Fichiers React en kebab-case avec exports nommes.

### Testing Requirements

- Tests co-locates `*.test.ts(x)`.
- `tests/e2e` (Playwright) et `tests/api` (supertest/fetch) reserves pour la suite.
- Prevoir lint/format de base via `pnpm lint`.

### Latest Tech Information

- pnpm peut etre installe via Corepack (`npm install --global corepack@latest`, puis `corepack enable pnpm`).
- Conserver `create-turbo@latest` pour la structure monorepo officielle.

### Project Context Reference

- Regles d'implementation et stack: `/_bmad-output/project-context.md`.

### Project Structure Notes

- Structure attendue documentee dans `/_bmad-output/planning-artifacts/architecture.md` (section “Complete Project Directory Structure”).

### References

- [Source: _bmad-output/planning-artifacts/epics-and-stories.md#L170] Epic 1 / Story 1.1.
- [Source: _bmad-output/planning-artifacts/architecture.md#L58] Starter template et commandes init.
- [Source: _bmad-output/project-context.md#L18] Stack et contraintes Node 20+.

## Story Completion Status

- Status: review
- Completion note: Monorepo initialise, apps web/worker lancees, lint execute, README mis a jour. Review fixes appliquees (packages requis, .env.example, README, Node 20+).

## Dev Agent Record

### Agent Model Used

OpenCode

### Debug Log References

- Validation workflow indisponible: `/_bmad/core/tasks/validate-workflow.xml` non trouve.
- `pnpm dev` lance (apps web/worker ok) mais coupe apres 60s de timeout.

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created.
- Monorepo Turborepo initialise via `create-turbo@latest` avec pnpm.
- Ajout d'une app `apps/worker` (TypeScript, eslint, dev via `pnpm dlx tsx`).
- `pnpm lint` execute avec succes; `pnpm dev` confirme par l'utilisateur.
- README mis a jour avec `pnpm dev` et `pnpm lint`.
- Review fixes: Node 20+ enforce dans `package.json`.
- Review fixes: ajout `packages/config`, `packages/shared`, `packages/db`, `packages/whatsapp`.
- Review fixes: ajout `.env.example` et README aligne sur la structure.
- Review fixes: depot initialise avec git.
- Review fixes: workspace limite a `apps/web` + `apps/worker` pour `pnpm dev`.
- Review fixes: env schema ajoute via `packages/config/env.ts`.
- Review fixes: `.gitignore` ajoute pour dossiers d'outils locaux.
- Review fixes: taches `pnpm dev`/`pnpm lint` remises en attente (non revalidees).
- Review fixes: suppression de `apps/docs`.
- Validation: `pnpm lint` OK; `pnpm dev` confirme par l'utilisateur.

### File List

- `.env.example`
- `.gitignore`
- `.npmrc`
- `.vscode/settings.json`
- `README.md`
- `apps/web/README.md`
- `apps/web/app/favicon.ico`
- `apps/web/app/fonts/GeistMonoVF.woff`
- `apps/web/app/fonts/GeistVF.woff`
- `apps/web/app/globals.css`
- `apps/web/app/layout.tsx`
- `apps/web/app/page.module.css`
- `apps/web/app/page.tsx`
- `apps/web/eslint.config.js`
- `apps/web/next-env.d.ts`
- `apps/web/next.config.js`
- `apps/web/package.json`
- `apps/web/public/file-text.svg`
- `apps/web/public/globe.svg`
- `apps/web/public/next.svg`
- `apps/web/public/turborepo-dark.svg`
- `apps/web/public/turborepo-light.svg`
- `apps/web/public/vercel.svg`
- `apps/web/public/window.svg`
- `apps/web/tsconfig.json`
- `apps/worker/eslint.config.js`
- `apps/worker/package.json`
- `apps/worker/src/index.ts`
- `apps/worker/tsconfig.json`
- `package.json`
- `packages/eslint-config/README.md`
- `packages/eslint-config/base.js`
- `packages/eslint-config/next.js`
- `packages/eslint-config/package.json`
- `packages/eslint-config/react-internal.js`
- `packages/config/eslint.config.js`
- `packages/config/package.json`
- `packages/config/src/env.ts`
- `packages/config/tsconfig.json`
- `packages/db/package.json`
- `packages/db/eslint.config.js`
- `packages/db/src/index.ts`
- `packages/db/tsconfig.json`
- `packages/shared/package.json`
- `packages/shared/eslint.config.js`
- `packages/shared/src/index.ts`
- `packages/shared/tsconfig.json`
- `packages/typescript-config/base.json`
- `packages/typescript-config/nextjs.json`
- `packages/typescript-config/package.json`
- `packages/typescript-config/react-library.json`
- `packages/ui/eslint.config.mjs`
- `packages/ui/package.json`
- `packages/ui/src/button.tsx`
- `packages/ui/src/card.tsx`
- `packages/ui/src/code.tsx`
- `packages/ui/tsconfig.json`
- `packages/whatsapp/package.json`
- `packages/whatsapp/eslint.config.js`
- `packages/whatsapp/src/index.ts`
- `packages/whatsapp/tsconfig.json`
- `pnpm-lock.yaml`
- `pnpm-workspace.yaml`
- `turbo.json`
- `/_bmad-output/implementation-artifacts/1-1-setup-initial-du-projet-starter-template.md`
