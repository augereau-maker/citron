# Guide pas-à-pas : Git & Netlify pour CITRON

## Étape 1 — Initialiser Git dans le dossier du projet

Ouvre un terminal dans le dossier de ton projet (celui qui contient `index.html`).

```bash
cd chemin/vers/citron
git init
```

Crée un fichier `.gitignore` pour ne jamais versionner de secrets ou de fichiers inutiles :

```bash
cat > .gitignore << 'EOF'
node_modules/
.env
.DS_Store
EOF
```

## Étape 2 — Premier commit

```bash
git add .
git commit -m "Initial commit: structure CITRON (landing, auth, dashboard)"
```

## Étape 3 — Créer le dépôt distant sur GitHub

1. Va sur [github.com/new](https://github.com/new).
2. Nomme le dépôt `citron` (ou autre), laisse-le **vide** (pas de README auto-généré).
3. Copie l'URL du dépôt (ex. `https://github.com/ton-compte/citron.git`).

Puis relie ton dossier local :

```bash
git branch -M main
git remote add origin https://github.com/ton-compte/citron.git
git push -u origin main
```

## Étape 4 — Convention de commits (recommandée)

Pour garder un historique lisible au fil du développement :

```
feat: ajoute le formulaire d'anamnèse
fix: corrige la redirection après déconnexion
style: ajuste les couleurs du dashboard
chore: met à jour le script SQL
docs: complète le guide Git
```

## Étape 5 — Lier le dépôt à Netlify (déploiement continu)

1. Va sur [app.netlify.com](https://app.netlify.com) → **Add new site** → **Import an existing project**.
2. Choisis **GitHub**, autorise Netlify, puis sélectionne le dépôt `citron`.
3. Configuration du build :
   - **Build command** : *(laisser vide — c'est du HTML/CSS/JS statique, aucun build n'est nécessaire)*
   - **Publish directory** : `.` (la racine du projet)
4. Clique sur **Deploy site**.

À partir de maintenant, **chaque `git push` sur `main` redéploie automatiquement le site**.

## Étape 6 — Lier au site existant `ci-tron.netlify.app`

Si le site `ci-tron.netlify.app` existe déjà sur Netlify mais n'est pas encore relié à Git :

1. Dans Netlify, ouvre le site → **Site configuration** → **Build & deploy** → **Link repository**.
2. Sélectionne le dépôt `citron` créé à l'étape 3.
3. Confirme les mêmes réglages qu'à l'étape 5.

## Étape 7 — Variables d'environnement (optionnel, mais recommandé)

Plutôt que d'écrire l'URL et la clé Supabase en dur dans `supabase-client.js`, tu peux :

1. Dans Netlify : **Site configuration → Environment variables**, ajouter `SUPABASE_URL` et `SUPABASE_ANON_KEY`.
2. Utiliser une petite étape de build (ex. un script qui remplace des placeholders) — **facultatif pour un prototype**, la clé "anon" de Supabase est publique par design et protégée par les policies RLS, donc la laisser en clair dans le code est acceptable en phase de prototype.

## Flux de travail au quotidien

```bash
git add .
git commit -m "feat: ..."
git push
```

→ Netlify détecte le push et redéploie automatiquement en 1 à 2 minutes.

---

### Remarque sur l'hébergement

Netlify est déjà en place et adapté ici : le projet est 100 % statique (HTML/CSS/JS + Supabase en backend), sans étape de build, ce qui correspond exactement à ce que Netlify fait de mieux, gratuitement. Pas besoin de changer d'hébergeur pour la phase prototype.
