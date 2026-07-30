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
- `validateur.html` : démonstration du validateur XML (mock et intégration FastAPI).
- `blog.html` & `article.html` : index et template article (chargés depuis `blog/posts.json`).
- `contact.html` : formulaire avec mock Google Apps Script.
- `charte-ethique.html`, `mentions-legales.html`, `confidentialite.html`, `404.html`.

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
     "canonical": "https://www.ppr-solution.com/article.html?slug=nouvel-article"
   }
   ```
2. L’index du blog se mettra à jour automatiquement.
3. L’article sera disponible à `article.html?slug=nouvel-article`.

## Brancher l’API FastAPI

Dans `assets/js/validateur.js`, remplacer les TODO :

```js
const API_BASE_URL = "https://votre-api.example.com"; // TODO
const API_VALIDATE_ENDPOINT = "/validate";            // TODO
```

Tant que l’URL contient `ppr-solution.com`, un mock local est utilisé. Ajustez la logique selon votre authentification (Bearer, clé API, etc.).

## Connecter Google Apps Script

Dans `assets/js/contact.js` :

```js
const GAS_CONTACT_URL = "https://script.google.com/macros/s/XXXXX/exec"; // TODO
```

Le script envoie un POST JSON contenant `name`, `email`, `company`, `message`. Avec `XXXXX`, un mock renvoie un succès de démonstration.

## Déploiement GitHub Pages

1. Pousser le dossier `site/` dans la branche publiée (`main` ou `gh-pages`).
2. Activer GitHub Pages (*Settings > Pages*) et pointer vers `/site`.
3. Pour un domaine personnalisé, ajouter le CNAME et s’assurer que `sitemap.xml` et `robots.txt` sont bien exposés.

## Accessibilité & SEO

- `<title>` et meta description uniques sur chaque page.
- Balises Open Graph / Twitter + JSON-LD (Organization, WebSite, Breadcrumb, Article).
- Navigation clavier : skip-link, focus visibles, menu responsive accessible.
- Images `loading="lazy"` et textes alternatifs pertinents.
- `sitemap.xml` et `robots.txt` à la racine.

## Tests rapides

- Servir en local (`npx serve .`) pour vérifier les menus, CTA et liens.
- Tester le validateur : déposer un fichier ou déclencher `mockDemo()` dans la console.
- Vérifier le formulaire de contact : un message mock s’affiche tant que l’URL GAS n’est pas renseignée.

Bon déploiement !
