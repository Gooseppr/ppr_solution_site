# PPR-Solution · Site statique

Site vitrine statique pour une activité indépendante de prestations XML : contrôle, transformation, extraction, migration, génération documentaire et exploitation de données structurées. S1000D est traité comme une spécialisation XML, pas comme l'identité principale du site.

Technologies : HTML5, CSS3 vanilla, JavaScript léger, et un générateur Node.js sans dépendance pour produire les pages statiques du blog.

## Lancer en local

Depuis le dossier `site/` :

```bash
python -m http.server 8000
```

Puis ouvrir `http://localhost:8000`. Le site fonctionne aussi directement en `file://`, mais un serveur local reste préférable pour tester les chemins et les formulaires.

## Architecture

- `index.html` : accueil éditorial centré sur les problèmes XML, avec démonstration phare et méthode.
- `services.html` : catalogue de prestations XML avec situations, interventions et livrables.
- `demonstrations.html` : cas techniques fictifs et inspectables, dont le validateur S1000D secondaire.
- `blog.html` : bibliothèque éditoriale statique, enrichie par une recherche et des filtres progressifs via `assets/js/blog.js`.
- `blog/<slug>/index.html` : articles indexables générés depuis `blog/posts.json`.
- `a-propos.html` : activité indépendante, méthode, confidentialité et limites assumées.
- `contact.html` : formulaire de cadrage branché sur `assets/js/contact.js`.
- `validateur.html` : démonstrateur secondaire du validateur XML S1000D.
- `mentions-legales.html`, `confidentialite.html`, `charte-ethique.html`, `404.html` : pages support.

La page Ressources, la page S1000D dédiée et l’ancien template dynamique ont été supprimés. La navigation principale reste volontairement courte : Prestations, Démonstrations, Blog, À propos, CTA contact.

## Blog statique

Le contenu vit dans `blog/posts.json`. Après modification, générer les articles, l'index et le sitemap :

```bash
node scripts/build-blog.js
```

Chaque article doit contenir au minimum : `slug`, `title`, `description`, `meta_description`, `date`, `updated`, `category`, `tags`, `reading_time` et `content_html`. Les pages générées incluent canonical, Open Graph, Twitter Card, JSON-LD Article et fil d'Ariane.

## Design

Direction : engineering editorial. Le CSS se trouve dans `assets/css/style.css` et privilégie :

- fond blanc, lignes fines, typographie IBM Plex Sans / Mono ;
- tableaux, blocs de code, pipelines et livrables plutôt que cartes marketing ;
- rayons courts, ombres évitées, palette technique sobre ;
- sections spécifiques selon le rôle de chaque page.

## SEO et accessibilité

- Titres et meta descriptions uniques sur les pages principales et articles.
- `sitemap.xml` généré à la racine et déclaré dans `robots.txt`.
- Liens canoniques pointant vers `https://gooseppr.github.io/ppr_solution_site/`.
- Skip link, focus visibles, menu mobile clavier, attribut `aria-current`.
- Articles statiques lisibles sans JavaScript.
- Formulaire de contact avec libellés, aides et zone de statut.

## Points à vérifier avant publication

- Compléter les champs juridiques dans `mentions-legales.html`.
- Vérifier côté serveur la protection anti-abus du Google Apps Script de contact.
- Ne pas envoyer de documents confidentiels dans le validateur public ; utiliser un canal dédié pour les missions réelles.
- Si un domaine personnalisé est ajouté, mettre à jour `BASE_URL` dans `scripts/build-blog.js`, relancer la génération et vérifier `robots.txt`, `sitemap.xml` et les canonicals.
