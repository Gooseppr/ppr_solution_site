---
title: "XML ou JSON : lequel choisir pour vos données et vos documents ?"
slug: "xml-ou-json"
description: "Comparer XML et JSON à partir du contenu, des règles de validation, des outils existants et des usages de publication."
meta_description: "XML ou JSON : critères pratiques pour choisir un format selon les données, les documents, la validation, les échanges et la publication."
date: "2026-09-02"
updated: "2026-09-05"
category: "Formats et interopérabilité"
tags: ["XML","JSON","Données","Interopérabilité"]
order: 60
service:
  url: "services.html#transformation"
  label: "Transformation et conversion"
demonstration:
  url: "demonstrations.html#extraction-xml"
  label: "Extraction XML vers des données tabulaires"
contact:
  label: "Choisir un format pour mon projet"
  context: "Le choix dépend de vos contenus, des systèmes destinataires et des contrôles attendus ; quelques exemples permettent de comparer les options sur un cas réel."
---

XML et JSON représentent tous deux de l’information structurée. Ils ne répondent pourtant pas au même modèle de contenu ni au même écosystème. Le choix doit partir des documents ou messages réels, des contrôles nécessaires et de la durée de vie attendue.

## Distinguer document et message applicatif

JSON définit un petit ensemble de valeurs : objet, tableau, chaîne, nombre, booléen et null. Cette correspondance directe avec les structures de nombreux langages le rend pratique pour les API, événements, configurations et échanges applicatifs.

XML représente un document sous forme d’éléments, d’attributs, de texte et d’autres nœuds ordonnés. Il est particulièrement à l’aise avec le contenu mixte : un paragraphe peut contenir du texte, un terme identifié, une référence et la suite du texte dans un ordre significatif.

La frontière n’est pas absolue. XML peut transporter un message d’API et JSON peut décrire le contenu d’une publication. La question est de savoir quel modèle réduit les adaptations et les ambiguïtés pour le cas concerné.

## Ordre, attributs et espaces de noms

En JSON, les éléments d’un tableau sont ordonnés, mais la spécification décrit un objet comme une collection non ordonnée de membres. Une application ne devrait donc pas donner un sens métier à l’ordre des propriétés d’un objet. En XML, l’ordre des éléments enfants fait partie du document et peut être contraint par le modèle.

XML distingue éléments et attributs. Cette distinction permet à un vocabulaire documentaire de séparer contenu et propriétés, mais elle impose des choix de modélisation. JSON n’a pas d’attribut natif : la même information est représentée par une propriété, éventuellement selon une convention du projet.

Les espaces de noms XML identifient des vocabulaires avec des URI et évitent les collisions lorsque plusieurs modèles sont combinés. JSON ne possède pas de mécanisme de namespaces équivalent dans son format de base ; les contrats utilisent plutôt des noms, URI ou conventions propres à leur écosystème.

## Comparer la validation

XSD décrit les éléments, attributs, cardinalités, ordres et types d’une classe de documents XML. Schematron peut ajouter des assertions contextuelles. Pour JSON, JSON Schema décrit la structure, documente les propriétés et exprime des contraintes de validation.

Dans les deux cas, un schéma ne valide que ce qu’il exprime. Il ne prouve pas qu’une donnée est vraie, qu’une référence externe existe ou qu’une procédure est techniquement correcte. La version du schéma et le comportement de l’outil doivent faire partie du contrat d’échange.

## Extensibilité et compatibilité

XML peut intégrer de nouveaux éléments ou attributs, parfois issus d’un autre namespace. JSON peut ajouter des propriétés ou faire évoluer des objets. Cette extensibilité n’est sûre que si le consommateur sait quoi faire des informations inconnues : les ignorer, les conserver ou les refuser.

Une règle « accepter l’inconnu » facilite certaines évolutions mais peut masquer une faute de frappe. Une règle stricte détecte les écarts, au prix d’une coordination plus forte entre producteurs et consommateurs. Le choix relève du contrat, pas du format seul.

## Lisibilité, volume et outillage

JSON est souvent plus compact pour des objets simples. XML répète les noms dans les balises ouvrantes et fermantes et peut donc produire davantage de texte brut. La taille transférée dépend toutefois aussi des noms choisis, du contenu et de la compression ; elle ne devrait pas être estimée uniquement sur un exemple minuscule.

La lisibilité humaine dépend surtout du modèle et des outils. Un JSON profondément imbriqué peut être difficile à parcourir, tout comme un XML saturé de préfixes. Pour de gros volumes, le mode de traitement — flux, arbre en mémoire, index ou base documentaire — compte souvent davantage que la syntaxe.

## Transformation, publication et API

L’écosystème XML fournit XPath pour sélectionner, XSLT pour transformer et des chaînes documentaires capables de produire XML, HTML ou PDF. Cela favorise les corpus structurés et les publications multicanales.

JSON s’intègre directement dans de nombreux frameworks d’API et bibliothèques applicatives. Les transformations sont souvent écrites dans le langage de l’application. Cette souplesse est efficace, mais les règles risquent de rester dispersées si le mapping n’est pas documenté séparément.

## Comparer selon le besoin réel

:::table Critères de choix entre XML et JSON
| Critère | XML | JSON |
| --- | --- | --- |
| **Contenu** | Documents, texte mixte, références et structures riches | Objets, tableaux et messages de données |
| **Ordre** | Ordre des nœuds significatif et contrôlable | Tableaux ordonnés ; propriétés d’objet non ordonnées |
| **Propriétés** | Éléments et attributs distincts | Propriétés d’objet |
| **Vocabulaires** | Namespaces normalisés | Conventions définies par le contrat |
| **Validation** | XSD, Schematron et contrôles complémentaires | JSON Schema et contrôles applicatifs |
| **Transformation** | XPath et XSLT, écosystème documentaire | Bibliothèques et code applicatif |
| **API** | Pertinent si contrat ou existant XML | Souvent plus direct dans les stacks web |
| **Durée de vie** | Fort historique documentaire et modèles sectoriels | Très répandu dans les systèmes applicatifs actuels |
:::

## Faire coexister XML et JSON

Une architecture peut conserver XML comme source documentaire de référence et exposer en JSON les données nécessaires à une application. À l’inverse, des objets JSON peuvent alimenter une génération de documents. Le mapping doit alors identifier la source d’autorité, les transformations et les pertes possibles.

Exemple : une procédure XML conserve l’ordre des étapes, les avertissements et les références. Une API JSON publie seulement l’identifiant, le statut et la date de mise à jour pour un tableau de bord. Les deux formats ne sont pas des copies concurrentes : chacun a un périmètre défini.

## Décider sur la durée de vie complète

1. Décrire les contenus réels, y compris texte long, répétitions et exceptions.
2. Identifier les producteurs, consommateurs et formats déjà imposés.
3. Lister validations, transformations, recherches et publications.
4. Définir la source d’autorité et les règles de versionnement.
5. Mesurer les coûts de conversion, d’outillage et de maintenance.
6. Tester un échantillon dans les deux formats si le choix reste ouvert.

> **À retenir**
>
> JSON est souvent direct pour les messages applicatifs ; XML reste adapté aux documents riches et aux chaînes de validation et publication. Ils peuvent coexister si leur responsabilité et leur mapping sont explicites.

## Sources primaires

- [RFC 8259 — The JavaScript Object Notation (JSON) Data Interchange Format](https://www.rfc-editor.org/info/rfc8259) ;
- [JSON Schema 2020-12 — Core](https://json-schema.org/draft/2020-12/json-schema-core) ;
- [W3C — Extensible Markup Language (XML) 1.0](https://www.w3.org/TR/xml/) ;
- [W3C — Namespaces in XML 1.0](https://www.w3.org/TR/REC-xml-names/) ;
- [W3C — famille XSL, XPath et XSLT](https://www.w3.org/Style/XSL/).
