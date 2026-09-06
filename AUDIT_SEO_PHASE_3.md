# Audit SEO et éditorial — phase 3

Date de la passe : 5 septembre 2026  
Base canonique : `https://gooseppr.github.io/ppr_solution_site/`

## Synthèse

- 18 fichiers HTML publics cartographiés : 16 pages indexables, une 404 en `noindex, follow` et une source HTML de PDF en `noindex`.
- Accueil unifié sur la racine `/ppr_solution_site/` dans le canonical, le sitemap, Open Graph, JSON-LD, le manifeste et les liens de retour à l’accueil. `/index.html` reste le fichier physique, mais n’est plus proposé comme URL canonique.
- Titles, descriptions et canonicals uniques sur les 16 pages indexables.
- Open Graph et Twitter Card complets sur l’accueil, les prestations, les démonstrations, le blog, les articles, À propos, Contact et le validateur.
- Données structurées : `Organization` et `WebSite` sur l’accueil, `CollectionPage` sur le blog, `Organization`, `BreadcrumbList` et `BlogPosting` sur chaque article.
- Six articles enrichis à partir de sources primaires ; aucun nouvel article ni aucune page commerciale creuse.
- Temps de lecture calculé automatiquement à 220 mots/minute, minimum une minute, sur le seul HTML éditorial fourni au générateur.
- Pagination conservée à trois articles et documentation synchronisée.

## A. Cartographie SEO finale

Les canonicals ci-dessous sont relatifs à la base indiquée plus haut. « — » signifie volontairement absent sur une page exclue de l’index.

| URL | Classe et intention | Index | Title | H1 | Canonical | Sitemap | Schema.org | Problème restant | Priorité |
|---|---|---:|---|---|---|---:|---|---|---|
| `/` | Commerciale — comprendre l’activité | Oui | PPR-Solution · Structuration et transformation documentaire | Transformer vos contenus en documentation structurée | `/` | Oui | Organization, WebSite | Aucun | Basse |
| `/services.html` | Commerciale — évaluer les prestations et livrables | Oui | Structuration et prestations documentaires · PPR-Solution | Structurer, transformer et publier vos contenus | `/services.html` | Oui | — | Aucun | Basse |
| `/demonstrations.html` | Preuve — examiner méthodes et livrables | Oui | Démonstrations de traitements documentaires · PPR-Solution | Voir les traitements, des sources aux livrables | `/demonstrations.html` | Oui | — | Aucun | Basse |
| `/blog.html` | Éditoriale — explorer méthodes et analyses | Oui | Ressources documentation, données et technologies · PPR-Solution | Documentation, données et technologies | `/blog.html` | Oui | CollectionPage | Aucun | Basse |
| `/a-propos.html` | Institutionnelle — évaluer méthode et responsabilité | Oui | À propos · Atelier documentaire PPR-Solution | Une continuité maîtrisée, du cadrage à la livraison | `/a-propos.html` | Oui | — | Aucun | Basse |
| `/contact.html` | Commerciale — présenter un besoin | Oui | Contact · Décrire un besoin documentaire · PPR-Solution | Décrivez votre besoin | `/contact.html` | Oui | — | Aucun | Basse |
| `/validateur.html` | Outil — précontrôler un module S1000D | Oui | Validateur XML S1000D · Démonstrateur secondaire | Validateur XML S1000D | `/validateur.html` | Oui | — | Aucun | Basse |
| `/charte-ethique.html` | Institutionnelle — engagements d’usage | Oui | Charte éthique | Charte éthique | `/charte-ethique.html` | Oui | — | Métadonnées sociales non nécessaires | Basse |
| `/mentions-legales.html` | Juridique — identifier l’éditeur et l’hébergement | Oui | Mentions légales | Mentions légales | `/mentions-legales.html` | Oui | — | Métadonnées sociales non nécessaires | Basse |
| `/confidentialite.html` | Juridique — comprendre les traitements | Oui | Politique de confidentialité | Politique de confidentialité | `/confidentialite.html` | Oui | — | Métadonnées sociales non nécessaires | Basse |
| `/blog/validation-corpus-xml-xsd/` | Éditoriale — qualifier un corpus XML | Oui | Valider plusieurs milliers de fichiers XML contre un XSD · Blog PPR-Solution | Valider plusieurs milliers de fichiers XML contre un XSD | URL propre | Oui | Organization, BreadcrumbList, BlogPosting | Aucun | Basse |
| `/blog/transformation-xml-modele-cible/` | Éditoriale — cadrer une transformation XML | Oui | Transformer un modèle XML vers un autre · Blog PPR-Solution | Transformer un modèle XML vers un autre | URL propre | Oui | Organization, BreadcrumbList, BlogPosting | Aucun | Basse |
| `/blog/extraction-xml-vers-excel/` | Éditoriale — extraire un corpus vers un tableau | Oui | Extraire des données XML vers Excel ou CSV · Blog PPR-Solution | Extraire des données XML vers Excel ou CSV | URL propre | Oui | Organization, BreadcrumbList, BlogPosting | Aucun | Basse |
| `/blog/brex-s1000d-controle-xml/` | Éditoriale — distinguer XSD et BREX | Oui | Comprendre le rôle d’un BREX dans un contrôle S1000D · Blog PPR-Solution | Comprendre le rôle d’un BREX dans un contrôle S1000D | URL propre | Oui | Organization, BreadcrumbList, BlogPosting | Aucun | Basse |
| `/blog/xml-documentation-technique/` | Éditoriale — comprendre XML en documentation | Oui | XML : à quoi sert-il dans la documentation technique ? · Blog PPR-Solution | XML : à quoi sert-il dans la documentation technique ? | URL propre | Oui | Organization, BreadcrumbList, BlogPosting | Aucun | Basse |
| `/blog/xml-ou-json/` | Éditoriale — choisir ou faire coexister les formats | Oui | XML ou JSON : lequel choisir pour vos données et vos documents ? · Blog PPR-Solution | XML ou JSON : lequel choisir pour vos données et vos documents ? | URL propre | Oui | Organization, BreadcrumbList, BlogPosting | Aucun | Basse |
| `/404.html` | Exclue — retrouver une page valide | Non | Page introuvable | Page introuvable | `/404.html` | Non | — | Aucun ; `noindex, follow` | Basse |
| `/documents/prestations-ppr-solution.html` | Technique — source du PDF | Non | Présentation détaillée des prestations · PPR-Solution | Structurer, transformer et publier des contenus techniques | — | Non | — | Description/canonical inutiles sur cette source `noindex` | Basse |

### Maillage, titres et médias

| Groupe | Liens entrants internes | Liens sortants internes | Structure Hn | Images HTML |
|---|---:|---:|---|---|
| Pages générales indexables | 17 à 18 par page principale | 9 à 15 | Un H1 ; progression logique dans `main` | Accueil : 1 diagramme avec alt et dimensions |
| Articles | 2 à 3 par article | 10 à 12 | Un H1 ; H2 réels repris dans le sommaire ; H3 sous les connexions | Aucune image décorative ajoutée |
| Validateur | 3 | 9 | H1 puis H2 | Aucune |
| Démonstrations | 17 | 12 | H2 de groupe ajouté avant les titres H3 des cartes | 6 images : alt et dimensions présents ; aperçus lourds en lazy loading |
| 404 et source PDF | 0 | 9 et 2 | Structure adaptée à leur fonction | Aucune |

Aucune page indexable orpheline n’a été détectée. Les sept images HTML ont un attribut `alt`, une largeur et une hauteur explicites. Les diagrammes conservent leurs légendes et alternatives textuelles ; leur contenu essentiel est aussi expliqué en HTML.

### Duplication et cannibalisation

- Accueil : intention générale et orientation vers les parcours.
- Prestations : catalogue central des besoins, interventions et livrables.
- Démonstrations : preuve de méthode, sans reproduire le catalogue.
- Articles XSD et BREX : l’un traite la qualification d’un corpus générique, l’autre les règles métier S1000D.
- Articles XML et XML/JSON : le premier traite la documentation structurée ; le second compare deux modèles de données et leur coexistence.

Aucun conflit nécessitant fusion, suppression ou `noindex` éditorial n’a été retenu.

Le balisage `Service` n’a pas été ajouté : la page Prestations regroupe plusieurs interventions et le contenu visible suffit sans construire artificiellement une offre Schema.org unique. Aucun prix, zone géographique ou identité d’entreprise absente du site n’a été inventé.

## B. Audit éditorial des articles

Le nombre de mots ci-dessous est celui du `content_html`, avant ajout automatique du sommaire, des métadonnées, des CTA et du pied de page.

| Article | Mots avant → après | Lecture | Intention et niveau final | Sources | Maillage utile | Classe avant → après | Action |
|---|---:|---:|---|---|---|---|---|
| Validation d’un corpus XML/XSD | 128 → 432 | 2 min | Méthode de qualification, intermédiaire | W3C XML, W3C XSD | Contrôle XML, démo d’audit, contact corpus | B → A | Inventaire, niveaux de contrôle, classification, rejouabilité et livrables ajoutés |
| Transformation XML vers cible | 91 → 471 | 3 min | Mapping et traitement, intermédiaire | W3C XSLT, W3C XPath | Transformation, démo XML A/B, contact transformation | B → A | Source/cible, cardinalités, namespaces, choix d’outil, pertes et rejets ajoutés |
| Extraction XML vers Excel/CSV | 90 → 495 | 3 min | Consolidation tabulaire, intermédiaire | W3C XPath | Extraction, démo tableur, contact extraction | B → A | Grain, mapping, valeurs absentes, répétitions, contrôles et formats ajoutés |
| BREX dans un contrôle S1000D | 96 → 416 | 2 min | Limites d’un précontrôle, intermédiaire | S1000D Council, S1000D Users | Spécialisation, validateur, contact S1000D | B → A | XSD/BREX, issue, couverture, références, limites et livrables explicités |
| XML en documentation technique | 514 → 803 | 4 min | Modélisation documentaire, intermédiaire | W3C XML, Namespaces, XSD, XPath, XSLT ; Schematron | Structuration, démo publication, article XML/JSON | B → A | Pourquoi XML subsiste, contenu mixte, validation, transformation, coûts et cas défavorables ajoutés |
| XML ou JSON | 580 → 993 | 5 min | Décision d’architecture documentaire, intermédiaire | RFC 8259, JSON Schema, W3C XML, Namespaces et XSL | Transformation, démo extraction, article XML | B → A | Ordre, attributs, validation, namespaces, extensibilité, volume, API, durée de vie et coexistence ajoutés |

Les comptes « avant » isolent le contenu éditorial source ; les comptes de la cartographie HTML incluent les connexions et libellés générés. Les textes restent originaux : aucune traduction ni reprise longue de sources tierces.

## C. Modifications techniques

- `scripts/build-blog.js` : calcul de lecture, préparation des articles, `BlogPosting`, publisher réel sans faux logo, canonical de l’accueil, cartes en H2, pagination centralisée à trois, exports testables.
- `assets/js/blog.js` : même calcul de lecture lors du chargement JSON, pagination lue depuis le HTML, titres de cartes en H2.
- `tests/blog-seo.test.js` et `package.json` : suite Node sur lecture, métadonnées, canonical, JSON-LD, Hn, sommaires, sitemap, images et fallback statique.
- `sitemap.xml` : accueil remplacé par la racine ; aucun `lastmod` fictif.
- `404.html` : `noindex, follow` et liens vers la racine.
- `documents/prestations-ppr-solution.html` : `noindex` préexistant conservé ; hors sitemap.
- `index.html` : Open Graph complété, Twitter Card, `Organization` et `WebSite` exacts.
- `services.html`, `demonstrations.html`, `a-propos.html`, `contact.html`, `validateur.html` : métadonnées sociales cohérentes.
- Tous les retours à l’accueil : racine relative (`./` ou `../../`) au lieu de `index.html`.
- `manifest.webmanifest` : `start_url` alignée sur `./`.
- `README.md` et `DESIGN_BASELINE.md` : pagination à trois et convention de lecture documentées.

Le formulaire, ses endpoints et sa sécurité ne sont pas modifiés. Le validateur, son endpoint et ses avertissements restent inchangés.

## D. Contenus modifiés et sources

- Validation XML : distinction bien-formed/XSD/règles, fondée sur les recommandations W3C XML et XML Schema.
- Transformation : rôle de XSLT et XPath, mapping et contrôles de cible, fondés sur les recommandations W3C.
- Extraction : adressage XPath et décisions de consolidation ; recommandations de méthode clairement présentées comme telles.
- BREX : contenu d’un paquet et rôle des Business Rule Decision Points vérifiés auprès des sites officiels S1000D.
- XML : spécification, namespaces, schémas, XPath/XSLT et Schematron remplacent l’ancienne source AWS unique.
- XML/JSON : propriétés du modèle JSON vérifiées dans RFC 8259, validation dans JSON Schema, comparaison XML dans les recommandations W3C.

## E. Opportunités de pages commerciales SEO

| Intention | Différence possible avec Prestations | Contenu unique disponible | Cannibalisation | Bénéfice prospect | Décision |
|---|---|---|---|---|---|
| Structurer une documentation existante | Parcours depuis DOCX/PDF vers un modèle cible | Échantillon, modélisation, contenu mixte, règles et publication | Moyen avec accueil et ligne « Socle » | Fort si des exemples avant/après supplémentaires deviennent disponibles | À préparer |
| Transformer ou migrer un corpus | Analyse des écarts, mapping, versionnement et rejets | Article de méthode et démonstration A/B | Moyen avec deux lignes du tableau | Fort pour un besoin déjà qualifié | À préparer, sans séparer artificiellement transformation et migration |
| Contrôler et fiabiliser des XML | Couverture XSD/Schematron, classification et revalidation | Article corpus, démo audit et validateur limité | Élevé si la page répète ces trois contenus | Fort avec une preuve de corpus ou un protocole plus détaillé | À préparer après preuve supplémentaire |
| Extraire et publier des données ou documents | Deux intentions différentes réunies dans une seule page | Deux démonstrations existent mais les besoins divergent | Élevé avec Prestations et Démonstrations | Faible sous cette forme combinée | À rejeter en l’état ; réévaluer séparément si du contenu distinct existe |

Aucune page dédiée n’est créée maintenant : le contenu distinct disponible est déjà mieux servi par la page Prestations, les démonstrations et les articles.

## F. Tests exécutés

- `npm test` : 10/10 sous-tests Node réussis.
- Deux exécutions successives de `node scripts/build-blog.js` : 8/8 fichiers générés strictement identiques par SHA-256.
- Audit SEO avant/après : 18 pages ; 16 indexables ; aucune erreur sur une page indexable après la passe.
- Contrôle des liens et fragments : 18 fichiers HTML, aucun lien ou fragment interne cassé, titles uniques, PDF de 3 pages accessible.
- Playwright phase 3 : 171/171 contrôles réussis à 320, 375, 768, 1024 et 1440 px.
- Playwright parcours phase 2 : 357/357 contrôles réussis.
- Sécurité phase 1 : 157/157 contrôles réussis.
- `git diff --check` : aucune erreur d’espace ou de patch.
- Inspection visuelle complémentaire : blog à 1440 px et article XML/JSON à 320 px, sans débordement ni rupture de hiérarchie observée.
- Vérification HTTP de la version publiée avant déploiement : accueil, `/index.html`, `robots.txt`, `sitemap.xml` et image sociale répondent en 200 ; l’image sociale publiée pèse 22 127 octets.

Fonctions vérifiées : recherche, catégories, sujets, tri, compteur, pagination, focus après changement de page, état vide, reset, sommaires, ancres, rendu sans JavaScript, six articles présents dans le HTML, CTA de phase 2, PDF, diagrammes, formulaire POST et avertissements sans JavaScript.

### Performance SEO

- Image sociale unique : 1200 × 630 px, 22 127 octets.
- Dimensions explicites pour toutes les images HTML ; aperçus de publication en lazy loading.
- Scripts du site chargés avec `defer` ; aucun framework ni dépendance côté client ajouté.
- Blog et articles entièrement présents dans le HTML initial.
- Polices Google conservées comme dépendance externe existante ; leur auto-hébergement n’a pas été introduit dans cette phase.

## G. Points nécessitant une intervention humaine

- Google Search Console n’est pas accessible depuis le dépôt : soumettre ou vérifier le sitemap après publication et surveiller l’indexation de `/` face à l’ancienne URL `/index.html`.
- GitHub Pages sert actuellement `/` et `/index.html` en 200 sans redirection côté serveur. Le canonical, le sitemap et le maillage choisissent désormais `/` ; une redirection HTTP ne peut pas être ajoutée dans ce site statique seul.
- Les informations juridiques complètes de l’entreprise et une éventuelle identité graphique de logo ne sont pas disponibles ; aucun champ Schema.org correspondant n’a été inventé.
- Les quatre opportunités commerciales doivent être réévaluées avec données de requêtes, demandes réelles et preuves métier supplémentaires.
- Le contenu S1000D doit être relu lors d’un changement d’issue ou de paquet de règles applicable.
- L’état « après » est vérifié localement. Aucun commit ni déploiement n’a été effectué ; les réponses HTTP du site publié resteront celles de la version précédente jusqu’à publication.
