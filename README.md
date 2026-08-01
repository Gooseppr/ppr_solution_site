# PPR-Solution · Site statique

Site vitrine statique pour une activité indépendante de prestations XML : diagnostic/audit, transformation documentaire, automatisation de flux, avec une spécialisation forte en S1000D.
Technologies : HTML5, CSS3 (vanilla), JavaScript sans dépendances externes. Un script Node.js (sans dépendance) génère les pages statiques du blog.

PPR-Solution vend des prestations et des livrables (rapports, fichiers transformés, scripts documentés) — pas un logiciel ni une plateforme SaaS. Le validateur XML S1000D est un démonstrateur technique, pas le produit principal.

## 🚀 Lancer le site en local

```bash
# Option 1 : Python (la plus simple, aucune dépendance)
python -m http.server

# Option 2 : Node.js (si npm est installé)
npx serve .
```

Le site sera accessible à `http://localhost:8000` avec l'option Python ou `http://localhost:3000` avec npx serve.

## Structure des pages

- `index.html` : accueil (situations traitées, quatre familles de services, démonstrations, blog).
- `services.html` : quatre familles de prestations avec blocs « vous fournissez / nous analysons / nous réalisons / vous recevez / limites ».
  1. Diagnostic, audit et contrôle XML (`#diagnostic`)
  2. Transformation et publication documentaire (`#transformation`)
  3. Automatisation et fiabilisation de flux (`#automatisation`)
  4. Documentation industrielle & S1000D (`#s1000d`)
  5. Votre XML suit un autre standard ? (`#autres-standards`)
- `demonstrations.html` : démonstrations techniques et jeux d'essai (aucun cas client réel, uniquement des cas fictifs ou corpus publics marqués comme tels).
- `ressources.html` : page d'agrégation (blog, démonstrations, validateur, futurs rapports d'exemple).
- `a-propos.html` : positionnement (activité indépendante, pas d'équipe), méthode en 9 étapes, section transfert de fichiers/confidentialité.
- `validateur.html` : démonstrateur du validateur XML S1000D, branché sur une API réelle (voir ci-dessous). Accessible depuis Démonstrations, plus dans le niveau principal de navigation.
- `blog.html` : index du blog avec recherche/tri (`assets/js/blog.js`), chargé depuis `blog/posts.json`.
- `blog/<slug>/index.html` : pages statiques générées par article (voir « Générer le blog » ci-dessous).
- `article.html?slug=...` : ancien template dynamique conservé pour compatibilité des liens existants ; son canonical pointe désormais vers la page statique équivalente.
- `contact.html` : formulaire branché sur un Google Apps Script réel (voir ci-dessous).
- `charte-ethique.html`, `mentions-legales.html`, `confidentialite.html`, `404.html`.

⚠️ `mentions-legales.html` contient un modèle d'entreprise individuelle avec des champs `[à compléter]` (nom, SIRET, adresse) : à remplacer avant toute mise en ligne publique.

## Navigation

Nav principale : Accueil / Services / Démonstrations / Ressources / À propos / Contact.
Le blog et le validateur ne sont plus des entrées de premier niveau ; ils sont accessibles depuis Ressources et Démonstrations, et le lien « Ressources » de la nav s'active aussi sur `blog.html`, `blog/<slug>/`, `article.html` et `validateur.html` (voir `markActiveNav` dans `assets/js/main.js`).

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

## Générer le blog (pages statiques)

Le contenu éditorial vit dans `blog/posts.json`. Un script Node.js génère une page HTML statique et autonome par article (title, meta description, canonical, Open Graph, Twitter Card, JSON-LD Article et contenu directement dans le HTML, sans dépendre du JavaScript pour le SEO) :

```bash
node scripts/build-blog.js
```

Pour ajouter un article :

1. Ajouter un objet dans `blog/posts.json` :
   ```json
   {
     "slug": "nouvel-article",
     "title": "Titre de l'article",
     "description": "Description courte.",
     "meta_description": "Meta description (150-160 caractères).",
     "date": "2025-03-01",
     "tags": ["S1000D"],
     "summary": "Résumé affiché sur le blog.",
     "hero_image": "assets/img/og-default.jpg",
     "og_image": "assets/img/og-default.jpg",
     "reading_time": "4 min",
     "content_html": "<p>Contenu HTML…</p>",
     "canonical": "https://gooseppr.github.io/ppr_solution_site/blog/nouvel-article/"
   }
   ```
2. Lancer `node scripts/build-blog.js` : la page `blog/nouvel-article/index.html` est générée (ou régénérée).
3. `blog.html` (index avec recherche/tri) se met à jour automatiquement depuis `blog/posts.json`, sans regénération nécessaire.

Ne pas rédiger de nouveaux articles uniquement pour remplir le site : le générateur est prêt, le contenu doit correspondre à de vraies recherches (voir la liste de sujets prioritaires discutée avec le fondateur : validation XML/XSD, transformation documentaire, automatisation, S1000D).

## API de validation

`assets/js/validateur.js` appelle une API de validation XML S1000D réelle hébergée sur Vercel (`API_BASE_URL`). Le comportement serveur (sécurité XXE, conservation des fichiers, limites de débit) n'est pas documenté ici : à vérifier/durcir côté backend avant toute utilisation en production avec des fichiers sensibles. Le validateur reste un outil de démonstration ; il n'est pas le canal prévu pour les documents confidentiels d'une mission réelle (voir `a-propos.html#transfert`).

## Formulaire de contact

`assets/js/contact.js` envoie les soumissions à un Google Apps Script réel (`GAS_CONTACT_URL`). Un champ honeypot (`website`, masqué visuellement) est inclus pour limiter le spam automatisé ; toute soumission remplissant ce champ est silencieusement ignorée côté client. TODO côté serveur (hors dépôt) : vérifier également ce honeypot côté Apps Script et ajouter une protection anti-abus (rate limiting).

## Déploiement GitHub Pages

1. Pousser le dossier `site/` dans la branche publiée (`main` ou `gh-pages`).
2. Activer GitHub Pages (*Settings > Pages*) et pointer vers `/site`.
3. Le site est actuellement publié sans domaine personnalisé : canonical, Open Graph, `sitemap.xml`, `robots.txt` et `blog/posts.json` pointent vers l'URL GitHub Pages (`https://gooseppr.github.io/ppr_solution_site/`).

   Si un domaine personnalisé (ex. `www.ppr-solution.com`) est configuré plus tard, remplacer cette URL de base à ces endroits :
   - `BASE_URL` dans `scripts/build-blog.js`, puis relancer `node scripts/build-blog.js` ;
   - le `canonical` de chaque objet dans `blog/posts.json` ;
   - les balises `<link rel="canonical">`, Open Graph, Twitter et JSON-LD de chaque page HTML statique (racine + `blog/<slug>/index.html`) ;
   - `sitemap.xml` et `robots.txt`.

## Accessibilité & SEO

- `<title>` et meta description uniques sur chaque page, y compris chaque article de blog statique.
- Balises Open Graph / Twitter + JSON-LD (Organization, WebSite, Breadcrumb, Article) sur chaque page.
- Navigation clavier : skip-link, focus visibles, menu responsive accessible, fermeture au clavier (Échap), libellé du bouton menu mis à jour (« Ouvrir »/« Fermer »).
- Formulaire de contact : erreurs associées aux champs via `aria-describedby` / `aria-invalid`.
- Images `loading="lazy"` et textes alternatifs pertinents.
- `sitemap.xml` et `robots.txt` à la racine, incluant les pages statiques du blog.

## Tests rapides

- Servir en local (`npx serve .`) pour vérifier les menus, CTA et liens.
- Tester le validateur : déposer un fichier XML S1000D réel (Issue 6.0) et vérifier le rapport retourné par l'API.
- Vérifier le formulaire de contact : soumettre un message réel et confirmer sa réception côté Google Apps Script.
- Après toute modification de `blog/posts.json`, relancer `node scripts/build-blog.js` et vérifier les pages générées dans `blog/<slug>/`.

Bon déploiement !
