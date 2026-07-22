# Enzo Noury — Site de staking poker

Site web pour financer des tournois de poker : page d'accueil, tournois, staking
avec calcul automatique des parts, suivi en direct, résultats, historique et
statistiques. Espace admin privé pour tout gérer.

## Stack
- **Next.js 14** (App Router) + **React 18**
- **Tailwind CSS** (thème sombre premium)
- **Supabase** (base de données + authentification + temps réel)
- **Framer Motion** (animations) · **Chart.js** (graphiques)
- Hébergement **Vercel** (gratuit)

## 👉 Pour mettre le site en ligne
Ouvre le fichier **`GUIDE-DEPLOIEMENT.md`** et suis les étapes dans l'ordre.

## Démarrage rapide (développement local)
```bash
npm install
cp .env.local.example .env.local   # puis colle tes clés Supabase
npm run dev                        # http://localhost:3000
```

Le schéma de base de données est dans `supabase/schema.sql`.
