# Roadmap MVP — Crédit Étudiant par le Service

> Stack : Next.js 14 (App Router) · FastAPI · Supabase (auth, storage, postgres)
> Team : 3 devs · 1 designer · 1 PM
> Durée estimée : ~16 semaines (4 sprints)

---

## Philosophie du design

- On ne copie pas les banques. On ne copie pas non plus les écoles.
- Ce qui compte : **rassurer sans intimider**. L'étudiant doit sentir qu'il postule à une opportunité, pas qu'il mendie un prêt.
- Palette sobre, typo lisible, peu de champs par écran. Un flow = une action.
- Le dashboard étudiant est la vitrine du produit. Si ça marche pour lui, le reste suit.

---

## SPRINT 0 — Fondations (2 semaines)

Avant de toucher au design, on pose le squelette :

- [x] Supabase project créé, auth email + OTP
- [x] Tables de base : users, students, companies, applications
- [x] FastAPI scaffolding : routers, models Pydantic, middlewares
- [x] Next.js setup : App Router, Tailwind, shadcn/ui (ou DaisyUI si on veut aller vite)
- [x] Variables d'env, CI de base, repo propre

Design :
- Définir la **typographie** (Inter ou Plus Jakarta Sans)
- Palette : un bleu pas agressif (#1E3A5F ou similaire), gris chaud pour les backgrounds
- Un premier composet : `Button`, `Input`, `Card` — suffit pour commencer

> Règle : tant que y'a pas un écran qui tourne en local, on touche pas au design fin.

---

## SPRINT 1 — Parcours étudiant (4 semaines)

### Objectif
Un étudiant doit pouvoir s'inscrire, faire sa demande de crédit, uploader ses documents, et voir le statut de son dossier.

### Écrans à produire

#### 1. Landing page (publique)
- Hero section : "Étudie maintenant, rembourse après ton diplôme"
- 3 étapes expliquées en 3 cartes
- CTA unique : "Postuler" → redirige vers `/register`
- Footer : mentions légales (loi 09-08, loi 43-20)

#### 2. Inscription étudiant `/register`
- 4 champs max par étape (multi-step form, 4 étapes)
- Etape 1 : email + mot de passe
- Etape 2 : nom, prénom, CIN, date de naissance
- Etape 3 : établissement, filière, niveau, moyenne actuelle
- Etape 4 : résumé + validation
- Pas de barre de progression moche. Juste "Étape 2 sur 4" en petit.

#### 3. Dashboard étudiant `/dashboard`
- Carte récap : statut du dossier (bannière colorée : rouge/jaune/vert)
- Timeline verticale des étapes (inscription → documents → révision → contrat)
- Widgets :
  - Montant demandé vs montant accordé
  - Prochaine étape (bouton d'action unique)
  - Dernière activité (date, libellé)
- Menu latéral : Mon dossier, Documents, Contrat, Paiements, Profil

#### 4. Demande de crédit `/dashboard/apply`
- Slider pour le montant mensuel (1000–5000 MAD par pallier)
- Sélecteur de durée (24, 36, 48 mois)
- Calcul en temps réel du coût total (avec commission 8-10%)
- Résumé avant soumission

#### 5. Upload de documents `/dashboard/documents`
- 6 documents requis, listés avec statut (manquant / uploadé / validé / refusé)
- Upload drag-and-drop avec prévisualisation
- OCR KYC sur la CIN (appel FastAPI côté admin, mais le design le montre comme "Vérification en cours")
- Message d'erreur clair si document refusé : "le relevé est illisible" pas "erreur 403"

#### 6. Suivi du dossier `/dashboard/status`
- Barre de progression (cette fois oui, visuelle)
- Chaque étape avec date et statut
- Si refus : phrase d'explication + champ de recours
- Notification push (toast) à chaque changement de statut

### Composants à créer (réutilisables)
- `MultiStepForm` — conteneur générique pour formulaires multi-étapes
- `FileUploader` — avec preview, validation de taille/type
- `StatusBadge` — couleurs normalisées (en_attente, validé, refusé)
- `Timeline` — composant vertical pour les étapes du dossier

### Ce qu'on NE fait PAS dans ce sprint
- Dashboard entreprise
- Paiement en ligne
- Scoring IA (juste un statut "en attente de révision")

---

## SPRINT 2 — Parcours entreprise + Contrat (4 semaines)

### Objectif
L'entreprise s'inscrit, publie un besoin, paie son investissement, reçoit un profil étudiant assigné.

### Écrans entreprise

#### 7. Inscription entreprise `/register/company`
- Formulaire avec validation légale : ICE, RC, patente, âge société (2+ ans)
- Upload des documents légaux
- Vérification financière (statut "en attente de vérification" après soumission)

#### 8. Dashboard entreprise `/company/dashboard`
- Carte : montant investi, étudiants assignés, ROI projeté
- Liste des étudiants assignés (avec statut : stage, diplômé, embauché)
- Bouton "Publier un besoin"

#### 9. Publication de besoin `/company/hiring`
- Titre du poste, description, compétences requises, nombre de postes
- Salaire proposé (min SMIG + 20%)
- Durée du contrat post-diplôme (2-3 ans)
- Budget investissement calculé automatiquement

#### 10. Profil étudiant assigné `/company/student/[id]`
- Consultation seule (pas de rejet possible)
- Infos académiques, CV, lettre de motivation
- Calendrier : périodes de stage, date d'embauche prévue

### Contrat tripartite

#### 11. Proposition de contrat `/contract/[id]`
- Template unique : étudiant + entreprise + plateforme
- Champs : montant, durée, échéances, clause de désistement (+20%), clause de rupture
- Signature électronique (loi 43-20) — intégration via un service type Universign ou DocuSign
- Statut du contrat : brouillon → en attente signature étudiant → en attente signature entreprise → signé

---

## SPRINT 3 — Admin + Scoring + Matching (4 semaines)

### Objectif
L'admin peut tout voir, tout valider, assigner des profils aux entreprises.

### Écrans admin

#### 12. Dashboard admin `/admin`
- KPIs globaux : nombre de dossiers, montant total engagé, matching rate
- Liste des dossiers étudiants avec filtres (statut, filière, montant)
- Actions rapides : valider, refuser, demander des documents

#### 13. Révision de dossier `/admin/review/[id]`
- Dossier complet : infos personnelles, documents, crédit demandé
- Scoring AI (affiché après calcul côté FastAPI)
  - 40% notes · 25% potentiel filière · 20% motivation · 15% situation
- Champs de score manuels (sliders 0–100) si l'admin veut ajuster
- Boutons : Valider, Refuser, Demander modification

#### 14. Matching & assignment `/admin/assign`
- Liste des entreprises avec besoins non assignés
- Algorithme de matching (FastAPI) : note de compatibilité affichée en %
- L'admin clique "Assigner" → le profil étudiant est lié à l'entreprise
- Confirmation : "Êtes-vous sûr ? Cette action est irréversible."

#### 15. Gestion des paiements `/admin/payments`
- Vue des flux financiers (entrées entreprises, sorties étudiants)
- Statut des paiements : en_attente, reçu, en_retard
- Déclenchement manuel des virements mensuels

### Scoring : à quoi ressemble la page

```
+---------------------------+------------+
| Critère                   | Score /100 |
+---------------------------+------------+
| Notes académiques         |    82      |
| Potentiel filière         |    74      |
| Lettre de motivation      |    91      |
| Situation personnelle     |    65      |
+---------------------------+------------+
| Score global              |    78      |
+---------------------------+------------+
```

Juste ça. Pas de radar chart, pas de gauge animée. Un tableau, lisible, vite.

---

## SPRINT 4 — Suivi + Paiements + Polish (2 semaines)

### Ce qu'on finit

- Paiements récurrents étudiants (tableau de bord + historique)
- Upload rapports de semestre (étudiant) et rapports de stage (entreprise)
- Buyout simulator (étudiant) : calcule le montant restant + pénalité 20%
- Dashboard ROI entreprise : combien elles ont investi vs valeur estimée du talent

### Ce qu'on améliore

- États vides : "Aucun document uploadé" avec illustration
- États d'erreur : messages compréhensibles
- Loading skeletons pour chaque page
- Responsive mobile (les étudiants sont sur téléphone)

### Ce qu'on reporte (v2)

- Mutuelle d'assurance (2-3% entreprise)
- Programme de fidélité multi-contrat
- Alertes risques (absences, mauvaises notes)
- Chat interne

---

## Principes de navigation

### Dashboard étudiant
```
/dashboard
├── /apply          → demande de crédit
├── /documents      → upload & suivi documents
├── /status         → progression du dossier
├── /contract       → contrat à signer
├── /payments       → historique des paiements
├── /semester       → rapports de semestre
└── /buyout         → simulation de rachat
```

### Dashboard entreprise
```
/company
├── /hiring         → publier un besoin
├── /students       → liste des étudiants assignés
├── /student/[id]   → profil détail
├── /internships    → rapports de stage
├── /roi            → calcul retour sur investissement
└── /contract/[id]  → contrat à signer
```

### Dashboard admin
```
/admin
├── /students       → liste tous les dossiers
├── /review/[id]    → révision + scoring
├── /companies      → liste entreprises
├── /assign         → matching & assignment
├── /payments       → flux financiers
├── /contracts      → tous les contrats
└── /stats          → KPIs globaux
```

---

## État du MVP : ce qui est "fait" vs "en attente"

### Critères de sortie MVP

- [x] Un étudiant peut s'inscrire, remplir une demande, uploader 6 documents
- [x] L'admin peut réviser le dossier et attribuer un score
- [x] L'admin peut assigner un étudiant à une entreprise
- [x] L'entreprise peut voir le profil assigné et signer le contrat
- [x] L'étudiant peut signer le contrat
- [x] Paiement mensuel étudiant tracé

### Pas dans le MVP mais prévu en v1.1

- [ ] OCR automatisé (juste statut manuel pour l'instant)
- [ ] Paiement en ligne réel (simulation ok)
- [ ] Signature électronique intégrée (fichier PDF + upload manuel en attendant)
- [ ] Calcul automatique des pénalités de retard

---

## Design System (minimal)

```
Couleurs :
  - Primary    : #1E3A5F (bleu foncé, confiance)
  - Secondary  : #2D8B7E (vert, croissance)
  - Accent     : #F4A261 (orange, CTA)
  - Danger     : #E76F51 (rouge, refus/erreur)
  - Background : #F8F9FA (gris clair)
  - Surface    : #FFFFFF
  - Text       : #1A1A2E (presque noir)

Typographie :
  - Titres     : Plus Jakarta Sans, bold
  - Corps      : Inter, regular 16px
  - Petits     : Inter, 14px, text-secondary

Espaces :
  - Section padding : 24px desktop, 16px mobile
  - Cards gap       : 16px
  - Border-radius   : 8px
```

Pas de design system surchargé. On garde 7 couleurs, 2 fonts, 3 tailles. On itère.

---

## Notes pour le designer

- Ne pas utiliser d'illustrations génériques (ces photos de banque avec des gens qui se serrent la main)
- Les formulaires doivent tenir dans 800px de large max, centrés
- Chaque écran doit répondre à une question : "Qu'est-ce que je dois faire maintenant ?"
- Les erreurs ne sont jamais techniques. Pas de "500 Internal Server Error" — plutôt "Oups, on a eu un souci. Réessaie dans 2 minutes."
- Toutes les dates en français : "15 janvier 2026" pas "2026-01-15"
- Les montants en MAD avec le symbole : "1 500 MAD"

---

## Conclusion

Le MVP tient dans ~10 écrans principaux côté étudiant, ~6 côté entreprise, ~7 côté admin. On commence par l'étudiant parce que c'est le plus risqué — si le flow étudiant est fluide, le reste est de la tuyauterie.

Priorité absolue : que le premier étudiant fictif puisse aller de l'inscription à "Document soumis" sans fermer le navigateur.
