# 1111.TN — Page d'inscription

Page d'inscription animée pour **1111.TN — La Police des Prix**, avec l'affiche de la marque
en arrière-plan plein écran et un formulaire central en verre dépoli (glassmorphism).

## Stack
- **Next.js 15** (App Router) + **React 19**
- **Tailwind CSS v4**
- **Framer Motion** (animations d'entrée, transitions, toggles, état de succès)
- **lucide-react** (icônes)

## Fonctionnalités
- Image fournie en **arrière-plan** plein écran avec overlays de lisibilité et halos « sirène » animés.
- Formulaire de pré-inscription : **Nom complet, Email, Téléphone**
  - labels flottants, anneaux de focus animés, validation en direct
  - validation côté client et côté serveur, honeypot anti-spam
- 3 préférences sous forme d'interrupteurs, **activées par défaut** :
  - Recevoir les alertes prix
  - Recevoir les meilleures promotions
  - Être averti des fausses promotions
- Bouton de soumission animé (chargement → écran de succès).
- **100 % responsive** (mobile & desktop).

## Démarrage

```bash
npm install
npm run dev      # http://localhost:3000
```

Build de production :

```bash
npm run build
npm start
```

## Structure
```
app/
  layout.tsx      # métadonnées, viewport
  page.tsx        # arrière-plan + overlays + halos animés
  globals.css     # thème (navy/or/sirène) + keyframes
components/
  SignupForm.tsx  # formulaire, toggles, validation, succès
public/
  background.png  # l'affiche 1111.TN
```

## Déploiement Vercel + stockage

Le formulaire envoie maintenant les pré-inscriptions vers `POST /api/signup`.
Pour sauvegarder les données en production, ajoutez une base Postgres compatible
serverless (Neon via le Marketplace Vercel est le chemin recommandé) puis définissez :

```bash
POSTGRES_URL=...   # fourni par Vercel + Neon (ou DATABASE_URL)
IP_HASH_SALT=une-valeur-longue-et-secrète
```

Exécutez ensuite le SQL dans `db/schema.sql` sur la base (voir `npm run db:migrate`). Sans `POSTGRES_URL` / `DATABASE_URL`,
l'API valide la requête mais refuse l'enregistrement afin d'éviter une fausse
impression que les données sont sauvegardées.

Le formulaire ne collecte plus de mot de passe : pour de vrais comptes utilisateur,
utilisez un fournisseur d'authentification (Supabase Auth, Clerk, Auth.js, etc.) ou
ajoutez un backend qui hashe les mots de passe avant stockage.
