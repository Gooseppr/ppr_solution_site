---
title: "Comprendre le rôle d’un BREX dans un contrôle S1000D"
slug: "brex-s1000d-controle-xml"
description: "Le BREX complète le schéma XML avec des règles métier propres à un programme documentaire S1000D."
meta_description: "Comprendre le rôle d’un BREX S1000D : règles métier, validation complémentaire et limites par rapport au XSD."
date: "2026-08-25"
updated: "2026-09-05"
category: "Documentation structurée"
tags: ["S1000D","BREX","XML","Documentation"]
order: 40
service:
  url: "services.html#s1000d"
  label: "Documentation structurée et S1000D"
demonstration:
  url: "validateur.html"
  label: "Validateur S1000D secondaire"
contact:
  label: "Présenter un besoin S1000D"
  context: "Pour un corpus, des références ou des règles BREX propres à votre programme, le périmètre doit être examiné au-delà du validateur public."
---

Dans un environnement S1000D, la validité XML et le respect des règles du projet sont deux contrôles complémentaires. Le module BREX sert à échanger une partie des règles métier applicables au programme documentaire.

## XSD et BREX ne contrôlent pas la même chose

Le paquet de schémas d’une issue S1000D décrit les structures XML autorisées pour les différents types de modules. Il contrôle notamment les éléments, attributs, ordres et cardinalités prévus par ce modèle. Un module peut donc être valide au sens du XSD tout en employant une option que le projet a décidé d’interdire.

Le BREX porte des décisions supplémentaires : présence ou absence d’une structure, valeurs admises, pratiques retenues ou restrictions propres au programme. Ces règles se rattachent aux Business Rule Decision Points définis par l’écosystème S1000D. Elles ne remplacent pas le schéma et ne prouvent pas, à elles seules, que le contenu technique est exact.

:::pipeline
DATA MODULE
ISSUE + SCHÉMAS
RÈGLES BREX
RÉFÉRENCES
SYNTHÈSE
:::

## Préparer un contrôle reproductible

Avant l’exécution, il faut identifier l’issue S1000D, la famille de schémas, le BREX applicable et les éventuelles règles qui restent dans une documentation extérieure. Une règle sans version ou sans périmètre explicite peut produire des résultats contradictoires entre deux lots.

Le contrôle suit ensuite des niveaux distincts : fichier lisible et bien formé, validité XSD, règles BREX exécutables, références contrôlables et vérifications complémentaires convenues. Chaque anomalie doit mentionner le module, la règle, la localisation et le niveau de contrôle qui l’a produite.

## Ce qu’un BREX ne suffit pas à valider

Certaines décisions peuvent rester exprimées en langage naturel, dépendre d’une source externe ou nécessiter une appréciation métier. Une référence peut être syntaxiquement correcte mais pointer vers un objet absent du corpus fourni. De même, la conformité structurelle d’une procédure ne garantit ni sa sûreté ni son exactitude technique.

Il faut donc annoncer précisément la couverture : règles effectivement chargées, références disponibles, exceptions ignorées et contrôles humains prévus. Cette transparence compte davantage qu’un verdict global sans détail.

## Livrables d’un précontrôle

- inventaire des modules, schémas et règles utilisés ;
- résultats XSD séparés des résultats BREX ;
- occurrences localisées et regroupées par règle ;
- références non résolues dans le périmètre fourni ;
- liste des limites et décisions à confirmer.

> **Limite**
>
> Un précontrôle technique aide à préparer et fiabiliser une livraison. Il ne constitue pas une certification officielle et ne remplace pas la validation métier du programme.

## Sources de référence

- [S1000D Council — site officiel de la spécification](https://s1000d.org/) ;
- [S1000D Users — contenu officiel d’un paquet S1000D](https://users.s1000d.org/ProductDescription.aspx?ProductID=16), qui réunit notamment spécification, schémas, Default BREX et index des Business Rule Decision Points.
