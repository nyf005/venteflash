# VenteFlash - Epic Breakdown

## Overview

Ce document decompose les exigences du PRD, UX et Architecture en epics et stories implementables avec criteres d'acceptation testables.

## Requirements Inventory

### Functional Requirements

- FR1: Un tenant vendeur peut etre cree via self-serve (signup) ou par un operateur interne ; le tenant a un Owner/Admin initial.
- FR2: Le systeme isole toutes les donnees par tenant (clients, commandes, produits, items live, parametres, preuves).
- FR3: Un Owner/Admin peut inviter, activer et desactiver des utilisateurs.
- FR4: Un Owner/Admin peut definir le role d'un utilisateur (Admin, Agent, Lecture seule).
- FR5: Le systeme applique les permissions par role a chaque action et ressource.
- FR6: Le systeme applique les limites d'abonnement/entitlements (trial/actif/expire, quotas par plan).
- FR7: Un Owner/Admin peut consulter l'etat d'abonnement, les quotas consommes et les limites restantes.
- FR8: Un Owner/Admin peut connecter et gerer le canal WhatsApp du tenant (identifiant/numero, etat connecte/deconnecte).
- FR9: Un vendeur peut creer, modifier et desactiver des produits catalogue.
- FR10: Un vendeur peut ajouter des variantes (taille/couleur) via des listes d'options definies par le vendeur (optionnel MVP).
- FR11: Un vendeur peut creer un item live par code (ex : A12) avec prix et description.
- FR12: Le systeme marque un item live comme disponible, reserve ou vendu.
- FR13: Un vendeur peut consulter la liste des items live et leurs etats.
- FR14: Un vendeur peut associer une photo optionnelle a un item live (ex : capture).
- FR15: Un client peut reserver un item live via un code WhatsApp.
- FR16: Le systeme attribue la reservation au premier client eligible de facon atomique (pas de double attribution).
- FR17: Le systeme cree une file d'attente si l'item est deja reserve.
- FR18: Le systeme expire automatiquement une reservation non confirmee apres X minutes.
- FR19: Le systeme notifie la prochaine personne en file lors d'une liberation.
- FR20: Un vendeur peut configurer la duree de reservation par defaut (X minutes).
- FR21: Le systeme enregistre un journal horodate des evenements de reservation (reserve, expire, libere, attribue).
- FR22: Le systeme cree une commande structuree a partir d'une conversation (catalogue ou item live).
- FR23: Le systeme attribue un numero unique a chaque commande.
- FR24: Un vendeur peut changer le statut d'une commande (Nouveau -> Confirme -> Preparation -> En livraison -> Livre / Annule).
- FR25: Le client recoit un recapitulatif lors de la confirmation (article(s), frais, total, adresse).
- FR26: Le client recoit une notification lors des changements de statut.
- FR27: Le vendeur peut corriger une commande (adresse, total, notes) avec historique des modifications.
- FR28: Le systeme conserve un historique des statuts et timestamps (audit de cycle de vie).
- FR29: Un vendeur peut definir une grille de frais par commune (MVP) et la mettre a jour.
- FR30: Le systeme calcule automatiquement les frais selon la commune selectionnee.
- FR31: Le client doit fournir commune/quartier + point de repere pour confirmer la commande.
- FR32: Le vendeur peut mettre a jour l'adresse et declencher un recalcul des frais.
- FR33: Le systeme demande reconfirmation si le total change suite a une modification (ex : frais).
- FR34: Le systeme enregistre la version avant/apres des informations de livraison lors des corrections.
- FR35: Le systeme propose paiement a la livraison par defaut.
- FR36: Le client peut envoyer une preuve de paiement manuelle (image/texte) liee a une commande.
- FR37: Le vendeur peut valider ou refuser une preuve de paiement.
- FR38: Le systeme enregistre l'etat de paiement (non paye / en attente / valide / refuse).
- FR39: Le systeme lie chaque preuve a une commande avec horodatage et auteur (client).
- FR40: Le systeme enregistre le montant attendu et le montant declare, avec un indicateur partiel/a completer.
- FR41: Le systeme recoit et traite les messages WhatsApp entrants.
- FR42: Le systeme repond avec des messages guides (texte ; boutons/listes si disponibles ; fallback texte).
- FR43: Le systeme permet le handoff vers un humain (bascule de conversation, reprise possible).
- FR44: Un vendeur peut utiliser des messages pre-rediges (MVP) pour confirmation/retard/rupture.
- FR45: Le systeme respecte l'opt-out STOP, confirme la desinscription, et marque le client opt-out.
- FR46: Le systeme bloque les messages non essentiels apres opt-out.
- FR47: Le systeme gere les relances transactionnelles selon des regles definies (max 2 relances, declencheur reservation expire).
- FR48: Le systeme journalise les evenements cles (message recu, intent, commande creee, reservation, statut, paiement, message envoye/echoue).
- FR49: Le systeme expose une file d'erreurs (messages echoues, expirations ratees, medias non attaches).
- FR50: Un operateur peut corriger une commande et relancer une notification (MVP).
- FR51: Un vendeur peut exporter les commandes en CSV.
- FR52: Le systeme conserve un audit trail des actions sensibles (validation paiement, annulation, changement statut, modification total/adresse).
- FR53: Le systeme garantit l'idempotence des webhooks (aucun doublon de reservation/commande si un evenement arrive plusieurs fois).
- FR54: Le systeme applique une politique de retention des preuves de paiement (duree fixe MVP ou parametrable), avec suppression automatique.

### NonFunctional Requirements

- NFR1: Reponse bot P95 : MVP < 3s | Growth < 1.5s.
- NFR2: Creation commande + recap P95 : MVP < 10s.
- NFR3: Changement statut -> notification P95 : MVP < 10s.
- NFR4: Attribution live (code -> reserve) P95 : MVP < 2s.
- NFR5: Notification file d'attente P95 : MVP < 10s | Growth < 5s.
- NFR6: Uptime API + dashboard : MVP >= 99.5% | Growth >= 99.9%.
- NFR7: Degradation controlee : message incident si indisponible.
- NFR8: Expiration reservations : precision +/- 30s.
- NFR9: Sauvegarde DB quotidienne + restauration testee mensuellement.
- NFR10: Taux d'echec envoi < 1% MVP | < 0.3% Growth.
- NFR11: Taux de duplication < 0.1% MVP.
- NFR12: Idempotence webhooks : aucun doublon de reservation/commande.
- NFR13: Chiffrement en transit (HTTPS) + stockage securise.
- NFR14: Isolation multi-tenant stricte.
- NFR15: Audit trail actions sensibles.
- NFR16: Opt-out STOP respecte.
- NFR17: Retention preuves paiement X jours + purge auto.
- NFR18: MVP 10 vendeurs, pics live 500 msgs/heure.
- NFR19: Growth 100 vendeurs avec scaling horizontal.
- NFR20: Integration WhatsApp officielle ou alternative validee.
- NFR21: Reprise automatique des envois echoues (retry).
- NFR22: Handoff humain sans perte de contexte.
- NFR23: Logs d'evenements complets (message, intent, commande, statut, paiement, envoi).
- NFR24: Alertes si echec messages > 2% sur 15 min.
- NFR25: File d'erreurs operables (expirations ratees, medias non attaches).

### Additional Requirements

- Contraintes WhatsApp (fenetre conversation, templates, idempotence webhook, handoff).
- Contraintes live (reservation atomique, file d'attente, expiration, litiges horodates).
- Paiement non-fintech (preuve manuelle, pas de detentions de fonds).
- Livraison locale (communes/quartiers, point de repere, recalcul frais).
- Multi-tenant SaaS (isolation donnees, roles, audit).
- Support ops (console erreurs, replay, export CSV).

### FR Coverage Map

- FR1 -> Epic 1 / Story 1.2
- FR2 -> Epic 1 / Story 1.3
- FR3 -> Epic 1 / Story 1.4
- FR4 -> Epic 1 / Story 1.4
- FR5 -> Epic 1 / Story 1.4
- FR6 -> Epic 1 / Story 1.5
- FR7 -> Epic 1 / Story 1.5
- FR8 -> Epic 1 / Story 1.6
- FR9 -> Epic 2 / Story 2.1
- FR10 -> Epic 2 / Story 2.2
- FR11 -> Epic 2 / Story 2.3
- FR12 -> Epic 2 / Story 2.3
- FR13 -> Epic 2 / Story 2.3
- FR14 -> Epic 2 / Story 2.4
- FR15 -> Epic 3 / Story 3.1
- FR16 -> Epic 3 / Story 3.1
- FR17 -> Epic 3 / Story 3.2
- FR18 -> Epic 3 / Story 3.3
- FR19 -> Epic 3 / Story 3.2
- FR20 -> Epic 3 / Story 3.4
- FR21 -> Epic 3 / Story 3.5
- FR22 -> Epic 4 / Story 4.1
- FR23 -> Epic 4 / Story 4.1
- FR24 -> Epic 4 / Story 4.2
- FR25 -> Epic 4 / Story 4.1
- FR26 -> Epic 4 / Story 4.2
- FR27 -> Epic 4 / Story 4.3
- FR28 -> Epic 4 / Story 4.2
- FR29 -> Epic 4 / Story 4.4
- FR30 -> Epic 4 / Story 4.4
- FR31 -> Epic 4 / Story 4.5
- FR32 -> Epic 4 / Story 4.6
- FR33 -> Epic 4 / Story 4.6
- FR34 -> Epic 4 / Story 4.6
- FR35 -> Epic 5 / Story 5.1
- FR36 -> Epic 5 / Story 5.2
- FR37 -> Epic 5 / Story 5.3
- FR38 -> Epic 5 / Story 5.3
- FR39 -> Epic 5 / Story 5.2
- FR40 -> Epic 5 / Story 5.4
- FR41 -> Epic 6 / Story 6.1
- FR42 -> Epic 6 / Story 6.2
- FR43 -> Epic 6 / Story 6.3
- FR44 -> Epic 6 / Story 6.4
- FR45 -> Epic 6 / Story 6.5
- FR46 -> Epic 6 / Story 6.5
- FR47 -> Epic 6 / Story 6.6
- FR48 -> Epic 7 / Story 7.1
- FR49 -> Epic 7 / Story 7.2
- FR50 -> Epic 7 / Story 7.3
- FR51 -> Epic 7 / Story 7.4
- FR52 -> Epic 4 / Story 4.2
- FR53 -> Epic 6 / Story 6.1
- FR54 -> Epic 5 / Story 5.5

## Epic List

- Epic 1: Onboarding, acces et entitlements
- Epic 2: Catalogue et items live
- Epic 3: Reservation live et file d'attente
- Epic 4: Commandes, livraison et statuts
- Epic 5: Paiement et preuves
- Epic 6: Messaging WhatsApp et automatisations
- Epic 7: Observabilite et operations

## Epic 1: Onboarding, acces et entitlements

Permettre a un vendeur de creer un compte, de gerer son equipe, ses droits et son canal WhatsApp, avec entitlements visibles.

### Story 1.1: Setup initial du projet (starter template)

As a developpeur,
I want initialiser le monorepo via le starter template defini,
So that la base technique est conforme a l'architecture.

**Acceptance Criteria:**

Given le depot vide
When le projet est initialise via create-turbo et pnpm
Then les apps `apps/web` et `apps/worker` demarrent localement sans erreur
And un README de demarrage liste les commandes `pnpm dev` et `pnpm lint`.

### Story 1.2: Signup tenant + owner creation

As an Owner/Admin,
I want creer un tenant et mon compte proprietaire,
So that je puisse acceder a mon espace vendeur.

**Acceptance Criteria:**

Given un nouvel utilisateur
When il soumet le formulaire de creation tenant
Then un tenant et un owner sont crees avec un identifiant unique.

### Story 1.3: Isolation multi-tenant et RLS

As an Owner/Admin,
I want que mes donnees soient isolees des autres vendeurs,
So that les informations restent privees.

**Acceptance Criteria:**

Given deux tenants distincts
When un utilisateur tente d'acceder aux donnees d'un autre tenant
Then l'acces est refuse par RLS et journalise.

### Story 1.4: Gestion des utilisateurs et roles

As an Owner/Admin,
I want inviter, activer et assigner des roles a mon equipe,
So that chacun accede aux fonctions autorisees.

**Acceptance Criteria:**

Given un owner connecte
When il invite un agent et definit son role
Then l'utilisateur recoit l'acces conforme au role attribue.
And les actions interdites retournent une erreur d'autorisation.

### Story 1.5: Entitlements et quotas d'abonnement

As an Owner/Admin,
I want voir l'etat d'abonnement et mes quotas,
So that je sache si mon plan limite mes actions.

**Acceptance Criteria:**

Given un tenant actif
When il consulte la page abonnement
Then les quotas restants et l'etat trial/actif/expire sont affiches.
And les actions depassant les quotas sont bloquees avec un message clair.

### Story 1.6: Connexion et gestion du canal WhatsApp

As an Owner/Admin,
I want connecter et gerer mon canal WhatsApp,
So that le bot puisse traiter les messages clients.

**Acceptance Criteria:**

Given un owner connecte
When il enregistre ou met a jour les identifiants WhatsApp
Then le statut connecte/deconnecte est visible et conserve.
And une deconnexion forcee marque le canal comme indisponible.

## Epic 2: Catalogue et items live

Permettre aux vendeurs de gerer un catalogue et de creer des items live utilisables pendant un live.

### Story 2.1: CRUD catalogue produits

As a vendeur,
I want creer, modifier et desactiver des produits catalogue,
So that je garde un catalogue a jour.

**Acceptance Criteria:**

Given un vendeur connecte
When il ajoute ou edite un produit
Then le produit apparait dans la liste catalogue avec statut actif/inactif.

### Story 2.2: Variantes de produits

As a vendeur,
I want definir des variantes (taille/couleur),
So that je propose plusieurs options pour un produit.

**Acceptance Criteria:**

Given un produit catalogue
When je cree des options de variantes
Then les variantes sont selectionnables lors de la commande.

### Story 2.3: Creation et consultation des items live

As a vendeuse live,
I want creer un item live avec code, prix, description,
So that je lance une reservation rapide pendant le live.

**Acceptance Criteria:**

Given un live actif
When je cree un item live A12
Then l'item apparait avec statut Disponible et un code unique.
And je peux consulter la liste des items live et leurs etats.

### Story 2.4: Photo optionnelle pour item live

As a vendeuse live,
I want associer une photo a un item live,
So that les clientes comprennent mieux l'article.

**Acceptance Criteria:**

Given un item live cree
When j'ajoute une photo
Then la photo est visible sur la carte live et liee a l'item.

## Epic 3: Reservation live et file d'attente

Assurer la reservation atomique, la file d'attente et l'expiration des items live.

### Story 3.1: Reservation atomique

As a cliente,
I want reserver un item live via WhatsApp,
So that je sois la premiere servie si l'article est disponible.

**Acceptance Criteria:**

Given un item live disponible
When la cliente envoie le code
Then la reservation est attribuee de facon atomique au premier client eligible.

### Story 3.2: File d'attente et notification

As a cliente,
I want etre placee en file d'attente si l'item est reserve,
So that je sois notifiee si la reservation se libere.

**Acceptance Criteria:**

Given un item deja reserve
When une autre cliente envoie le code
Then elle est ajoutee a la file d'attente avec son rang.
And elle est notifiee si la place se libere.

### Story 3.3: Expiration automatique

As a vendeuse,
I want que les reservations non confirmees expirent automatiquement,
So that les items reviennent en circulation.

**Acceptance Criteria:**

Given une reservation non confirmee
When le delai X minutes est atteint
Then la reservation passe a expiree et libere l'item.

### Story 3.4: Configuration duree reservation

As a vendeuse,
I want configurer la duree par defaut d'une reservation,
So that le live s'adapte a mon rythme.

**Acceptance Criteria:**

Given un owner connecte
When il met a jour la duree par defaut
Then les nouvelles reservations utilisent cette duree.

### Story 3.5: Journal des evenements de reservation

As an operateur,
I want un journal horodate des evenements de reservation,
So that je puisse resoudre les litiges.

**Acceptance Criteria:**

Given une reservation creee ou expiree
When un audit est consulte
Then les evenements sont horodates et associes a l'item.

### Story 3.6: Prolongation d'une reservation

As a vendeuse,
I want prolonger une reservation en cours,
So that je puisse gerer les cas limites pendant le live.

**Acceptance Criteria:**

Given une reservation active
When je prolonge de +X minutes
Then le nouveau delai est applique et journalise.

### Story 3.7: Auto-pass file d'attente

As a vendeuse,
I want activer l'auto-pass pour la file d'attente,
So that la prochaine cliente soit notifiee automatiquement a l'expiration.

**Acceptance Criteria:**

Given l'auto-pass active
When une reservation expire
Then la cliente suivante est notifiee automatiquement sans action manuelle.

## Epic 4: Commandes, livraison et statuts

Creer et suivre des commandes structurees avec statuts et livraison.

### Story 4.1: Creation commande + numero unique

As a vendeuse,
I want creer une commande a partir d'une conversation,
So that chaque achat soit trace avec un numero unique.

**Acceptance Criteria:**

Given une reservation confirmee
When la commande est creee
Then un numero unique est genere et inclus dans le recap client.

### Story 4.2: Statuts + audit trail

As a vendeuse,
I want changer le statut d'une commande avec historique,
So that le client soit notifie et l'audit conserve.

**Acceptance Criteria:**

Given une commande existante
When le statut passe a En livraison ou Livre
Then le client recoit une notification et l'historique est conserve.

### Story 4.3: Correction commande et reconfirmation

As a vendeuse,
I want corriger adresse, total ou notes,
So that la commande reste exacte et le client reconfirme si necessaire.

**Acceptance Criteria:**

Given une commande confirmee
When l'adresse ou le total change
Then une reconfirmation est demandee au client.
And les versions avant/apres sont enregistrees.

### Story 4.4: Grille de frais par commune

As a vendeuse,
I want definir une grille de frais de livraison par commune,
So that le montant soit calcule automatiquement.

**Acceptance Criteria:**

Given une grille de frais definie
When une commune est selectionnee
Then les frais sont calcules selon la grille.

### Story 4.5: Capture adresse client

As a cliente,
I want fournir commune/quartier et point de repere,
So that la livraison soit possible.

**Acceptance Criteria:**

Given une commande en attente de confirmation
When la cliente fournit commune/quartier + point de repere
Then la commande peut etre confirmee.

### Story 4.6: Mise a jour adresse et recalcul frais

As a vendeuse,
I want mettre a jour l'adresse et recalculer les frais,
So that la commande reste cohérente.

**Acceptance Criteria:**

Given une commande existante
When l'adresse change
Then les frais sont recalcules et le client doit reconfirmer si le total change.

## Epic 5: Paiement et preuves

Gerer le paiement manuel, les preuves, les montants et la retention.

### Story 5.1: Mode paiement par defaut

As a vendeuse,
I want un mode paiement par defaut a la livraison,
So that le flux MVP reste simple.

**Acceptance Criteria:**

Given une nouvelle commande
When aucun mode n'est precise
Then le mode paiement a la livraison est applique.

### Story 5.2: Soumission preuve paiement

As a cliente,
I want envoyer une preuve de paiement liee a ma commande,
So that le vendeur puisse valider.

**Acceptance Criteria:**

Given une commande avec paiement en attente
When la cliente envoie une preuve
Then la preuve est stockee et liee a la commande avec horodatage.

### Story 5.3: Validation preuve et etat paiement

As a vendeuse,
I want valider ou refuser une preuve,
So that l'etat de paiement soit mis a jour.

**Acceptance Criteria:**

Given une preuve en attente
When je valide la preuve
Then l'etat passe a Valide et le client est notifie.

### Story 5.4: Montant attendu et montant declare

As a vendeuse,
I want enregistrer le montant attendu et le montant declare,
So that je detecte les paiements partiels.

**Acceptance Criteria:**

Given une commande avec paiement
When une preuve est soumise
Then le montant attendu et declare sont stockes avec un indicateur partiel.

### Story 5.5: Retention des preuves

As a responsable ops,
I want purger les preuves apres une duree definie,
So that le systeme respecte la retention.

**Acceptance Criteria:**

Given une preuve plus ancienne que la duree de retention
When le job de purge s'execute
Then la preuve est supprimee et journalisee.

## Epic 6: Messaging WhatsApp et automatisations

Gerer l'ingestion, les intents, le handoff et les relances.

### Story 6.1: Ingestion webhook + idempotence

As a systeme,
I want traiter les webhooks WhatsApp de facon idempotente,
So that aucun doublon de reservation ou commande n'apparaisse.

**Acceptance Criteria:**

Given un message avec un messageId deja traite
When le webhook est recu a nouveau
Then le message est ignore et journalise.

### Story 6.2: Intent parsing et reponses guidees

As a cliente,
I want recevoir des reponses guidees selon mon intent,
So that je complete la commande sans confusion.

**Acceptance Criteria:**

Given un message contenant un code live
When le systeme detecte l'intent
Then il renvoie une reponse guidee avec fallback texte.

### Story 6.3: Handoff humain

As a vendeuse,
I want basculer une conversation vers un humain,
So that les cas d'exception soient geres.

**Acceptance Criteria:**

Given une conversation active
When je declenche le handoff
Then le bot cesse de repondre automatiquement et l'agent reprend.

### Story 6.4: Messages pre-rediges

As a vendeuse,
I want utiliser des messages pre-rediges,
So that je reponde vite aux situations courantes.

**Acceptance Criteria:**

Given un template configure
When je selectionne le template
Then le message est envoye au client avec suivi.

### Story 6.5: Opt-out STOP

As a cliente,
I want me desinscrire via STOP,
So that je ne recoive plus de messages non essentiels.

**Acceptance Criteria:**

Given un message STOP recu
When le systeme traite l'opt-out
Then le client est marque opt-out et recoit la confirmation.

### Story 6.6: Relances transactionnelles

As a vendeuse,
I want relancer automatiquement dans les limites definies,
So that les clientes confirment a temps.

**Acceptance Criteria:**

Given une reservation en attente
When le delai atteint la regle de relance
Then une relance est envoyee sans depasser le maximum autorise.

## Epic 7: Observabilite et operations

Assurer la visibilite, la correction d'erreurs et les exports.

### Story 7.1: Journalisation des evenements

As an operateur,
I want des logs d'evenements avec correlationId,
So that je trace le parcours d'une commande.

**Acceptance Criteria:**

Given un message entrant
When il est traite
Then un evenement est journalise avec correlationId.

### Story 7.2: File d'erreurs et retries

As an operateur,
I want une file d'erreurs et des retries,
So that les envois echoues soient recuperes.

**Acceptance Criteria:**

Given un envoi echoue
When il depasse le nombre de retries
Then il passe en file d'erreurs visible.

### Story 7.3: Correction commande et relance

As an operateur,
I want corriger une commande et relancer une notification,
So that les erreurs soient resolues sans developpement.

**Acceptance Criteria:**

Given une commande avec erreur
When je corrige et relance
Then la notification est renvoyee et l'action est auditee.

### Story 7.4: Export CSV

As a vendeuse,
I want exporter mes commandes en CSV,
So that je puisse faire des reconciliations.

**Acceptance Criteria:**

Given une periode de commandes
When j'exporte en CSV
Then le fichier contient les champs essentiels (numero, statut, total, adresse).

### Story 7.5: Liberation en masse des items live

As a vendeuse,
I want liberer plusieurs reservations en masse,
So that je nettoie rapidement les items non confirmes.

**Acceptance Criteria:**

Given plusieurs items reserves
When je selectionne et libere en masse
Then chaque item repasse a disponible et les actions sont auditees.
