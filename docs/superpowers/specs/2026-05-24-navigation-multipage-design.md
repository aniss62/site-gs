# Restructuration navigation multi-pages — Les Greniers du Saïss

**Date :** 2026-05-24  
**Statut :** Approuvé  

---

## Objectif

Transformer le site d'une navigation par ancres (#section) en un vrai site multi-pages avec un menu professionnel, des sous-menus et chaque rubrique sur sa propre page indépendante.

---

## Décisions de design

- **Menu :** méga-menu desktop + accordion mobile (5 entrées)
- **Accueil :** page riche avec sections teaser qui renvoient vers les pages dédiées (v12 conservé et raccourci)
- **Qualité / Durabilité :** fusionnées dans `about.html`, pas de pages séparées dans le menu

---

## Structure du menu

```
Logo | Accueil | Nos Produits ▾ | À propos | Actualités | Contact | FR/EN
```

**Méga-panneau "Nos Produits" (desktop) :**
```
┌─────────────────────────────────┐
│  🌿 Caroube    │  🌾 Légumineuses │
│  Caroube brute │  → Voir la gamme │
│  Graines       │  (lentilles,     │
│  Pulpe         │  pois chiches,   │
│  Farine        │  fèves…)         │
└─────────────────────────────────┘
```

**Mobile :** hamburger ☰ → drawer latéral → "Nos Produits" s'ouvre en accordion.

---

## Plan du site — pages

| URL | Fichier | Statut | Notes |
|-----|---------|--------|-------|
| `/` | `index.html` | Modifier | Raccourcir sections, ajouter liens "→ voir tout" |
| `/products/caroube-brute.html` | idem | Harmoniser style | Déjà existant |
| `/products/graines-caroube.html` | idem | Harmoniser style | Déjà existant |
| `/products/pulpe-caroube.html` | idem | Harmoniser style | Déjà existant |
| `/products/farine-caroube.html` | idem | Harmoniser style | Déjà existant |
| `/products/legumineuses.html` | idem | Harmoniser style | Déjà existant |
| `/about.html` | idem | Enrichir | Intégrer qualite.html + durabilite.html |
| `/news.html` | idem | Harmoniser style | Déjà existant |
| `/contact.html` | idem | Harmoniser style | Déjà existant |
| `qualite.html` | idem | Supprimer du menu | Contenu migré dans about.html |
| `durabilite.html` | idem | Supprimer du menu | Contenu migré dans about.html |
| `applications.html` | idem | Supprimer du menu | Contenu migré dans about.html ou footer |

---

## Architecture technique

### Fichiers à créer

**`site/assets/css/style.css`**  
CSS unique partagé par toutes les pages. Extrait intégralement du bloc `<style>` de `index.html` v12. Ne pas toucher au contenu — uniquement déplacer.

**`site/assets/js/nav.js`**  
Gère :
- Injection du HTML du méga-menu dans `<div id="main-nav"></div>` sur chaque page
- Comportement méga-menu (ouverture au survol desktop, fermeture au clic extérieur)
- Hamburger mobile + accordion pour "Nos Produits"
- Bascule FR/EN (reprend la logique `.fr-text`/`.en-text` de index.html)
- Marquage de l'entrée active selon l'URL courante

**`site/assets/js/footer.js`**  
Injection du HTML du footer dans `<div id="main-footer"></div>` sur chaque page. Footer identique partout.

### Modifications de index.html

1. Remplacer le bloc `<style>…</style>` inline par `<link rel="stylesheet" href="assets/css/style.css">`
2. Remplacer le bloc `<script>…</script>` inline (hors logique métier) par les imports vers nav.js et footer.js
3. Garder inline uniquement : slideshow, reveal animations, logique spécifique à la page
4. Raccourcir les sections : produits (4 cartes → garder), légumineuses (bloc → garder), carte (garder), actualités (3 articles max → garder), contact (remplacer le formulaire par un CTA "→ Nous contacter")
5. Ajouter des liens "→ Voir tout" sur chaque section teaser

### Modifications des pages produits

Chaque page `products/*.html` :
1. Remplacer `<link>` vers main.css/layout.css/components.css par `<link>` vers style.css
2. Remplacer le header/breadcrumb existant par `<div id="main-nav"></div>` + import nav.js
3. Remplacer le footer existant par `<div id="main-footer"></div>` + import footer.js
4. Garder le contenu spécifique produit intact — ne pas modifier le fond

### Modifications about.html

1. Même en-tête/footer partagé
2. Ajouter sections "Qualité & certifications" (contenu de qualite.html) et "Durabilité" (contenu de durabilite.html)

### news.html et contact.html

Même traitement : header/footer partagés, contenu spécifique intact.

---

## Contraintes importantes

- **FR/EN :** index.html utilise `.fr-text`/`.en-text` (spans cachés). Les autres pages utilisent `data-i18n` + i18n.js. On uniformise sur le mécanisme `.fr-text`/`.en-text` dans nav.js et footer.js — les pages produits existantes gardent leur propre mécanisme, on ne le casse pas.
- **Chemins relatifs :** les pages produits sont dans `products/`, donc les chemins CSS/JS sont `../assets/css/style.css` etc. À vérifier sur chaque page.
- **PHPMailer (contact.php) :** ne pas toucher à la logique PHP.
- **fetch-news.php :** ne pas toucher.
- **Ordre des modifications :** index.html en dernier, après avoir validé que le nav partagé fonctionne sur une page produit.

---

## Ordre d'implémentation recommandé (prudent)

1. Créer `style.css` en copiant le CSS de index.html → tester sur une page produit
2. Créer `nav.js` avec le HTML du méga-menu → tester sur `caroube-brute.html`
3. Créer `footer.js` → tester sur `caroube-brute.html`
4. Valider visuellement `caroube-brute.html` avant de continuer
5. Appliquer aux 4 autres pages produits
6. Appliquer à about.html, news.html, contact.html
7. Modifier index.html en dernier (le plus risqué)
8. Commit final

---

## Critères de succès

- [ ] Méga-menu visible et fonctionnel sur desktop (survol "Nos Produits")
- [ ] Menu hamburger fonctionnel sur mobile (< 768px)
- [ ] Bascule FR/EN fonctionnelle sur toutes les pages
- [ ] Tous les liens du méga-menu renvoient vers la bonne page
- [ ] Entrée active surlignée selon la page courante
- [ ] Formulaire contact toujours fonctionnel (PHPMailer)
- [ ] Aucune régression visuelle sur index.html
- [ ] Chemins images/CSS corrects sur les pages `products/`
