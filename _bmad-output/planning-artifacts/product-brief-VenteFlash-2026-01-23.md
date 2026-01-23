---
stepsCompleted: [1, 2, 3, 4, 5]
inputDocuments: []
date: 2026-01-23
author: Fabrice
---

# Product Brief: VenteFlash

<!-- Content will be appended sequentially through collaborative workflow steps -->

## Executive Summary

VenteFlash est un système de vente opérationnel pour le commerce social en Côte d’Ivoire. Il transforme le chaos des messages (WhatsApp/Instagram/TikTok/Facebook) en commandes structurées, traçables et livrables. Grâce à un bot WhatsApp et un back-office SaaS, VenteFlash réduit les questions répétitives, limite les erreurs, sécurise les réservations (y compris en live / pièces uniques) et simplifie l’exécution de la livraison.

---

## Core Vision

### Problem Statement

Les vendeurs social commerce gèrent aujourd’hui leurs ventes dans un mélange de DM/WhatsApp, notes téléphone, carnets et parfois Excel/Sheets non synchronisés. Cette gestion manuelle entraîne un désordre opérationnel : informations perdues, erreurs (taille/couleur/adresse), calculs de livraison approximatifs, confirmations lentes — et en live, l’incapacité de gérer proprement l’ordre d’arrivée et les articles à stock très faible (souvent 1).

### Problem Impact

Le coût est direct et mesurable :

Temps : réponses répétées, ressaisie d’infos, suivi manuel.

Argent : livraisons inutiles, retours, pièces immobilisées.

Qualité : disputes (“qui était premier”), erreurs de commande, service perçu comme peu fiable.

Croissance : plafond opérationnel (impossible de traiter plus), fatigue, burnout, dégradation de réputation (“elle ne répond pas”, “elle a donné ma pièce à quelqu’un d’autre”).

### Why Existing Solutions Fall Short

Les solutions existantes se répartissent en trois familles, toutes incomplètes pour ce contexte :

E-commerce/catalogue : utile hors live, mais mal adapté au stock 1, à la réservation instantanée, à la file d’attente et à la logique de confirmation.

Plateformes WhatsApp globales : puissantes mais complexes, coûteuses et surdimensionnées pour des vendeuses solo; elles ne modélisent pas bien les workflows “terrain”.

Outils artisanaux : gratuits mais chaotiques, sans traçabilité ni automatisation.

### Proposed Solution

VenteFlash propose un back-office unique piloté via WhatsApp : chaque conversation devient une commande structurée (article, variante, quantité, adresse, commune/quartier, frais de livraison, total, confirmation, statut).
Le système fonctionne en deux modes complémentaires :

Mode OFF-LIVE (catalogue) : catalogue simple + panier + livraison par commune + statut + suivi client.

Mode LIVE / à la pièce : création d’articles éphémères via code, réservation “premier arrivé”, liste d’attente, expiration automatique, confirmation (avec photo si disponible via capture client), puis collecte livraison et statut.

Le vendeur conserve le contrôle : handoff humain à tout moment, sans casser le flux.

### Key Differentiators

Workflow social-commerce terrain : code + (option capture) + réservation + file d’attente + expiration + livraison par commune/quartier + suivi.

Données locales auto-améliorées : grilles de livraison réalistes, délais observés, taux de no-show par segment, acompte recommandé.

Intégrations pragmatiques : paiements et livraison intégrés au workflow de réservation (pas juste “un lien”).

Playbook opérationnel : scripts live, templates WhatsApp, onboarding vendeur ultra-rapide.

Vision “ops” : VenteFlash est un système d’exécution (commande → livraison), pas un chatbot marketing.

Principes produit (à ajouter au brief)

WhatsApp-first, zero friction : l’action principale doit se faire en < 7 interactions.

Solo-friendly : aucun besoin d’assistante; la capture peut venir du client.

Hybride : bot pour le répétitif, humain pour l’exception.

Traçabilité : chaque commande = un numéro + statut + historique.

Local by default : commune/quartier, point de repère, pratiques réelles du terrain.

MVP Scope (très clair)

Mode catalogue : produits, variantes, commande, frais par commune, statut, notifications.

Mode live : création item par code, réservation 1er arrivé, file d’attente, timer, confirmation, commande.

Dashboard minimal : commandes + statuts + grille livraison + clients.

Paiement MVP : à la livraison + acompte manuel (preuve) + relances.

Success Metrics (dès le pilote)

Temps moyen “DM → commande confirmée”

Taux d’erreur (taille/adresse)

% commandes fantômes / annulations

% conversion conversation → commande

Temps gagné/jour côté vendeur

Rétention vendeurs (M1 / M3)

## Target Users

### Primary Users

Persona 1 — Vendeuse solo “Live/Drops”

Nom & contexte : Aïcha, 26–30 ans, Abidjan (Yopougon). Elle vend via TikTok/Instagram et finalise sur WhatsApp. Elle travaille seule, parfois avec un second téléphone.

Ce qu’elle vend : mode femme tendance (ensembles, robes, jeans, sacs, chaussures), avec beaucoup de pièces uniques ou en très petite quantité. Elle fait des drops présentés en live.

Volume : 50–150 messages/jour en temps normal, 5–20 commandes/jour. Pendant un live/drop : 200–600+ messages et 20–60 commandes potentielles.

Objectifs : répondre vite, vendre plus, réduire les commandes fantômes, éviter les disputes et la double vente, gagner du temps sur la collecte d’infos, professionnaliser l’expérience (commande numérotée + suivi).

Frustrations : submersion par les messages, no-show à la livraison, erreurs d’article/taille/adresse, fatigue et stress permanent, conflits liés à l’ordre d’arrivée.

Moment “aha” : pendant un live, la première cliente obtient l’article automatiquement, les suivantes passent en liste d’attente, la réservation expire sans confirmation, et Aïcha voit une liste claire “confirmé + adresse + frais” au lieu de trier 300 messages.

### Secondary Users

Persona 2 — Boutique “Catalogue”

Nom & contexte : Mariam, 32–38 ans, Abidjan (Cocody/Riviera). Boutique physique ou showroom, ventes continues via WhatsApp/Instagram.

Ce qu’elle vend : cosmétiques/parfums ou mode basique à stock répétitif, prix fixes, stock suivi.

Volume : 80–250 messages/jour, 10–35 commandes/jour.

Objectifs : répondre vite, convertir plus, process pro (catalogue + panier + suivi), réduire erreurs, accélérer préparation/livraison, garder une base clients.

Frustrations : répétition des questions, infos incomplètes, suivi flou des commandes, relances “c’est où ?”.

Moment “aha” : catalogue consultable en 2 clics, commandes complètes avec frais calculés, suivi automatique qui réduit les relances.

Persona 3 — Petite équipe / multi-agents

Nom & contexte : Kader, 28–40 ans, Abidjan (Plateau/Marcory), propriétaire/manager d’une marque avec plusieurs agents.

Taille & volume : 3–8 agents, 300–1 000+ messages/jour, 30–120 commandes/jour.

Objectifs : répartir les conversations sans doublons, standardiser le process, suivre la performance, réduire erreurs/retards/litiges.

Frustrations : double réponse, commandes perdues, pas de source unique, visibilité limitée sur les blocages, qualité inégale entre agents.

Moment “aha” : attribution claire des conversations, statut unique par commande, tableau simple “à faire/en cours/livré” + stats basiques.

### User Journey

Persona 1 — Aïcha (Live/Drops)

Discovery : bouche-à-oreille entre vendeuses, démo TikTok/Instagram “avant/après”, recommandation d’un coursier, DM WhatsApp ciblé.

Onboarding : connexion WhatsApp + message d’accueil, configuration des zones de livraison (5–10 communes/quartiers), activation du mode LIVE et ajout éventuel d’un mini-catalogue.

Core usage : activation “LIVE ON” avant le live, création d’articles via codes, gestion automatique des réservations/attente/expiration, puis passage des statuts (préparation → livraison → livré). Elle ne gère que les exceptions.

Success moment : fin de live avec une liste claire de commandes confirmées, adresses et frais, sans conflit d’ordre d’arrivée ni tri manuel.

Long-term routine : rituels LIVE ON + codes, dépendance à la base clients, statuts, réduction des fantômes et grille livraison. Tout canal redirigé vers WhatsApp pour finaliser proprement.

## Success Metrics

### North Star Metric

Nombre de commandes confirmées et livrées via VenteFlash (par vendeur / semaine).

Variantes possibles : commandes confirmées / semaine, ou % de commandes confirmées sur conversations.

### User Success

- Réduction du chaos : commandes structurées “à faire / en cours / livré”.
- Conversion plus rapide (moins d’abandon pour cause de réponse tardive).
- Diminution des erreurs (taille/couleur/adresse/montant).
- Moins de commandes fantômes (confirmation + timer + acompte optionnel).
- Allègement de la charge mentale : live sans stress, fin de session claire.

### “Ça valait le coup” (preuves perçues)

- “Je gagne 1 à 2 heures par jour sur les questions répétitives et le tri.”
- “Je fais plus de ventes avec la même audience.”
- “Je ne me dispute plus : premier arrivé = premier servi.”
- “La livraison est plus simple et traçable.”
- “Moins de fantômes : on confirme ou ça passe à la suivante.”

### Business Objectives

- MRR : atteindre X FCFA/mois à 90 jours (à définir).
- Vendeurs actifs hebdo : X vendeurs (à définir).
- Churn M1 : < 40% (rétention M1 > 60%).
- Coût WhatsApp / vendeur : sous un seuil cible (à définir).

### Key Performance Indicators

A. Conversion & vitesse
- Temps DM/WhatsApp → commande confirmée
  MVP: < 5 min (hors live) | 90 jours: < 2–3 min
- Taux conversion conversation → commande confirmée
  MVP: +10–20% | 90 jours: +20–35%

B. Qualité opérationnelle
- Taux d’erreur commande (taille/couleur/adresse/montant)
  MVP: -30% | 90 jours: -50%
- % commandes avec adresse complète à la première saisie
  MVP: > 70% | 90 jours: > 85%
- Relances “c’est où ?” par commande
  MVP: -20% | 90 jours: -40%

C. No-show / fantômes
- Taux de commande fantôme
  MVP: -20–30% | 90 jours: -40%
- Taux de confirmation dans la fenêtre live (ex: 10 min)
  MVP: > 60% | 90 jours: > 75%
- Temps perdu par commande fantôme
  Cible: -30% en 90 jours

D. Gain de temps & adoption
- Temps gagné / jour
  MVP: ≥ 45 min/j | 90 jours: ≥ 90 min/j
- % commandes via VenteFlash
  MVP: > 50% | 90 jours: > 80%
- Rétention vendeurs
  MVP: M1 > 60% | 90 jours: M3 > 40–50%

### Guardrails

- Satisfaction client (micro feedback 1–5 après livraison) : cible > 4.2/5
- Taux d’escalade vers humain : < 25% hors live
- Temps de résolution des exceptions (adresse change, rupture stock) : médiane < 10 min

### Mesure MVP (simple)

- Logs d’événements : message reçu, commande créée, confirmée, statut, livrée/annulée.
- Baseline avant pilote sur 7 jours : messages, commandes, erreurs, fantômes, temps passé.
- Comparaison après 2 semaines.

## MVP Scope

### Core Features

Le MVP doit permettre à une vendeuse solo de transformer des messages en commandes structurées, gérer une vente live sans conflit (premier arrivé, file d’attente, expiration), piloter la livraison (adresse + frais par commune + statut), et réduire les fantômes (confirmation + timer + acompte manuel optionnel).

In-scope (MVP) :

A. Canal & conversation (WhatsApp-first)
- Connexion WhatsApp (Cloud API ou Baileys pour pilote).
- Flux conversationnels simples : commander (catalogue), réserver (code live), suivre commande, parler à un humain (handoff).

B. Mode LIVE / Drops
- Commandes admin ultra simples : LIVE ON / LIVE OFF, NEW A12 15000 "ensemble noir M" qty=1.
- Côté client : code → réservation si dispo, liste d’attente si pris, timer d’expiration (ex: 10 min), confirmation (“Confirmer / Annuler”).
- Option photo : capture client ou texte si pas d’image.

C. Mode OFF-LIVE / Catalogue
- Catalogue minimal : produits (nom, prix, 1 photo optionnelle), variantes simples (taille/couleur) si besoin.
- Panier minimal (quantité + total).
- Checkout : commune/quartier, point de repère/adresse, téléphone.
- Frais de livraison par commune (table configurable).
- Création commande + numéro + récap.

D. Paiement MVP
- Paiement à la livraison.
- Option acompte manuel : instructions, bouton “J’ai payé”, preuve image, validation manuelle.

E. Dashboard vendeur (back-office minimal)
- Liste commandes avec statuts : Nouveau → Confirmé → Préparation → En livraison → Livré / Annulé.
- Détail commande (client, adresse, frais, total).
- Liste items live (dispo/réservé/vendu + file d’attente).
- Paramètres livraison (communes + frais).
- Templates messages (confirmations/rupture/retard).

Fonctionnalités MVP qui déclenchent l’adoption (Aïcha) :
- Réservation live + ordre d’arrivée + file d’attente.
- Expiration automatique des réservations non confirmées.
- Commande numérotée + récap clair envoyé au client.
- Adresse complète + frais calculés par commune.
- Statuts + notifications (moins de “c’est où ?”).

### Out of Scope for MVP

- Intégration automatique Mobile Money (webhook de paiement).
- Intégration automatique livreurs / tracking GPS.
- Gestion avancée de stock (inventaire complet, achats, fournisseurs).
- Multi-boutiques / franchise, rôles complexes, permissions avancées.
- IA “compréhension libre” sophistiquée (intents simples + guidage seulement).
- Campagnes marketing (broadcast, segmentation avancée).
- SAV avancé (retours structurés, remboursements automatiques).
- Omnicanal natif (IG/TikTok DM dans la même inbox) — redirection vers WhatsApp.

### MVP Success Criteria

Sur 5–10 vendeurs pilotes, à 2–4 semaines :
- > 50% des commandes passent via VenteFlash.
- Temps moyen DM → commande confirmée < 5 min (hors live).
- -20% de commandes fantômes vs baseline.
- -30% d’erreurs de commande vs baseline.
- Vendeurs déclarent ≥ 45 min/jour gagnées.
- Rétention : M1 > 60% sur cohorte pilote.

### Future Vision

V1 (après MVP, stabilisation)
- Multi-agents simple (assignation, notes internes).
- Import catalogue CSV + variantes.
- Relances paniers/confirmations propres.
- SAV léger (signalement problème, échange).

V2 (effet réseau & automatisation)
- Paiements via lien (CinetPay/PayDunya/FedaPay) + webhooks.
- Livraison : assignation coursier + statuts côté livreur.
- Recommandations opérationnelles (acompte conseillé, zones risquées).

V3 (plateforme)
- Omnicanal (inbox IG/TikTok + WhatsApp).
- Analytics avancés (cohortes, LTV, segments).
- Marketplaces partenaires (livreurs, fournisseurs, agences).

Règle de décision (ambition vs valeur rapide)
- Réduit-elle le chaos aujourd’hui ?
- Réduit-elle les fantômes/erreurs ?
- Augmente-t-elle la conversion immédiatement ?
Si non → hors MVP.
