# Icônes Lucide utilisées

Sprite local généré par `npm run build:icons` à partir de `lucide-static` (aucun CDN, aucune icône non utilisée). Régénérer après toute modification de la liste `ICONS` dans `scripts/build-icons.js`.

| Icône | Fichier / usage | Page(s) | Rôle | Accessibilité |
|---|---|---|---|---|
| `download` | `#download` | Prestations (`services.html`) | Bouton de téléchargement du PDF de présentation | Décorative : `aria-hidden="true"`, le libellé du bouton porte le texte |
| `search` | `#search` | Blog (`blog.html`) | Marque le champ de recherche | Décorative : `aria-hidden="true"`, le `<label>` du champ porte le texte |
| `sliders-horizontal` | `#sliders-horizontal` | Blog (`blog.html`), Démonstrations (`demonstrations.html`) | Marque les zones de filtre | Décorative : `aria-hidden="true"`, un texte visible (« Filtres », « Type de traitement ») accompagne toujours l'icône |
| `shield-check` | `#shield-check` | Validateur (`validateur.html`), Contact (`contact.html`) | Renforce visuellement les mentions de confidentialité | Décorative : `aria-hidden="true"`, le texte de confidentialité porte l'information |

## Règles appliquées

- Une seule bibliothèque (Lucide), un seul sprite local (`lucide-sprite.svg`), aucun CDN.
- `currentColor` partout : la couleur suit le texte adjacent, pas de couleur d'icône indépendante.
- Épaisseur de trait native (2px) conservée à l'identique pour toutes les icônes du site.
- Taille d'usage : 18–20px, alignée avec le texte adjacent (jamais seule sans libellé visible).
- Toutes les icônes du site sont décoratives (`aria-hidden="true"`) : aucune n'est le seul porteur d'information, un libellé visible existe systématiquement à côté.
- Budget volontairement réduit à 4 icônes distinctes, 6 usages au total sur l'ensemble du site — pas d'icône automatique devant les titres, CTA ou lignes de tableau.
