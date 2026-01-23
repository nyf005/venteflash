---
stepsCompleted: [step-01-init, step-02-discovery, step-03-success, step-04-journeys, step-05-domain, step-06-innovation, step-07-project-type, step-08-scoping, step-09-functional, step-10-nonfunctional, step-11-polish]
inputDocuments:
  - /Users/fabricendri/Developer/VenteFlash/_bmad-output/planning-artifacts/product-brief-VenteFlash-2026-01-23.md
documentCounts:
  briefCount: 1
  researchCount: 0
  brainstormingCount: 0
  projectDocsCount: 0
  projectContextCount: 0
workflowType: 'prd'
classification:
  projectType: saas_b2b
  domain: social_commerce
  complexity: medium
  projectContext: greenfield
date: 2026-01-23
author: Fabrice
---

# Document des exigences produit - VenteFlash

**Auteur :** Fabrice
**Date :** 2026-01-23

## Executive Summary

VenteFlash est un SaaS B2B + bot WhatsApp qui transforme le commerce social en commandes structurées et traçables. Il résout le chaos des DM/WhatsApp (réponses tardives, erreurs, commandes fantômes) en automatisant la réservation, la confirmation et le suivi. Sa différenciation clé est le mode live-first avec allocation atomique des pièces rares, file d’attente et expiration. Le produit s’adresse aux vendeuses solo live, boutiques catalogue et petites équipes cherchant un back‑office opérationnel simple.

**Résumé exécutif (décisions clés)**
- MVP live-first avec réservation atomique, file d’attente et expiration.
- WhatsApp-first avec back-office minimal (statuts, livraison par commune, preuve paiement).
- Non‑fintech : paiement manuel, pas de détention de fonds.
- Cibles 90 jours : 1 000 000 FCFA MRR, 50 vendeurs actifs hebdo.

## Success Criteria

### User Success
- Réduction du chaos : commandes structurées “à faire / en cours / livré”.
- Conversion plus rapide (moins d’abandon pour cause de réponse tardive).
- Diminution des erreurs (taille/couleur/adresse/montant).
- Moins de commandes fantômes (confirmation + timer + acompte optionnel).
- Allègement de la charge mentale : live sans stress, fin de session claire.
- Moment “aha” : fin de live avec une liste claire de commandes confirmées, adresses et frais.

### Business Success
- MRR : atteindre 1 000 000 FCFA/mois à 90 jours.
- Vendeurs actifs hebdo : 50 vendeurs à 90 jours.
- Churn M1 : < 40% (rétention M1 > 60%).
- Coût WhatsApp / vendeur : < 2 000 FCFA/mois.

**Reporting hebdo (format standard)**
- MRR mensuel (total et variation WoW).
- Vendeurs actifs hebdo.
- Churn M1 par cohorte.
- Coût WhatsApp / vendeur.

**Cadence de revue**
- Revue hebdomadaire : KPI business + KPI opérationnels (conversion, fantômes).
- Revue mensuelle : pricing, rétention, roadmap.

### Technical Success

Disponibilité & résilience
- Uptime API + dashboard : MVP ≥ 99.5% mensuel | Growth ≥ 99.9%
- Dégradation acceptable : incident explicite côté bot si service indisponible
- Backup quotidien DB + restauration testée (mensuelle)

Latence & WhatsApp
- Réponse bot P95 : MVP < 3s | Growth < 1.5s
- Création commande + récap P95 : MVP < 10s
- Changement statut → notification P95 : MVP < 10s

Délivrabilité & intégrité
- Taux d’échec d’envoi (hors numéros invalides) : MVP < 1% | Growth < 0.3%
- Taux de duplication : MVP < 0.1%
- Webhooks idempotents (pas de double commande)

Workflow LIVE (SLA fonctionnel)
- Réservation atomique (qty=1 jamais doublé)
- Attribution A12 → “réservé” P95 : < 2s
- Expiration : libération automatique X min (défaut 10), précision ±30s
- File d’attente : notification au #1 en < 10s (P95)

Paiement “preuve”
- Échec upload/attachement : MVP < 2% | Growth < 1%
- Chargement preuve dashboard P95 : < 2s (via URL sécurisée)
- Traçabilité : preuve liée à commande + horodatage + auteur

Sécurité & conformité minimale
- Auth sécurisée + rate limit
- Isolation multi-tenant stricte
- Audit trail minimal (paiement/statuts/annulations)
- Opt-out “STOP” côté client

Observabilité & support
- Logs événementiels complets (message, intent, commande, statut, envoi)
- Alertes si échec > 2% sur 15 min
- File d’erreurs (webhooks retry, expirations en retard)
- Retry exponentiel + DLQ

Performance & scalabilité
- MVP : 10 vendeurs, pics live 500 msgs/heure chacun, SLA respectés
- Growth : 100 vendeurs avec scaling horizontal (queue + workers)

### Measurable Outcomes
- Temps DM/WhatsApp → commande confirmée : MVP < 5 min | 90j < 2–3 min
- Conversion conversation → commande : MVP +10–20% | 90j +20–35%
- Taux d’erreur commande : MVP -30% | 90j -50%
- % adresses complètes 1er essai : MVP > 70% | 90j > 85%
- Taux fantômes : MVP -20–30% | 90j -40%
- Temps gagné / jour : MVP ≥ 45 min | 90j ≥ 90 min
- % commandes via VenteFlash : MVP > 50% | 90j > 80%
- Rétention vendeurs : M1 > 60% | M3 > 40–50%

## Product Scope

### MVP - Minimum Viable Product
- WhatsApp-first avec intents simples (commander, réserver, suivi, handoff).
- Mode LIVE : codes, réservation atomique, file d’attente, expiration.
- Mode catalogue minimal + panier + livraison par commune.
- Paiement à la livraison + acompte manuel (preuve).
- Dashboard minimal (statuts, commandes, items live, frais).
- Observabilité de base + SLA bot.

### Growth Features (Post-MVP)
- Multi-agents simple (assignation, notes internes).
- Import catalogue CSV + variantes.
- Relances paniers/confirmations.
- Paiement via lien + webhooks.
- Délivrabilité et latence améliorées.

### Vision (Future)
- Omnicanal (IG/TikTok + WhatsApp).
- Livraison : assignation coursier + tracking.
- Analytics avancés (cohortes, LTV, segments).
- Marketplaces partenaires.

## User Journeys

### 1) Aïcha — Vendeuse live (happy path)
**Opening scene:** Aïcha lance un live. Elle utilise son téléphone pour le live et garde WhatsApp ouvert (ou un second appareil si possible), mais le système doit fonctionner même sans assistante.
**Rising action:** Pendant le live, elle crée des articles en 2 secondes (A12, A13...). Les clientes envoient le code sur WhatsApp. VenteFlash réserve automatiquement la première cliente (statut “Réservé”, expiration T+10 min), collecte adresse + commune, calcule les frais.
**Climax:** La cliente confirme → statut “Confirmé”, récap envoyé. À la fin du live, Aïcha a une liste claire “confirmé → à livrer”.
**Resolution:** Elle enchaîne la préparation et la livraison, avec notifications de statut automatiques.

**Règles (MVP)**
- Réservation : 10 min par défaut, configurable.
- Confirmation : message/bouton ; sinon expiration automatique.
- Adresse : commune/quartier + point de repère obligatoires.

**Events à logger**
- live_on, item_created, item_claimed, reservation_started, address_captured, order_confirmed, status_changed, message_sent

---

### 2) Aïcha — Edge case (expirations / no-show / changements)
**Opening scene:** Aïcha présente une pièce très demandée. Plusieurs clientes envoient le code.
**Rising action:** La première cliente ne confirme pas dans les 10 minutes → expiration automatique, l’article est libéré et la suivante en liste d’attente est notifiée.
**Climax:** Une cliente confirme puis change d’adresse. Si les frais augmentent, le bot demande reconfirmation (et acompte complémentaire si nécessaire). Si le total ne change pas, simple notification.
**Resolution:** Les exceptions sont gérées sans casser le flux ni créer de litige.

**Règles (MVP)**
- Expiration : libération automatique + notification liste d’attente.
- Changement d’adresse : recalcul frais + reconfirmation si total change.

**Events à logger**
- reservation_expired, waitlist_notified, address_changed, fee_recalculated, reconfirm_requested

---

### 3) Kader — Manager multi-agents (ops & supervision)
**Opening scene:** Kader gère 5 agents sur WhatsApp. Les doublons et erreurs explosent.
**Rising action:** Il active VenteFlash, attribue les conversations, suit les statuts, et configure des messages pré-rédigés (MVP).
**Climax:** Lors d’un pic, chaque commande est tracée : qui gère quoi, où ça bloque. Kader réalloue.
**Resolution:** Le service devient homogène, les erreurs chutent, il reprend le contrôle sans quitter WhatsApp.

**Règles (MVP / Growth)**
- MVP : messages pré-rédigés simples.
- Growth : templates WhatsApp paramétrables + règles.

**Events à logger**
- agent_assigned, status_updated, template_used, handoff_triggered

---

### 4) Cliente finale — achat + suivi + liste d’attente
**Opening scene:** Elle voit un article en live, envoie “A12”.
**Rising action:** Le bot réserve l’article (statut “Réservé”, T+10 min), elle envoie son adresse, reçoit le total et confirme.
**Edge case:** L’article est déjà réservé → liste d’attente. Quand il se libère, elle est notifiée et peut confirmer.
**Climax:** Elle reçoit un récap clair + numéro de commande, puis des notifications de statut.
**Resolution:** Elle suit sa commande sans relance. Si elle envoie “STOP”, les messages non essentiels sont bloqués, et elle reçoit une confirmation de STOP.

**Règles (MVP)**
- Liste d’attente : notification immédiate en cas de libération.
- Opt-out : STOP = arrêt des messages non essentiels.

**Events à logger**
- waitlist_joined, waitlist_promoted, stop_received, stop_confirmed

---

### 5) Owner/Admin — pilot business
**Opening scene:** Le propriétaire veut vérifier que VenteFlash améliore réellement les ventes et réduit les fantômes.
**Rising action:** Il suit les commandes confirmées et livrées par semaine, le taux de confirmation live, et les annulations.
**Climax:** Il suit MRR, vendeurs actifs et coût WhatsApp ; les métriques montrent un gain clair (temps gagné, hausse de conversion), il décide de pérenniser l’abonnement.
**Resolution:** Le pilot devient la base de croissance (plus de vendeurs, plus d’agents).

**Règles (MVP)**
- Les métriques business sont visibles au niveau tenant (hebdo).

**Events à logger**
- orders_confirmed_weekly, orders_delivered_weekly, cancellations_count, active_vendor_weekly

## Domain-Specific Requirements

### A) Contraintes WhatsApp (messaging platform)
- Fenêtre de conversation : distinguer messages initiés par l’utilisateur vs notifications sortantes (templates / messages autorisés).
- Opt-out : gérer “STOP” (désinscription) + confirmation + blocage des messages non essentiels.
- Idempotence webhook : un événement peut arriver 2x → aucun doublon de commande / message.
- Débit & pics : live = pics. Prévoir queue + retry.
- Rich messages : boutons/listes quand possible, sinon fallback texte.
- Handoff humain : bascule vers agent sans casser l’historique et sans boucler le bot.

### B) Contraintes Social Commerce (comportements utilisateurs)
- Messagerie chaotique : messages hors ordre, audio, emojis, doublons.
- Tolérance à l’incomplet : accepter “A12” seul, puis demander le minimum.
- Multi-intentions : “A12 + livraison Yop + je paye Orange” → parser simple (intent + entités).
- Règles anti-spam : limiter relances automatiques, éviter d’augmenter les coûts.

### C) Vente Live / Drops (stock faible / pièce unique)
- Réservation atomique : qty=1, pas de double attribution.
- File d’attente : rang, notifications, expiration.
- Expiration : SLA (exécuter à ±30s).
- Preuve visuelle : photo optionnelle via capture client; sinon confirmation textuelle robuste (prix + description).
- Litiges : journal d’événements horodaté (qui a réservé, quand, qui a confirmé).

### D) Paiements “non régulés” (MVP)
- Paiement manuel : preuve envoyée, validation vendeur, états paiement (non payé / en attente / validé / refusé).
- Pas de détention de fonds : pas de wallet, pas d’escrow, pas de “collecte” en ton nom.
- Références : chaque commande doit avoir un identifiant/référence affichable au client.

### E) Livraison locale (Abidjan / communes-quartiers)
- Adresse non normalisée : commune + quartier + point de repère obligatoire (pas d’adresse postale).
- Grille de frais : par commune (MVP), extensible quartier plus tard.
- Changement d’adresse : recalcul + reconfirmation si total change.
- Statuts : “en livraison” ≠ “livré” (preuve simple côté vendeur).

### F) Multi-tenant B2B (SaaS)
- Isolation des données : vendeur A ne voit jamais vendeur B.
- Rôles : MVP = admin vendeur + (optionnel) agents; Growth = permissions.
- Journal d’audit : changements statut/paiement.

### G) Support & opérabilité (MVP)
- Console erreurs : messages échoués, retries, expirations ratées.
- Rejouer événements : capacité de rejouer/corriger une commande.
- Export minimal : CSV des commandes.

## Innovation & Novel Patterns

### Detected Innovation Areas
- Live-first “allocation engine” : orchestration d’un marché de pièces uniques en live (réservation atomique, file d’attente, expiration, reconquête automatique).
- Ops locale intégrée : commune/quartier, point de repère, frais variables, no-show — workflow d’exécution, pas juste un inbox.
- Capture-to-confirm : preuve visuelle via capture client, sans assistante, avec fallback texte.

### Market Context & Competitive Landscape
- Les solutions WhatsApp existantes couvrent surtout inbox + automatisations, peu d’orchestration live des pièces uniques.
- Les storefronts e‑commerce classiques ne gèrent pas la logique “premier arrivé / réservation / expiration”.

### Validation Approach
- Pilote 7–14 jours avec 3–5 vendeuses live.
- Script live + lien WhatsApp + flow “code → réservation → confirmation → adresse”.
- Mesures clés : % usage code, % confirmations dans la fenêtre, temps fin de live → liste confirmés, taux litiges/no-show.
- Seuil : ≥ 60% d’usage du code + retour vendeur “je revis”.

### Risk Mitigation
- Fallback : assistant commande catalogue + livraison + suivi.
- Ajustement : capture-first si le code est rejeté.
- Pivot client : boutiques catalogue (Mariam) et équipes (Kader).

## SaaS B2B Specific Requirements

### Project-Type Overview
VenteFlash est un SaaS B2B multi-tenant avec un bot WhatsApp côté client et un dashboard vendeur. Le vendeur (boutique/marque) est le client payant. Le système doit garantir l’isolation des données, un modèle de rôles simple au MVP, et des limites de plan claires.

### Technical Architecture Considerations
- Multi-tenant strict : isolation des commandes, clients, paramètres, items live et preuves paiement.
- 1 numéro WhatsApp par tenant au MVP (recommandé). Growth : multi-numéros + multi-boutiques.
- Audit trail pour actions sensibles (paiement, annulation, changement de statut).

### Tenant Model
- Tenant = vendeur / boutique / marque (un compte VenteFlash).
- Isolation stricte des données par tenant.

### RBAC Matrix
- Owner/Admin : accès total (paramètres, produits, livraison, paiements, statuts, agents).
- Agent : traite commandes, change statuts, valide paiements (optionnel), pas d’accès aux paramètres.
- Lecture seule (optionnel MVP) : reporting simple.
- Growth : rôles fins (Finance, Ops, Support, Manager).

### Subscription Tiers
- MVP : 2–3 plans max.
  - Starter : 1 utilisateur, X commandes/mois, 1 canal WhatsApp, live + catalogue basique.
  - Pro : multi-agents, plafond plus haut, stats, relances, live avancé (queue/expiration configurable).
  - Business (optionnel) : multi-numéros, SLA support, intégrations.
- Alternative : Starter + add-ons pour simplifier.

### Integration List
- MVP : WhatsApp (Cloud API ou Baileys), pas de paiement automatique, pas de livraison intégrée.
- Growth : paiements via lien + webhooks (CinetPay/PayDunya/FedaPay), livraison (assignation/statuts), import catalogue (CSV/Google Sheets).

### Compliance Requirements
- MVP : HTTPS, stockage sécurisé, contrôle d’accès, isolation tenant.
- Journalisation des actions critiques.
- Conservation simple des preuves (durée définie).
- Consentement/opt-out (“STOP”) et respect des règles de messagerie.
- Paiement : rester non-fintech (pas de détention de fonds).
- Growth : conditions d’utilisation + politique de confidentialité, export/suppression sur demande.

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach:** Problem-solving MVP + Experience MVP (live-first). Le MVP doit résoudre la douleur n°1 (chaos → commandes fiables) et offrir une expérience live fluide. Le multi-tenant est minimal mais fonctionnel pour 5–10 vendeurs. Le revenu vient d’un pricing simple sans billing sophistiqué.

**Resource Requirements:**
- 1 dev full-stack (backend + dashboard + intégration WhatsApp + state machine).
- 1 ops/product terrain (onboarding, scripts live, baseline, support, feedback).
- Optionnel : 1 designer part‑time (UX WhatsApp + dashboard).

### MVP Feature Set (Phase 1)

**Core User Journeys Supported:**
- Vendeuse live (happy path) + edge cases (expiration/queue/changement adresse).
- Client final (réservation, confirmation, suivi, opt‑out).
- Manager (ops/supervision) au niveau minimal.

**Must-Have Capabilities:**
- Mode live : codes, réservation atomique, file d’attente, expiration.
- Commandes structurées + statut + notifications.
- Livraison par commune/quartier + recalcul si adresse change.
- Paiement à la livraison + preuve manuelle.
- Dashboard minimal + observabilité de base.

### Post-MVP Features

**Phase 2 (Growth):**
- Multi-agents + assignation.
- Import catalogue CSV / Google Sheets.
- Paiement par lien + webhooks.
- Relances contrôlées + reporting basique.

**Phase 3 (Expansion):**
- Omnicanal (IG/TikTok inbox).
- Suivi livraison / partenaires coursiers.
- Analytics avancés + optimisation data (zones à risque, acompte recommandé).

### Risk Mitigation Strategy

**Technical Risks:** fiabilité WhatsApp + gestion d’état (webhooks dupliqués, latence, réservations, expirations). Mitigation : idempotence, queues, tests live en conditions réelles.

**Market Risks:** adoption du mini‑protocole (code + confirmation/capture). Mitigation : scripts live, expérience fluide, mesure % d’usage code.

**Resource Risks:** support/onboarding terrain insuffisant. Mitigation : ops dédié + protocole de feedback court.

## Functional Requirements

### 1) Gestion des tenants & utilisateurs
- FR1 : Un tenant vendeur peut être créé via self-serve (signup) ou par un opérateur interne ; le tenant a un Owner/Admin initial.
- FR2 : Le système isole toutes les données par tenant (clients, commandes, produits, items live, paramètres, preuves).
- FR3 : Un Owner/Admin peut inviter, activer et désactiver des utilisateurs.
- FR4 : Un Owner/Admin peut définir le rôle d’un utilisateur (Admin, Agent, Lecture seule).
- FR5 : Le système applique les permissions par rôle à chaque action et ressource.
- FR6 : Le système applique les limites d’abonnement/entitlements (trial/actif/expiré, quotas par plan).
- FR7 : Un Owner/Admin peut consulter l’état d’abonnement, les quotas consommés et les limites restantes.
- FR8 : Un Owner/Admin peut connecter et gérer le canal WhatsApp du tenant (identifiant/numéro, état connecté/déconnecté).

### 2) Catalogue & items live
- FR9 : Un vendeur peut créer, modifier et désactiver des produits catalogue.
- FR10 : Un vendeur peut ajouter des variantes (taille/couleur) via des listes d’options définies par le vendeur (optionnel MVP).
- FR11 : Un vendeur peut créer un item live par code (ex : A12) avec prix et description.
- FR12 : Le système marque un item live comme disponible, réservé ou vendu.
- FR13 : Un vendeur peut consulter la liste des items live et leurs états.
- FR14 : Un vendeur peut associer une photo optionnelle à un item live (ex : capture).

### 3) Réservations / file d’attente / expirations
- FR15 : Un client peut réserver un item live via un code WhatsApp.
- FR16 : Le système attribue la réservation au premier client éligible de façon atomique (pas de double attribution).
- FR17 : Le système crée une file d’attente si l’item est déjà réservé.
- FR18 : Le système expire automatiquement une réservation non confirmée après X minutes.
- FR19 : Le système notifie la prochaine personne en file lors d’une libération.
- FR20 : Un vendeur peut configurer la durée de réservation par défaut (X minutes).
- FR21 : Le système enregistre un journal horodaté des événements de réservation (réservé, expiré, libéré, attribué).

Définition “éligible” (MVP) : client non bloqué, non opt-out, et interaction dans un contexte valide.

### 4) Commandes & statuts
- FR22 : Le système crée une commande structurée à partir d’une conversation (catalogue ou item live).
- FR23 : Le système attribue un numéro unique à chaque commande.
- FR24 : Un vendeur peut changer le statut d’une commande (Nouveau → Confirmé → Préparation → En livraison → Livré / Annulé).
- FR25 : Le client reçoit un récapitulatif lors de la confirmation (article(s), frais, total, adresse).
- FR26 : Le client reçoit une notification lors des changements de statut.
- FR27 : Le vendeur peut corriger une commande (adresse, total, notes) avec historique des modifications.
- FR28 : Le système conserve un historique des statuts et timestamps (audit de cycle de vie).

### 5) Livraison & frais
- FR29 : Un vendeur peut définir une grille de frais par commune (MVP) et la mettre à jour.
- FR30 : Le système calcule automatiquement les frais selon la commune sélectionnée.
- FR31 : Le client doit fournir commune/quartier + point de repère pour confirmer la commande.
- FR32 : Le vendeur peut mettre à jour l’adresse et déclencher un recalcul des frais.
- FR33 : Le système demande reconfirmation si le total change suite à une modification (ex : frais).
- FR34 : Le système enregistre la version “avant/après” des informations de livraison lors des corrections.

### 6) Paiement “preuve”
- FR35 : Le système propose “paiement à la livraison” par défaut.
- FR36 : Le client peut envoyer une preuve de paiement manuelle (image/texte) liée à une commande.
- FR37 : Le vendeur peut valider ou refuser une preuve de paiement.
- FR38 : Le système enregistre l’état de paiement (non payé / en attente / validé / refusé).
- FR39 : Le système lie chaque preuve à une commande avec horodatage et auteur (client).
- FR40 : Le système enregistre le montant attendu et le montant déclaré, avec un indicateur “partiel/à compléter”.

### 7) Messaging WhatsApp & templates
- FR41 : Le système reçoit et traite les messages WhatsApp entrants.
- FR42 : Le système répond avec des messages guidés (texte ; boutons/listes si disponibles ; fallback texte).
- FR43 : Le système permet le handoff vers un humain (bascule de conversation, reprise possible).
- FR44 : Un vendeur peut utiliser des messages pré-rédigés (MVP) pour confirmation/retard/rupture.
- FR45 : Le système respecte l’opt-out “STOP”, confirme la désinscription, et marque le client opt-out.
- FR46 : Le système bloque les messages non essentiels après opt-out (et applique la règle définie au PRD).
- FR47 : Le système gère les relances transactionnelles selon des règles définies (ex : max 2 relances, déclencheur “réservation expire”).

### 8) Observabilité & support ops
- FR48 : Le système journalise les événements clés (message reçu, intent, commande créée, réservation, statut, paiement, message envoyé/échoué).
- FR49 : Le système expose une file d’erreurs (messages échoués, expirations ratées, médias non attachés).
- FR50 : Un opérateur peut corriger une commande et relancer une notification (MVP) ; le replay d’événements est prévu en Growth.
- FR51 : Un vendeur peut exporter les commandes en CSV.
- FR52 : Le système conserve un audit trail des actions sensibles (validation paiement, annulation, changement statut, modification total/adresse).

Transverses (fiabilité / données)
- FR53 : Le système garantit l’idempotence des webhooks (aucun doublon de réservation/commande si un événement arrive plusieurs fois).
- FR54 : Le système applique une politique de rétention des preuves de paiement (durée fixe MVP ou paramétrable), avec suppression automatique.

## Non-Functional Requirements

### Performance
- Réponse bot P95 : MVP < 3s | Growth < 1.5s, mesuré via logs bot sous charge normale.
- Création commande + récap P95 : MVP < 10s, mesuré via horodatage backend.
- Changement statut → notification P95 : MVP < 10s, mesuré via logs d’envoi.
- Attribution live (code → réservé) P95 : MVP < 2s, mesuré via timestamps réservation.
- Notification file d’attente (libération → notif #1) P95 : MVP < 10s | Growth < 5s, mesuré via logs d’envoi.

### Reliability & Resilience
- Uptime API + dashboard : MVP ≥ 99.5% mensuel | Growth ≥ 99.9%, mesuré via monitoring.
- Dégradation contrôlée : message “incident / réessayer” si service indisponible, testé en simulation d’incident.
- Expiration réservations : précision ±30s, mesurée via scheduler logs.
- Sauvegarde DB quotidienne + restauration testée mensuellement, attestée par logs de backup.

### Messaging Delivery (WhatsApp)
- Taux d’échec envoi (hors numéros invalides) : MVP < 1% | Growth < 0.3%, mesuré via logs d’envoi.
- Taux de duplication : MVP < 0.1%, mesuré via détection d’identifiants dupliqués.
- Idempotence webhooks : aucun doublon de réservation/commande, vérifié par tests et logs.

### Security & Privacy
- Chiffrement en transit (HTTPS) + stockage sécurisé, vérifié via configuration sécurité.
- Isolation multi-tenant stricte, validée par tests d’accès croisé.
- Audit trail actions sensibles (paiement/statut/annulation), vérifié par logs d’audit.
- Opt-out “STOP” respecté ; seuls messages transactionnels définis au PRD autorisés après STOP, vérifié par tests.
- Rétention preuves de paiement : X jours (MVP fixe), purge automatique, vérifiée par tâche planifiée.

### Scalability
- MVP : 10 vendeurs, pics live 500 msgs/heure chacun, SLA respectés, validé via tests de charge.
- Growth : 100 vendeurs avec scaling horizontal (queue + workers), validé via tests de montée en charge.

### Integration
- WhatsApp : support d’une intégration officielle ou alternative validée, mesuré via tests de connexion.
- Pannes API WhatsApp : reprise automatique des envois échoués avec file de reprise, mesurée via taux de retry.
- Handoff humain sans perte de contexte, validé via tests de conversation.

### Observability & Support
- Logs d’événements : message reçu, intent, commande, statut, paiement, envoi, vérifiés via pipeline logs.
- Alertes si échec messages > 2% sur 15 min, mesurées par monitoring.
- File d’erreurs opérables (expirations ratées, médias non attachés), vérifiée via console ops.
