# Refonte page d'accueil — Expérience luxe avec vidéo et scrubbing

**Date :** 2026-05-25  
**Périmètre :** `site/index.html` uniquement  
**Approche choisie :** Option C (vidéo plein écran + textes superposés) + vue éclatée frame-par-frame (Option A)

---

## 1. Objectif

Transformer le hero et la section scroll-story de la page d'accueil en une expérience visuelle luxueuse :
- Remplacer le slideshow existant par la vidéo `0524.mp4`
- Remplacer le scroll-story par une zone de scrubbing vidéo avec textes flottants
- Conserver intactes toutes les autres sections (stats, produits, carte, footer)

---

## 2. Structure de la page après refonte

```
[Hero]            Vidéo plein écran autoplay + titre + CTA
[Vue éclatée]     Zone sticky ~400vh — scroll → video.currentTime + 3 textes
[Stats bar]       Conservée
[Produits]        Conservé
[Carte du monde]  Conservée
[Footer]          Conservé
```

---

## 3. Section Hero

**Contenu :**
- `<video autoplay muted loop playsinline>` remplace le slideshow `#heroSlideshow`
- Source : `assets/video/0524.mp4` (copié depuis Downloads)
- `object-fit: cover` sur 100vw × 100vh
- Gradient sombre en superposition (left-to-right + bottom) pour lisibilité du texte
- Grain CSS subtil conservé

**Texte conservé :**
- Eyebrow : "Maroc · Fondée en 2008"
- Titre : "Du cœur du Maroc, vers le monde"
- Sous-titre + boutons CTA existants

**Animation entrée :** fade + translateY sur `.hero__content` au chargement (déjà en place, conserver).

---

## 4. Section Vue éclatée (remplace scroll-story)

### 4a. Structure HTML

```html
<div class="scrub-zone" id="scrubZone">        <!-- hauteur: 400vh -->
  <div class="scrub-sticky">                    <!-- position: sticky; top: 0; height: 100vh -->
    <video id="scrubVid" muted playsinline preload="auto" src="assets/video/0524.mp4"></video>
    <div class="scrub-overlay"></div>           <!-- gradient sombre -->
    <div class="scrub-texts">
      <div class="scrub-panel" id="sp0">...</div>   <!-- 0–33% scroll -->
      <div class="scrub-panel" id="sp1">...</div>   <!-- 33–66% scroll -->
      <div class="scrub-panel" id="sp2">...</div>   <!-- 66–100% scroll -->
    </div>
    <div class="scrub-progress">                <!-- barre latérale -->
      <div class="sp-dot active"></div>
      <div class="sp-dot"></div>
      <div class="sp-dot"></div>
    </div>
    <div class="scrub-bar"></div>               <!-- barre de progression bas de page -->
  </div>
</div>
```

### 4b. Contenu des 3 panneaux

| Panel | Progression scroll | Numéro | Titre FR | Titre EN |
|---|---|---|---|---|
| sp0 | 0–33% | 01 — Terroir d'exception | Une terre d'exception | A land of exception |
| sp1 | 33–66% | 02 — Savoir-faire | La qualité à chaque geste | Quality at every step |
| sp2 | 66–100% | 03 — Export mondial | 15 pays. Un seul standard. | 15 countries. One standard. |

### 4c. Logique JavaScript

```js
// Scrubbing : piloter video.currentTime via scroll
window.addEventListener('scroll', () => {
  const zone = document.getElementById('scrubZone');
  const rect = zone.getBoundingClientRect();
  const progress = Math.max(0, Math.min(1,
    -rect.top / (zone.offsetHeight - window.innerHeight)
  ));
  scrubVid.currentTime = progress * scrubVid.duration;

  // Afficher le panel actif
  const idx = progress < 0.33 ? 0 : progress < 0.66 ? 1 : 2;
  panels.forEach((p, i) => p.classList.toggle('active', i === idx));

  // Dots de progression
  dots.forEach((d, i) => d.classList.toggle('active', i === idx));
}, { passive: true });
```

### 4d. CSS clés

- `.scrub-zone` : `height: 400vh`
- `.scrub-sticky` : `position: sticky; top: 0; height: 100vh; overflow: hidden`
- `video` dans scrub : `position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover`
- `.scrub-panel` : `position: absolute; opacity: 0; transform: translateX(-30px); transition: opacity .7s, transform .7s`
- `.scrub-panel.active` : `opacity: 1; transform: translateX(0)`
- Textes à gauche, max-width 520px, même typographie que le hero

---

## 5. Vidéo — gestion des assets

- Copier `~/Downloads/0524.mp4` → `site/assets/video/0524.mp4`
- Créer le répertoire `site/assets/video/`
- La même source est utilisée par le hero ET la section scrubbing (deux éléments `<video>` distincts)
- Le fichier `0524.mp4` ne doit pas être commité dans git (ajouter `site/assets/video/` à `.gitignore` ou ajouter une note dans le README de déploiement)

---

## 6. Bilingue FR/EN

Tous les textes des panneaux utilisent la convention existante :
```html
<span class="fr-text">Texte français</span>
<span class="en-text" hidden>English text</span>
```

Le sélecteur de langue existant (localStorage + `data-lang`) gère l'affichage automatiquement.

---

## 7. Ce qui N'est PAS modifié

- `#apropos` (stats bar)
- `#produits` (cartes produit)
- `#carte` (carte SVG monde)
- Footer
- nav.js / footer.js
- Toutes les autres pages du site

---

## 8. Critères de succès

- [ ] La vidéo se lance automatiquement et couvre le hero sans bord blanc
- [ ] Le scroll dans la section scrubbing fait avancer la vidéo de façon fluide
- [ ] Les 3 panneaux de texte apparaissent et disparaissent aux bons moments
- [ ] Les deux langues fonctionnent correctement
- [ ] La page s'affiche correctement sur mobile (la vidéo se charge, le scrubbing fonctionne)
- [ ] Les sections en dessous (stats, produits, carte) ne sont pas affectées
