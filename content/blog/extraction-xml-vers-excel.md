---
title: "Extraire des données XML vers Excel ou CSV"
slug: "extraction-xml-vers-excel"
description: "Utiliser XPath et un mapping pour consolider des informations dispersées dans un corpus XML."
meta_description: "Comment extraire des données XML vers Excel ou CSV avec XPath, mapping et consolidation contrôlée."
date: "2026-08-25"
updated: "2026-09-05"
category: "Données structurées"
tags: ["XML","XPath","Excel","CSV"]
order: 30
service:
  url: "services.html#extraction"
  label: "Extraction et exploitation des données"
demonstration:
  url: "demonstrations.html#extraction-xml"
  label: "Extraction XML vers Excel et CSV"
contact:
  label: "Cadrer une extraction"
  context: "Quelques fichiers représentatifs et les colonnes attendues permettent d’évaluer le mapping, les normalisations et les formats de sortie."
---

Extraire un corpus XML vers Excel ou CSV ne consiste pas à supprimer les balises. Il faut définir quelles unités produisent une ligne, quelles valeurs deviennent des colonnes et comment représenter les absences, répétitions et exceptions.

## Partir du tableau attendu

La première décision concerne le grain : une ligne par produit, module, opération ou référence. Une extraction qui mélange plusieurs niveaux crée rapidement des doublons artificiels. Les colonnes sont ensuite décrites avec leur nom, leur type, leur caractère obligatoire et leur règle de calcul éventuelle.

Quelques fichiers représentatifs doivent couvrir les variantes connues : valeur absente, élément répété, ordre différent et espaces de noms. Le schéma seul ne montre pas toujours les conventions réellement utilisées dans le corpus.

## Identifier les chemins XPath

XPath sert à adresser des parties d’un document XML. Chaque colonne peut correspondre à un élément, un attribut, une agrégation ou une règle calculée. Les préfixes d’espaces de noms doivent être déclarés dans l’outil d’extraction ; le préfixe visible dans le fichier n’est pas une identité stable à lui seul.

:::table Exemple de mapping vers un tableau produit
| Source | Règle | Colonne |
| --- | --- | --- |
| `/product/@id` | une valeur obligatoire | `product_id` |
| `/product/manufacturer` | texte normalisé | `manufacturer` |
| `/product/status` | valeur contrôlée | `status` |
| `/product/reference` | plusieurs valeurs jointes ou lignes filles | `references` |
:::

## Décider le traitement des valeurs

Une valeur absente n’est pas toujours une chaîne vide, et une chaîne vide n’est pas forcément équivalente à zéro ou à « non applicable ». Ces conventions sont documentées dans le mapping. Il faut également fixer le format des dates, les séparateurs décimaux, la casse, les listes de valeurs autorisées et le comportement face aux caractères de contrôle.

Les éléments répétés imposent un choix : concaténer, produire plusieurs lignes ou créer une table secondaire. Aucune option n’est universelle ; elle dépend du destinataire et de la façon dont les données seront réutilisées.

## Contrôler la consolidation

Le contrôle compare le nombre de fichiers lus, d’unités détectées, de lignes produites et de rejets. Une clé fonctionnelle permet de repérer les doublons. Les valeurs non conformes sont signalées avec leur fichier et leur chemin source, afin qu’une correction ou une décision reste possible.

Un échantillon du tableau final est relu avant l’exécution complète. Après génération, l’ouverture du fichier ne suffit pas : types, encodage, délimiteur, en-têtes et nombre de colonnes doivent aussi être vérifiés.

## Choisir le format de sortie

- **XLSX** facilite la lecture, les filtres et la remise à un utilisateur ;
- **CSV** convient aux imports simples, à condition de fixer encodage, séparateur et conventions de valeurs ;
- **JSON** conserve mieux des structures imbriquées pour une intégration applicative ;
- **SQL** devient pertinent lorsque les tables, clés et types de la cible sont définis.

Le même mapping peut alimenter plusieurs formats, mais chaque format possède ses propres contraintes. Un tableur n’est pas une base de données et un CSV ne transporte ni types explicites ni relations.

## Source de référence

La sélection des informations s’appuie sur [la recommandation W3C XPath 3.1](https://www.w3.org/TR/xpath-3/). Les règles de consolidation et de restitution décrites ici relèvent de la méthode de traitement PPR-Solution.
