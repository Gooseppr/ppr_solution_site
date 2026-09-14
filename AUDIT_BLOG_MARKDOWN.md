# Audit — migration du blog vers Markdown

Qualification locale du 14 septembre 2026, depuis le dépôt `ppr_solution_site`, état de référence `8d0dc1f`. Aucune réécriture du fond des six articles.

## Résultat

- Source unique : six fichiers `content/blog/*.md`, frontmatter YAML et corps Markdown lisible.
- Sorties conservées : six pages HTML statiques, `blog/posts.json`, `blog.html`, `sitemap.xml`.
- Templates, navigation, pied de page, typographies, filtres et pagination à trois cartes conservés.
- Seul libellé éditorial de l’index harmonisé : « Ressources & veille » devient « Blog », avec le titre et le nom CollectionPage correspondants. Titres d’articles inchangés.
- Sommaire compatible H2/H3, ancres H4 ; composants contrôlés pour pipelines, notes et tableaux légendés. Code échappé avec défilement local.
- Temps de lecture calculé une seule fois au build puis repris par le navigateur ; calcul de secours conservé pour un ancien JSON.

## Fidélité avant/après

Comparaison automatique avec `git show 8d0dc1f:blog/posts.json` et les six anciennes pages : texte normalisé, toutes les métadonnées éditoriales, temps de lecture, liens `href`, ancres H2, balises meta, JSON-LD, légendes et cellules de tableaux identiques. Les espaces et retours à la ligne HTML sont normalisés par le rendu Markdown. Les en-têtes de lignes du tableau XML/JSON sont conservés.

| Article | Lecture avant/après | Contenu, liens, ancres et SEO |
| --- | --- | --- |
| validation-corpus-xml-xsd | 2 min | Identiques |
| transformation-xml-modele-cible | 3 min | Identiques |
| extraction-xml-vers-excel | 3 min | Identiques |
| brex-s1000d-controle-xml | 2 min | Identiques |
| xml-documentation-technique | 4 min | Identiques |
| xml-ou-json | 5 min | Identiques |

Les dates originales sont conservées. Le champ optionnel `order` préserve l’ordre du corpus et les liens précédent/suivant sans liste éditoriale cachée dans le code.

## Tests

- `npm run build:blog` deux fois : sorties identiques.
- `npm test` : 19 tests réussis, dont les 10 tests SEO existants conservés et étendus à H3/H4 lorsque nécessaire.
- Cas négatifs : champs manquants, types invalides, dates impossibles, YAML invalide/dupliqué, alias YAML, slugs dupliqués, nom de fichier incohérent, chemins remontants, fichiers/fragments absents, H1 dans le corps, hiérarchie incohérente, composants non clôturés, HTML/script hostile.
- Synchronisation source → HTML/JSON/index/sitemap ; ajout et retrait dans des dossiers temporaires ; build sans JSON préalable ; associations facultatives et liens vers des articles nouvellement créés.
- `npm run build:diagrams` : 11 diagrammes régénérés avec succès, aucune différence Git dans les SVG ou leur manifeste.
- Chromium local : 40 combinaisons page/largeur sans débordement racine (blog, six articles et un article de stress avec code/tableau long ; largeurs 320, 375, 768, 1024, 1440 px).
- Recherche sans accents, quatre tris, catégories, sujets, état vide, reset, pagination au clavier : réussis.
- JSON indisponible : cartes statiques reprises et filtrables. JavaScript désactivé : six articles accessibles et lisibles.
- Aucun envoi de formulaire ni appel au validateur. Aucun parseur Markdown ou moteur Mermaid ajouté au navigateur.

## SEO et découverte

HTML intégral et liens présents dès la réponse initiale ; pas de dépendance à JavaScript pour découvrir ou lire les articles. Canonical, Open Graph, Twitter Card, dates et JSON-LD conservés. Sitemap généré depuis les Markdown et toujours déclaré dans robots.txt. Ces garanties techniques ne prouvent pas une indexation effective, un classement ou une citation par une IA. Le suivi Search Console relève du propriétaire après publication ; aucune soumission externe n’a été effectuée.

Le [guide de rédaction](BLOG_AUTHORING.md) couvre les questions recherchées par les lecteurs, les sources primaires, les exemples vérifiables, le maillage interne et les limites des promesses SEO.

## Limites et suivi

- La suppression d’un Markdown synchronise le catalogue et le sitemap, sans destruction automatique de l’ancienne page HTML : décider explicitement du devenir des URL déjà publiées.
- Images éditoriales : PNG/SVG locaux avec texte alternatif et dimensions, pas de téléchargement distant au build.
- Pas de framework, service de rendu ou dépendance IA. Markdown-it 14.3.2 et YAML 2.9.1 sont verrouillés et compatibles avec Node 20.15.1.
- `npm audit` signale 7 dépendances à sévérité élevée dans la chaîne Mermaid/Puppeteer préexistante (`@mermaid-js/mermaid-cli`, `@puppeteer/browsers`, `extract-zip`, `puppeteer`, `puppeteer-core`, `tar-fs`, `ws`). Aucune alerte identifiée sur les nouvelles dépendances Markdown/YAML. Prévoir une mise à niveau de cet outillage séparément, avec comparaison des diagrammes ; aucun `npm audit fix --force` n’a été appliqué. Ces outils ne sont pas chargés en production par le navigateur.
