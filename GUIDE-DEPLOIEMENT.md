# 🃏 Guide de mise en ligne — Site de staking d'Enzo

Ce guide te fait passer d'un dossier de code à un **site en ligne gratuit**.
Suis les étapes **dans l'ordre**. Chaque fois que tu vois 👉, c'est une action à faire.

Il te faut seulement : un ordinateur, une adresse email, environ 30 minutes.

On va utiliser 3 services **gratuits** :
- **Supabase** = la base de données (stocke tournois, investisseurs, résultats)
- **GitHub** = l'endroit où vit ton code
- **Vercel** = ce qui met le site en ligne

---

## 📦 Étape 0 — Décompresser le projet

👉 Décompresse le fichier `enzo-staking.zip`. Tu obtiens un dossier `enzo-staking`.
Garde-le à un endroit facile à retrouver (ex : le Bureau).

---

## 🗄️ Étape 1 — Créer la base de données (Supabase)

1. 👉 Va sur **https://supabase.com** → clique **Start your project** → crée un compte (avec GitHub ou email).
2. 👉 Clique **New project**.
   - **Name** : `enzo-staking`
   - **Database Password** : choisis un mot de passe et **note-le quelque part** (tu peux en générer un).
   - **Region** : choisis **West EU (Paris)** ou le plus proche.
   - Clique **Create new project** puis patiente ~2 minutes.

3. **Créer les tables** :
   - 👉 Dans le menu de gauche, clique l'icône **SQL Editor** (`</>`).
   - 👉 Clique **New query**.
   - 👉 Ouvre le fichier `supabase/schema.sql` du projet, copie **tout** son contenu, colle-le dans l'éditeur.
   - 👉 Clique **Run** (en bas à droite). Tu dois voir « Success ».
   ✅ Tes tables sont créées.

4. **Récupérer tes 2 clés** :
   - 👉 Menu de gauche → **Project Settings** (roue crantée) → **API**.
   - Note ces 2 valeurs (on les utilisera 2 fois) :
     - **Project URL** → c'est ton `NEXT_PUBLIC_SUPABASE_URL`
     - **anon public** (dans "Project API keys") → c'est ton `NEXT_PUBLIC_SUPABASE_ANON_KEY`

5. **Créer TON compte administrateur** (celui qui gérera le site) :
   - 👉 Menu de gauche → **Authentication** → **Users** → **Add user** → **Create new user**.
   - Mets ton **email** et un **mot de passe** solide.
   - ✅ **Coche "Auto Confirm User"** (important, sinon tu ne pourras pas te connecter).
   - Clique **Create user**.

6. **Sécurité — bloquer les inscriptions publiques** (pour que personne d'autre ne crée un compte admin) :
   - 👉 **Authentication** → **Sign In / Providers** (ou **Providers**) → **Email**.
   - 👉 Désactive **"Allow new users to sign up"** (mets-le sur OFF) → **Save**.
   - ✅ Toi seul peux te connecter à l'espace admin.

---

## 💻 Étape 2 — Mettre le code sur GitHub

1. 👉 Va sur **https://github.com** → crée un compte gratuit.
2. 👉 En haut à droite, clique le **+** → **New repository**.
   - **Repository name** : `enzo-staking`
   - Laisse en **Public** (ou Private, au choix).
   - **Ne coche rien d'autre.** Clique **Create repository**.
3. **Envoyer les fichiers** (méthode sans logiciel, tout dans le navigateur) :
   - 👉 Sur la page du dépôt vide, clique le lien **"uploading an existing file"**.
   - 👉 Ouvre ton dossier `enzo-staking`, **sélectionne tous les fichiers et dossiers À L'INTÉRIEUR** (pas le dossier lui-même) et **glisse-les** dans la zone du navigateur.
     - ⚠️ **N'envoie PAS** les dossiers `node_modules` ni `.next` s'ils existent (ils sont inutiles et trop lourds). Le fichier `.gitignore` les ignore normalement.
   - 👉 En bas, clique **Commit changes**.
   - ✅ Ton code est sur GitHub.

---

## 🚀 Étape 3 — Mettre le site en ligne (Vercel)

1. 👉 Va sur **https://vercel.com** → **Sign Up** → choisis **Continue with GitHub** (le plus simple).
2. 👉 Sur le tableau de bord Vercel, clique **Add New…** → **Project**.
3. 👉 Trouve ton dépôt `enzo-staking` → clique **Import**.
4. **Ajouter tes clés Supabase** (essentiel, sinon le site ne verra pas la base) :
   - 👉 Déplie la section **Environment Variables**.
   - Ajoute la 1ʳᵉ :
     - **Name** : `NEXT_PUBLIC_SUPABASE_URL`
     - **Value** : colle ton *Project URL* (étape 1.4)
   - Ajoute la 2ᵉ :
     - **Name** : `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - **Value** : colle ta *clé anon public* (étape 1.4)
5. 👉 Clique **Deploy**. Patiente ~1 à 2 minutes.
6. ✅ Vercel affiche 🎉 et un lien du type `https://enzo-staking-xxxx.vercel.app`.
   **C'est ton site en ligne !**

---

## 🔑 Étape 4 — Se connecter et remplir le site

1. 👉 Ouvre ton site, ajoute `/admin` à la fin de l'adresse (ex : `https://…vercel.app/admin`).
2. 👉 Connecte-toi avec l'**email et le mot de passe** créés à l'étape 1.5.
3. Dans le tableau de bord tu peux :
   - **Modifier ton profil** (nom, pseudo, photo, présentation).
     - Pour la **photo** : mets le **lien d'une image**. Astuce simple : va sur https://postimages.org, envoie ta photo, copie le lien "Direct link", colle-le.
   - **Créer un tournoi** (le montant recherché se calcule tout seul).
   - Sur chaque tournoi : gérer le **suivi en direct**, saisir le **résultat**, ouvrir/fermer le financement, ou le **supprimer**.
4. ✅ Tout ce que tu enregistres apparaît immédiatement sur le site public.

---

## 🌐 (Plus tard) Brancher un nom de domaine

Si un jour tu achètes un domaine (ex : `enzonoury.com`) :
1. 👉 Sur Vercel → ton projet → **Settings** → **Domains** → **Add**.
2. 👉 Tape ton domaine, Vercel te donne 2 réglages (des "enregistrements DNS") à copier chez ton vendeur de domaine.
3. ✅ Quelques minutes après, ton site répond sur ton domaine, en HTTPS automatique.

---

## 💾 Sauvegardes

- Ton **code** est déjà sauvegardé sur GitHub.
- Pour tes **données** (tournois, investisseurs) : sur Supabase → **Database** → **Backups** (sauvegardes automatiques quotidiennes sur le plan gratuit). Tu peux aussi exporter une table via **Table Editor** → **Export to CSV**.

---

## 🔒 Récapitulatif sécurité (déjà en place)

- ✅ Les visiteurs peuvent **lire** et **investir**, mais **ne peuvent rien modifier ni supprimer** (règles RLS dans la base).
- ✅ L'espace `/admin` exige ton **mot de passe**.
- ✅ Les inscriptions publiques sont **désactivées** (étape 1.6) : personne ne peut se créer un accès admin.
- ✅ HTTPS automatique fourni par Vercel.
- 🔁 **Ne partage jamais** le mot de passe de ta base Supabase ni ton mot de passe admin.

---

## 🧪 (Optionnel) Tester sur ton ordinateur avant de publier

Si tu veux voir le site en local d'abord :
1. Installe **Node.js** (version LTS) : https://nodejs.org
2. Copie `.env.local.example`, renomme la copie en `.env.local`, et colle tes 2 clés dedans.
3. Ouvre un terminal dans le dossier et tape :
   ```
   npm install
   npm run dev
   ```
4. Ouvre **http://localhost:3000** dans ton navigateur.

---

## 🆘 Petits soucis fréquents

- **Le site s'affiche mais rien ne se charge / erreurs** → les clés Supabase sur Vercel sont manquantes ou mal collées. Vérifie l'étape 3.4, puis dans Vercel : **Deployments** → **Redeploy**.
- **Impossible de se connecter à /admin** → tu as oublié "Auto Confirm User" (étape 1.5). Recrée l'utilisateur en cochant la case.
- **La photo ne s'affiche pas** → le lien doit finir par `.jpg`/`.png` (utilise le "Direct link" de postimages).
- **Après avoir modifié le code sur GitHub** → Vercel redéploie tout seul à chaque changement. Rien à faire.

Bon jeu, et bonne run ! ♠♥♦♣
