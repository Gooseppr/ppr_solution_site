-- Activer les contraintes sur chaque connexion SQLite.
PRAGMA foreign_keys = ON;

SELECT v.id AS vehicule, v.categorie,
       COUNT(i.emplacement) AS nombre_moteurs,
       GROUP_CONCAT(DISTINCT m.modele) AS modeles
FROM vehicules AS v
LEFT JOIN installations_moteur AS i ON i.vehicule_id = v.id
LEFT JOIN modeles_moteur AS m ON m.id = i.moteur_id
GROUP BY v.id, v.categorie
ORDER BY nombre_moteurs DESC, v.id;