---
title: "Transformer un modèle XML vers un autre"
slug: "transformation-xml-modele-cible"
description: "Concevoir un mapping source → cible, gérer les rejets et valider le XML produit."
meta_description: "Méthode pour transformer un modèle XML vers un autre : mapping, transformation, validation cible et gestion des rejets."
date: "2026-08-25"
updated: "2026-09-05"
category: "Transformation documentaire"
tags: ["XML","XSLT","Mapping","Transformation"]
order: 20
service:
  url: "services.html#transformation"
  label: "Transformation et conversion XML"
demonstration:
  url: "demonstrations.html#transformation-xml"
  label: "Transformation XML A vers XML B"
contact:
  label: "Évaluer une transformation"
  context: "Un exemple source, la cible attendue et les règles connues permettent d’identifier rapidement les mappings et les exceptions à traiter."
---

Une transformation XML fiable commence par le mapping. Le programme n’est que l’exécution de décisions explicites entre une source observée, un modèle cible et les règles applicables aux exceptions.

## Décrire la source et la cible

Le schéma source indique ce qui peut arriver ; l’échantillon montre ce qui arrive réellement. Les deux sont nécessaires. Le modèle cible précise les éléments obligatoires, leur ordre, les cardinalités, les types et les espaces de noms. Sans ces références, une transformation peut produire un XML bien formé mais inutilisable par le système destinataire.

Il faut aussi qualifier la relation entre les modèles : renommage direct, regroupement de plusieurs valeurs, découpage d’un champ, valeur calculée ou information sans équivalent. Les pertes acceptées doivent être décidées, pas découvertes après livraison.

## Formaliser le mapping

:::table Exemple simplifié de règles source vers cible
| Source | Règle | Cible |
| --- | --- | --- |
| `part/@id` | copie obligatoire | `item/code` |
| `part/label` | texte normalisé | `item/name` |
| `part/state` | table de correspondance | `item/status` |
| identifiant absent | rejet tracé | aucun élément |
:::

Une ligne de mapping doit préciser le chemin, la cardinalité, la valeur par défaut éventuelle, les règles de normalisation et le comportement en cas d’absence ou de multiplicité inattendue. Les espaces de noms font partie du contrat : un XPath sans préfixe adapté peut ne sélectionner aucun élément alors que le fichier semble correct à l’œil.

## Choisir XSLT ou un traitement scripté

XSLT est conçu pour transformer des documents XML et s’appuie sur XPath pour sélectionner leur contenu. Il convient bien aux transformations arborescentes et aux publications XML vers XML ou HTML. Un script généraliste peut être plus direct lorsque le traitement combine plusieurs formats, appelle des services ou réalise des calculs extérieurs au document.

Le choix de l’outil ne remplace pas le mapping. Dans les deux cas, les règles doivent pouvoir être relues, versionnées et testées sur des exemples représentatifs.

:::pipeline
SOURCE + SCHÉMA
MAPPING
TRANSFORMATION
CIBLE + SCHÉMA
VALIDATION
:::

## Valider la cible et les exceptions

Chaque sortie est parsée puis validée contre le modèle cible. Les contrôles portent également sur les invariants métier utiles : unicité d’un identifiant, conservation du nombre d’objets, références résolues ou valeurs appartenant à une liste. Un total cohérent ne suffit pas si plusieurs sources ont été fusionnées ou filtrées volontairement ; le rapport doit expliquer l’écart.

Les cas non transformables ne doivent pas disparaître silencieusement. Ils sont isolés avec leur fichier source, la règle concernée et le motif de rejet afin qu’une décision humaine reste possible.

## Livrables et limites

Les livrables utiles comprennent les XML cibles, le mapping versionné, les règles exécutables, les contrôles, le rapport de traitement et la liste des rejets. Une transformation automatisée ne résout pas une ambiguïté métier : si la cible exige une information absente de la source, il faut une valeur autorisée, une source complémentaire ou une décision explicite.

## Sources de référence

- [W3C — XSL Transformations (XSLT) 3.0](https://www.w3.org/TR/xslt-30/) ;
- [W3C — XML Path Language (XPath) 3.1](https://www.w3.org/TR/xpath-3/).
