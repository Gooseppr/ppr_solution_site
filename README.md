# PPR-Solution · Site statique

Site vitrine statique pour présenter l’offre de services S1000D, le validateur XML et les contenus du blog.  
Technologies : HTML5, CSS3 (vanilla), JavaScript sans dépendances externes.
## 🚀 Lancer le site en local

```bash
# Option 1 : Python (la plus simple, aucune dépendance)
python -m http.server

# Option 2 : Node.js (si npm est installé)
npx serve .
```

Le site sera accessible à `http://localhost:8000` avec l'option Python ou `http://localhost:3000` avec npx serve.
## Structure des pages

- `index.html` : page d’accueil (services en premier, validateur, contact, blog).
- `services.html` : détails des missions (audit, conversion, accompagnement).
- `validateur.html` : démonstration du validateur XML, branchée sur une API réelle (voir ci-dessous).
- `blog.html` & `article.html` : index et template article (chargés depuis `blog/posts.json`).
- `contact.html` : formulaire branché sur un Google Apps Script réel (voir ci-dessous).
- `charte-ethique.html`, `mentions-legales.html`, `confidentialite.html`, `404.html`.

⚠️ `mentions-legales.html` contient un modèle d’entreprise individuelle avec des champs `[à compléter]` (nom, SIRET, adresse) : à remplacer avant toute mise en ligne publique.

## Prise en main

## Personnaliser le thème

Toutes les variables se trouvent dans `assets/css/style.css` :

```css
:root {
  /* Thème : modifier ici */
  --color-bg: #f5f7fb;
  --color-primary: #0f3f91;
  --font-body: "Inter", sans-serif;
  --radius-md: 14px;
  /* … */
}
```

Modifiez-les pour ajuster la palette, les typographies, les rayons ou les ombres.

## Ajouter un article de blog

1. Ajouter un objet dans `blog/posts.json` :
   ```json
   {
     "slug": "nouvel-article",
     "title": "Titre de l’article",
     "description": "Description courte.",
     "meta_description": "Meta description (150-160 caractères).",
     "date": "2025-03-01",
     "tags": ["S1000D"],
     "summary": "Résumé affiché sur le blog.",
     "hero_image": "assets/img/og-default.jpg",
     "og_image": "assets/img/og-default.jpg",
     "reading_time": "4 min",
     "content_html": "<p>Contenu HTML…</p>",
     "canonical": "https://gooseppr.github.io/ppr_solution_site/article.html?slug=nouvel-article"
   }
   ```
2. L’index du blog se mettra à jour automatiquement.
3. L’article sera disponible à `article.html?slug=nouvel-article`.

## API de validation

`assets/js/validateur.js` appelle une API de validation XML S1000D réelle hébergée sur Vercel (`API_BASE_URL`). Le comportement serveur (sécurité XXE, conservation des fichiers, limites de débit) n'est pas documenté ici : à vérifier/durcir côté backend avant toute utilisation en production avec des fichiers sensibles.

## Formulaire de contact

`assets/js/contact.js` envoie les soumissions à un Google Apps Script réel (`GAS_CONTACT_URL`). Un champ honeypot (`website`, masqué visuellement) est inclus pour limiter le spam automatisé ; toute soumission remplissant ce champ est silencieusement ignorée côté client.

## Déploiement GitHub Pages

1. Pousser le dossier `site/` dans la branche publiée (`main` ou `gh-pages`).
2. Activer GitHub Pages (*Settings > Pages*) et pointer vers `/site`.
3. Le site est actuellement publié sans domaine personnalisé : canonical, Open Graph, `sitemap.xml` et `robots.txt` pointent vers l'URL GitHub Pages (`https://gooseppr.github.io/ppr_solution_site/`). Si un domaine personnalisé (ex. `www.ppr-solution.com`) est configuré plus tard, remplacer systématiquement cette URL de base dans tous les fichiers HTML, `sitemap.xml`, `robots.txt` et `blog/posts.json`.

## Accessibilité & SEO

- `<title>` et meta description uniques sur chaque page.
- Balises Open Graph / Twitter + JSON-LD (Organization, WebSite, Breadcrumb, Article).
- Navigation clavier : skip-link, focus visibles, menu responsive accessible.
- Images `loading="lazy"` et textes alternatifs pertinents.
- `sitemap.xml` et `robots.txt` à la racine.

## Tests rapides

- Servir en local (`npx serve .`) pour vérifier les menus, CTA et liens.
- Tester le validateur : déposer un fichier XML S1000D réel (Issue 6.0) et vérifier le rapport retourné par l'API.
- Vérifier le formulaire de contact : soumettre un message réel et confirmer sa réception côté Google Apps Script.

Bon déploiement !
