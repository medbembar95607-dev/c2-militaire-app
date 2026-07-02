# C2 Militaire — Poste de commandement

Application de gestion des opérations militaires sur fond cartographique interactif (React + TypeScript + Supabase). Écran v1 : poste de commandement (carte, unités, flux d'ordres, authentification).

Le cadrage complet (besoins, décisions d'architecture, modèle de données) vit dans [`../cadrage-app-c2/`](../cadrage-app-c2/), pas ici. Ce README couvre uniquement le code.

## Stack

- React 19 + TypeScript, Vite
- Tailwind CSS v4
- MapLibre GL JS (fond de carte [OpenFreeMap](https://openfreemap.org))
- Supabase (Postgres + PostGIS, Auth, RLS)
- `mgrs` pour la conversion de coordonnées

## Démarrer en local

```bash
npm install
cp .env.example .env   # puis renseigner VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY
npm run dev
```

Comptes de démonstration : voir `../cadrage-app-c2/05-securite/comptes-demo.md` (non versionné, contient des mots de passe).

## Base de données

Le schéma vit dans `supabase/migrations/`, à appliquer dans l'ordre (numéros de préfixe) via l'éditeur SQL du dashboard Supabase ou la CLI `supabase`. Pas encore de tooling de migration automatisé — chaque fichier est un script SQL à rejouer une fois sur le projet cible.

Résumé de ce qu'elles mettent en place : schéma des 5 tables (`unites`, `positions`, `ordres`, `ordres_destinataires`, `profils`) avec PostGIS et RLS, données de démonstration, comptes de test, hiérarchie de commandement, et policies de sécurité (dont une visibilité des ordres qui remonte la chaîne de commandement). Détail des décisions dans `../cadrage-app-c2/03-donnees/modele-donnees.md`.

## Structure

```
src/
  components/       écrans et éléments d'UI (Header, TacticalMap, SidePanel, modales, LoginScreen)
  data/             accès Supabase (unitesRepository, ordresRepository, profilRepository)
  types.ts          types partagés, alignés sur le schéma SQL
  uniteStyle.ts / ordreStyle.ts   couleurs et libellés partagés par plusieurs composants
supabase/migrations/   schéma et données, à appliquer manuellement
```

## Limitations connues

- Pas de mode hors-ligne (PowerSync évalué puis dépriorisé, voir `../cadrage-app-c2/02-architecture/decisions.md`)
- La création d'ordre n'est pas hiérarchique par design (on ne peut émettre qu'au nom de sa propre unité), seule la *lecture* remonte la chaîne de commandement
- `unites`/`positions` sont lisibles par tout utilisateur authentifié, pas encore scopées à la chaîne de commandement (choix assumé, voir la doc du modèle de données)
- En développement uniquement (`npm run dev`), la connexion peut très rarement rester bloquée sur "Connexion…" à cause d'une interaction entre le mode strict de React et le SDK Supabase Auth. Un rechargement de page suffit. Non reproduit sur le build de production (`npm run build && npm run preview`).
