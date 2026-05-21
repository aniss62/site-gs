# Blueprint 03 — Gestion du contenu et i18n

## Objectif
Mettre à jour les textes du site sans toucher au HTML.

## Comment ça marche

Tous les textes visibles du site sont stockés dans deux fichiers JSON :
- `site/assets/i18n/fr.json` — version française
- `site/assets/i18n/en.json` — version anglaise

Le script `site/assets/js/i18n.js` lit ces fichiers et injecte les textes dans les éléments HTML portant l'attribut `data-i18n="cle"`.

## Modifier un texte

1. Ouvrir `site/assets/i18n/fr.json`
2. Trouver la clé correspondante (ex: `"hero.title"`)
3. Modifier la valeur
4. Faire la même modification dans `en.json`
5. Rafraîchir le navigateur

## Ajouter un nouveau texte

1. Dans le HTML, ajouter `data-i18n="ma.nouvelle.cle"` à l'élément
2. Ajouter `"ma.nouvelle.cle": "Mon texte FR"` dans `fr.json`
3. Ajouter `"ma.nouvelle.cle": "My EN text"` dans `en.json`

## Structure des clés

Les clés sont organisées par page et section :
```
nav.*          → Navigation
hero.*         → Section hero de chaque page
home.*         → Page d'accueil
about.*        → Page À propos
products.*     → Pages produits
applications.* → Page Applications
quality.*      → Page Qualité
sustainability.* → Page Durabilité
news.*         → Page News
contact.*      → Page Contact
footer.*       → Pied de page
```
