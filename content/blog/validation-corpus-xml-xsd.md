---
title: "Valider plusieurs milliers de fichiers XML contre un XSD"
slug: "validation-corpus-xml-xsd"
description: "Méthode pour qualifier un corpus XML volumineux, classer les erreurs et produire un rapport exploitable."
meta_description: "Comment valider un corpus XML volumineux contre un XSD, classer les anomalies et préparer des livrables exploitables."
date: "2026-08-25"
updated: "2026-09-05"
category: "Qualité des données"
tags: ["XML","XSD","Validation","Corpus"]
order: 10
service:
  url: "services.html#controle"
  label: "Contrôle et qualification XML"
demonstration:
  url: "demonstrations.html#audit-xml"
  label: "Audit XML multi-erreurs"
contact:
  label: "Faire qualifier mon corpus"
  context: "Si les contrôles doivent couvrir un lot réel, un échantillon et les règles disponibles suffisent pour cadrer la qualification."
---

Valider un fichier XML isolé est une opération simple. Qualifier un corpus volumineux demande une chaîne reproductible : inventorier les fichiers, vérifier leur syntaxe, appliquer le bon schéma, classer les anomalies puis rejouer les contrôles après correction.

## Commencer par l’inventaire réel

Le nombre annoncé de fichiers ne suffit pas à définir le périmètre. L’inventaire relève les extensions, encodages, tailles, doublons, fichiers vides, archives et familles de schémas attendues. Il repère aussi les documents qui déclarent une version ou un espace de noms différent du lot principal.

Cette étape évite deux résultats trompeurs : ignorer une partie du corpus parce qu’elle n’a pas l’extension prévue, ou valider tous les fichiers avec un schéma qui ne correspond qu’à une version.

:::pipeline
CORPUS XML
INVENTAIRE
PARSING
VALIDATION XSD
CLASSIFICATION
RAPPORT
:::

## Distinguer syntaxe, schéma et règles métier

Un parseur vérifie d’abord que le document est bien formé au sens d’XML : balises fermées, imbrication correcte, attributs conformes à la syntaxe. Un XSD contrôle ensuite une classe de documents : éléments attendus, ordre, cardinalités, attributs et types de valeurs. Une référence absente ou une règle propre au métier peut toutefois rester hors du champ du XSD et nécessiter Schematron ou un contrôle complémentaire.

Ces niveaux doivent rester séparés dans le rapport. Une erreur de parsing bloque l’analyse structurelle du fichier ; une valeur invalide dans un document bien formé est un autre cas, avec une correction et une priorité différentes.

## Classer des occurrences exploitables

Un export utile rattache chaque occurrence au fichier, au contrôle, à une localisation aussi précise que possible et au message du moteur. Le regroupement par code d’erreur permet de distinguer une anomalie répétée dans tout le corpus d’un cas isolé. Les catégories — bloquant, à examiner, information — doivent être documentées plutôt que déduites uniquement du niveau fourni par un outil.

Avant une correction en masse, un échantillon représentatif sert à confirmer la règle. Après traitement, la validation complète est rejouée : corriger une occurrence ne prouve pas que le lot final respecte encore toutes les contraintes.

## Livrables utiles

- inventaire du périmètre et des versions détectées ;
- synthèse par famille d’anomalies ;
- CSV ou XLSX des occurrences avec fichier et localisation ;
- listes distinctes des fichiers valides, invalides et non analysables ;
- journal des règles, corrections et rejets ;
- résultat du contrôle final.

> **À retenir**
>
> La validation d’un corpus n’est pas un simple total « valide/invalide ». Sa valeur vient de la couverture du périmètre, de la classification et de la possibilité de reproduire le contrôle.

## Sources de référence

- [W3C — Extensible Markup Language (XML) 1.0](https://www.w3.org/TR/xml/), pour la notion de document bien formé ;
- [W3C — XML Schema Definition Language 1.1, Structures](https://www.w3.org/TR/xmlschema11-1/), pour les contraintes portées par un schéma.
