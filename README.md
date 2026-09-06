# PPR-Solution · Site statique

Site vitrine statique pour une activité indépendante de structuration documentaire : contenus hétérogènes vers documentation structurée, contrôle, transformation, extraction, migration, publication et exploitation de données. S1000D reste une spécialisation, pas l'identité principale du site.

Technologies : HTML5, CSS3 vanilla, JavaScript léger, et un générateur Node.js sans dépendance pour produire les pages statiques du blog.

## Lancer en local

Depuis le dossier `site/` :

```bash
python -m http.server 8000
```

Puis ouvrir `http://localhost:8000`. Le site fonctionne aussi directement en `file://`, mais un serveur local reste préférable pour tester les chemins et les formulaires.

## Architecture

- `index.html` : accueil éditorial centré sur la transformation de contenus en documentation structurée.
- `services.html` : catalogue synthétique par besoin, sources, intervention et livrables.
- `demonstrations.html` : cas techniques fictifs et inspectables, dont le validateur S1000D secondaire.
- `blog.html` : bibliothèque éditoriale statique sur la documentation, les données et les technologies, enrichie par recherche, filtres et pagination progressive via `assets/js/blog.js`.
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

L'index conserve tous les articles dans son HTML pour rester lisible sans JavaScript. Avec JavaScript, trois articles sont affichés par page et une pagination clavier est ajoutée lorsque le volume le nécessite. Ce compromis conserve l'URL et le générateur actuels ; une pagination statique pourra être introduite quand le catalogue justifiera plusieurs pages indexables.

Le temps de lecture est calculé au build depuis le contenu HTML principal de chaque article, à raison de 220 mots par minute avec un minimum d’une minute. Navigation, pied de page, sommaire et CTA sont ajoutés après ce calcul et ne sont donc pas comptés.

## Présentation PDF et mesure du téléchargement

- Source imprimable : `documents/prestations-ppr-solution.html`.
- Fichier public : `assets/documents/prestations-ppr-solution.pdf`.
- Le lien direct reste fonctionnel sans JavaScript et si toute mesure échoue.
- Au clic, `assets/js/services.js` émet l'événement `service_catalog_download` avec seulement `document` et `page`. Il relaie aussi l'événement vers `window.dataLayer` si ce système existe déjà.
- Aucun endpoint de collecte n'est activé par défaut. Pour brancher un compteur agrégé, renseigner la meta `ppr-analytics-endpoint` dans `services.html` avec une URL acceptant un POST `application/x-www-form-urlencoded`. L'endpoint doit ignorer ou supprimer les adresses IP et ne pas poser d'identifiant utilisateur. Mettre à jour la politique de confidentialité avant activation.

## Design

Direction : engineering editorial. Le CSS se trouve dans `assets/css/style.css` et privilégie :

- fond blanc, lignes fines, typographie IBM Plex Sans / Mono ;
- tableaux, blocs de code, pipelines et livrables plutôt que cartes marketing ;
- rayons courts, ombres limitées aux cartes cliquables et palette technique sobre ;
- sections spécifiques selon le rôle de chaque page.

## SEO et accessibilité

- Titres et meta descriptions uniques sur les pages principales et articles.
- `sitemap.xml` généré à la racine et déclaré dans `robots.txt`.
- Liens canoniques pointant vers `https://gooseppr.github.io/ppr_solution_site/`.
- Skip link, focus visibles, menu mobile clavier, attribut `aria-current`.
- Articles statiques lisibles sans JavaScript.
- Formulaire de contact avec libellés, aides et zone de statut.
- Le choix `structurer` étend le contrat du formulaire pour la structuration documentaire ; toutes les valeurs historiques et tous les noms de champs restent inchangés.

## Points à vérifier avant publication

- Compléter les champs juridiques dans `mentions-legales.html`.
- Vérifier côté serveur la protection anti-abus du Google Apps Script de contact.
- Ne pas envoyer de documents confidentiels dans le validateur public ; utiliser un canal dédié pour les missions réelles.
- Si un domaine personnalisé est ajouté, mettre à jour `BASE_URL` dans `scripts/build-blog.js`, relancer la génération et vérifier `robots.txt`, `sitemap.xml` et les canonicals.
