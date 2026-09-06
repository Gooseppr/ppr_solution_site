# DESIGN_BASELINE.md — PPR-Solution

Document de référence pour toute intervention future sur le site. Il fige ce qui est validé, autorise les corrections identifiées lors de la mission « correctif visuel chirurgical », et sert de garde-fou : toute modification future qui contredirait ce document doit être justifiée explicitement, pas appliquée par défaut.

## 1. Décisions visuelles validées

- Fond clair (`--bg #f5f7fa`), surfaces blanches ou gris clair (`--surface`, `--surface-subtle`).
- Texte bleu nuit (`--text #132435`), bleu PPR comme couleur principale (`--primary #124c8c`).
- IBM Plex Sans pour le discours, IBM Plex Mono pour le code, les fichiers, les données et les libellés techniques (eyebrow, meta, badges).
- Bordures structurelles fines (1px, `--border`/`--border-strong`), rayons courts (2–6px), ombres très légères réservées aux cartes qui en ont besoin (`--shadow-card`).
- Couleurs syntaxiques XML réelles et fonctionnelles (`--syntax-tag`, `--syntax-attribute`, `--syntax-value`, `--syntax-string`) — jamais un rendu monochrome.
- Palette sémantique, jamais décorative :
  - **bleu** (`--primary`) : action, lien, sélection ;
  - **vert** (`--success`) : valide, livré, exploitable ;
  - **ambre** (`--warning`) : avertissement, exception, décision humaine ;
  - **mauve** (`--structure`) : mapping, règle, structure, transformation ;
  - **rouge** (`--error`) : erreur ou rejet uniquement.
- Pas de dégradés décoratifs, glassmorphism, grosses ombres, formes abstraites.
- Absence d'animation permanente ; transitions courtes (`--transition-fast`, 160ms) sur les seuls états interactifs.
- Densité éditoriale/technique actuelle (tableaux, blocs de code, listes de fichiers plutôt que cartes marketing génériques).

## 2. Composants à préserver

- `.xml-window` / `.xml-code` (fenêtre XML avec coloration syntaxique et numéros de ligne).
- `.pipeline` (chaîne de traitement en boîtes, utilisée dans les vues détaillées de démonstrations et dans les preuves techniques de Prestations — préservée telle quelle dans ces emplacements précis).
- `.demo-case` / `.demo-tabs` / `.demo-summary-card` (vue détaillée des démonstrations, onglets, filtres).
- `.service-table` / `.service-catalog-table` (tableau des prestations, y compris son adaptation mobile en blocs).
- `.blog-card` / `.blog-technical-preview` (aperçus techniques différenciés par type : flow / mapping / table).
- `.contact-panel`, `.form-details`, `.contact-reassurance` (formulaire de contact, précisions repliables, réassurance).
- `.file-input-control` / `.file-input-visual` (sélecteur de fichier francisé du validateur).
- `.result-panel`, `.result-card`, `.summary-grid` (résultats structurés du validateur).

## 3. Fonctionnalités à ne pas casser

- Filtres, compteur, reset et état vide des démonstrations et du blog.
- Recherche, tri (4 options), catégories, sujets et **pagination à 3 articles** du blog.
- Fallback statique du blog sans JavaScript (les `data-blog-post` restent des articles indépendants et lisibles).
- Contrat du formulaire de contact avec Google Apps Script : noms `name`/`email`/`company`/`need`/`format`/`schemas`/`deadline`/`message`/`marketing`, endpoint `GAS_CONTACT_URL`, champ anti-spam `website` (honeypot), consentement marketing, focus sur la première erreur, protection anti-double-soumission, états d'envoi (« Envoi en cours… », succès, échec réseau).
- Validateur : endpoint `s1000d-api.vercel.app`, limite 10 Mo, avertissement de confidentialité, aucun appel réseau tant qu'aucun fichier valide n'est sélectionné.
- Toutes les URLs publiques, ancres (`#controle`, `#transformation`, `#s1000d`, fragments de démonstration, etc.) et métadonnées SEO (canonical, Open Graph, Twitter Card, JSON-LD, sitemap).
- Génération déterministe du blog (`npm run build:blog`) : deux exécutions successives produisent un résultat strictement identique.

## 4. Corrections autorisées (et appliquées dans cette mission)

- Suppression des grilles à deux colonnes qui ne faisaient que placer un titre à gauche et un paragraphe à droite (voir §7).
- H1 utilisant la largeur utile du conteneur plutôt qu'une colonne étroite, avec des tailles différenciées par page (voir §5 du brief / rapport final).
- Démonstration phare de l'accueil recomposée en une seule colonne, diagramme en pleine largeur entre le texte et les CTA.
- Suppression complète du concept d'article « mis en avant » sur le blog : une seule grille, cartes à égalité, pagination à 3 articles.
- Remplacement de deux pipelines CSS improvisés par de véritables diagrammes Mermaid (accueil, méthode de l'atelier À propos) lorsqu'un diagramme apporte réellement plus qu'une suite de boîtes stylées.
- Intégration de 4 icônes Lucide strictement sélectionnées (voir `assets/icons/ICONS.md`).

## 5. Éléments explicitement interdits

- Réintroduire une grille 2 colonnes « titre / paragraphe » sans relation visuelle réelle entre les deux colonnes.
- Réintroduire l'article mis en avant du blog, ou toute variante « à la une », « sélection », « principal ».
- Charger Mermaid ou une bibliothèque d'icônes complète dans le navigateur en production, ou via CDN.
- Ajouter une icône devant chaque titre, CTA, ligne de tableau ou prestation.
- Inventer des clients, certifications, résultats commerciaux, normes maîtrisées ou références réelles.
- Introduire React, Vue, Angular, Tailwind, un framework CSS complet, ou tout système de build disproportionné par rapport à un site statique HTML/CSS/JS natif.

## 6. Rôle de Mermaid et de Lucide

- **Mermaid CLI** est un outil de *build* uniquement : les sources `.mmd` vivent dans `assets/diagrams/sources/`, le SVG est généré par `npm run build:diagrams` et commité comme asset statique dans `assets/diagrams/generated/`. Le navigateur ne charge jamais Mermaid ; les pages référencent uniquement des fichiers `.svg` via `<img>`.
- Mermaid est réservé aux diagrammes de flux/méthode où une vraie relation de séquence existe (ex. document → structuration → contrôle → publication). Il ne remplace ni les tableaux de mapping, ni les diffs XML, ni les aperçus PDF, ni les listes de fichiers, ni les compteurs d'audit — ces représentations existantes sont préservées telles quelles.
- **Lucide Static** fournit uniquement les icônes effectivement utilisées, assemblées dans un sprite local (`assets/icons/lucide-sprite.svg`, généré par `npm run build:icons`). Aucun CDN, aucune icône orpheline. Voir `assets/icons/ICONS.md` pour la liste exacte et sa justification.

## 7. Règle de décision pour les compositions en colonnes

Une grille à deux colonnes est **autorisée** seulement si la seconde colonne porte une relation de contenu réelle avec la première :

- source / cible, avant / après ;
- texte / véritable aperçu (diagramme, capture, tableau de preuve) ;
- problème / résultat, question / action (CTA) ;
- formulaire / informations pratiques.

Elle est **interdite** quand elle ne sert qu'à répartir un titre (H1 ou H2) à gauche et un paragraphe d'accompagnement à droite, ou à caser un pipeline complexe dans une demi-largeur. Dans ce cas, la composition par défaut est : **Eyebrow → Titre pleine largeur → Introduction courte → Action/contenu**.

Décisions appliquées (détail complet dans le rapport final) :

| Grille auditée | Décision |
|---|---|
| `.home-hero` (accueil) | Conservée en 2 colonnes **sous le H1 uniquement** (texte/CTA à gauche, fenêtre XML à droite) — relation texte/preuve réelle |
| `.demo-feature` (démo phare accueil) | Remplacée par une composition en une colonne |
| `.services-intro-row` | Remplacée par une composition en une colonne |
| `.demo-explorer-intro` | Remplacée par une composition en une colonne |
| `.blog-library-intro` | Remplacée par une composition en une colonne |
| `.about-intro-grid` | Remplacée par une composition en une colonne |
| `.validator-intro-layout` | Supprimée entièrement (hero aplati) |
| `.section-heading` (partagé) | Remplacée par une composition en une colonne |
| `.editorial-grid` (livrables, accueil) | Remplacée par une composition en une colonne + grille pleine largeur |
| `.editorial-grid`/`s1000d-layout` (S1000D, accueil) | Remplacée par une composition en une colonne (texte + boutons seulement) |
| `.editorial-grid` (autres standards, prestations) | Remplacée par une composition en une colonne |
| `.editorial-grid` (CTA final) | **Conservée** — relation question/action, copie resserrée |
| `.about-workshop-layout` | **Conservée** — texte à gauche, véritable diagramme Mermaid à droite |
| `.evidence-grid`/`.report-layout`/`.demo-overview-grid` (vues détaillées démonstrations) | **Conservées** — hors périmètre, vue détaillée validée |

## 8. Critères de vérification après modification

Avant toute publication d'une modification future :

1. `npm run build:blog` puis relancer : sortie strictement identique (déterminisme).
2. `npm run build:diagrams` : échec net et explicite si une source `.mmd` est invalide.
3. Aucune grille « titre / paragraphe » sans relation de contenu réelle (voir §7) sur les pages principales.
4. Le H1 de chaque page utilise la largeur utile du conteneur (pas de retour à la ligne artificiel dû à un `max-width` en `ch`).
5. Aucun débordement horizontal racine à 320/375/768/1024/1440px.
6. Blog : aucun article traité différemment des autres, pagination fonctionnelle au-delà de 3 articles, recherche/tri/filtres/reset/état vide/fallback JSON intacts.
7. Contact et validateur : aucune régression fonctionnelle (voir §3), aucun envoi réel pendant les tests.
8. Icônes : toutes `aria-hidden="true"`, jamais seules sans libellé visible, sprite local à jour avec la liste dans `ICONS.md`.
9. Diagrammes : `accTitle`/`accDescr` présents dans chaque source, `alt` complet et légende visible sur chaque `<img>` de diagramme publié.
10. Toutes les URLs publiques et ancres existantes répondent toujours (crawl interne sans lien cassé).
