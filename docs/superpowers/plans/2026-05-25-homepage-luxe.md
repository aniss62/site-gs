# Homepage Luxe — Vidéo + Scrubbing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remplacer le slideshow hero et le scroll-story par une expérience luxueuse — vidéo plein écran en hero, scrubbing frame-par-frame avec textes flottants au scroll.

**Architecture:** La vidéo `0524.mp4` est copiée dans `site/assets/video/`. Le hero utilise un `<video autoplay muted loop>`. La section scrub-zone (400vh, sticky) pilote `video.currentTime` via l'événement scroll pour révéler la vidéo image par image avec 3 panneaux de texte. Tout est dans `index.html` + `style.css`.

**Tech Stack:** HTML5 video, CSS sticky positioning, vanilla JS scroll events. Serveur de test : `php -S localhost:8080` depuis `site/`.

---

## Fichiers touchés

| Fichier | Action |
|---|---|
| `site/assets/video/0524.mp4` | Créer (copie depuis Downloads) |
| `site/index.html` lignes 29–40 | Modifier — remplacer slideshow hero par `<video>` |
| `site/index.html` lignes 83–153 | Modifier — remplacer scroll-story par scrub-zone |
| `site/index.html` lignes 388–422 | Modifier — remplacer JS scroll-story + slideshow par JS scrub |
| `site/assets/css/style.css` | Modifier — ajouter styles scrub-zone, supprimer scroll-story |
| `.gitignore` | Modifier — ignorer `site/assets/video/` |

---

## Task 1 : Copier la vidéo et mettre à jour .gitignore

**Files:**
- Create: `site/assets/video/0524.mp4`
- Modify: `.gitignore`

- [ ] **Step 1 : Créer le répertoire et copier la vidéo**

```bash
mkdir -p "site/assets/video"
cp ~/Downloads/0524.mp4 site/assets/video/0524.mp4
ls -lh site/assets/video/0524.mp4
```

Résultat attendu : `11M  site/assets/video/0524.mp4`

- [ ] **Step 2 : Ignorer la vidéo dans git**

Ouvrir `.gitignore` et ajouter à la fin :

```
# Vidéo — trop lourde pour git, à copier manuellement sur le serveur
site/assets/video/
```

- [ ] **Step 3 : Vérifier que git ignore le fichier**

```bash
git status
```

Résultat attendu : `site/assets/video/0524.mp4` n'apparaît PAS dans "Untracked files".

- [ ] **Step 4 : Commit**

```bash
git add .gitignore
git commit -m "chore: ignorer assets/video dans git"
```

---

## Task 2 : Remplacer le slideshow hero par une vidéo

**Files:**
- Modify: `site/index.html` lignes 29–40

- [ ] **Step 1 : Ouvrir le serveur de test**

```bash
cd site && php -S localhost:8080
```

Garder ce terminal ouvert. Ouvrir `http://localhost:8080` dans le navigateur.

- [ ] **Step 2 : Remplacer le bloc `.hero__bg` dans index.html**

Localiser (lignes 29–40) :
```html
  <div class="hero__bg">
    <div class="slideshow" id="heroSlideshow">
      <!-- 1. Nature méditerranéenne -->
      <div class="slide active" style="background-image:url('https://images.unsplash.com/photo-1499638673689-79a0b5115d87?w=1920&q=90&auto=format');background-position:center 45%"></div>
      <!-- 2. Grains de caroube -->
      <div class="slide" style="background-image:url('https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=1920&q=90&auto=format');background-position:center center"></div>
      <!-- 3. Panoramique agricole marocaine -->
      <div class="slide" style="background-image:url('https://images.unsplash.com/photo-1549880338-65ddcdfd017b?w=1920&q=90&auto=format');background-position:center 35%"></div>
      <!-- 4. Arbre de caroube -->
      <div class="slide" style="background-image:url('assets/images/caroube-arbre.jpg');background-position:center 30%"></div>
    </div>
  </div>
```

Remplacer par :
```html
  <div class="hero__bg">
    <video class="hero__video" autoplay muted loop playsinline
      src="assets/video/0524.mp4"
      poster="assets/images/caroube-arbre.jpg">
    </video>
  </div>
```

- [ ] **Step 3 : Ajouter le CSS de la vidéo hero dans `site/assets/css/style.css`**

Ajouter à la fin du fichier :

```css
/* ── Hero vidéo ──────────────────────────────────────────────── */
.hero__video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
}
```

- [ ] **Step 4 : Vérifier dans le navigateur**

Recharger `http://localhost:8080`.
- La vidéo doit couvrir tout le hero sans bord blanc
- Le titre, sous-titre et boutons doivent être lisibles par-dessus
- Si la vidéo ne se charge pas, vérifier que `site/assets/video/0524.mp4` existe

- [ ] **Step 5 : Commit**

```bash
git add site/index.html site/assets/css/style.css
git commit -m "feat: remplacer slideshow hero par vidéo 0524.mp4"
```

---

## Task 3 : Remplacer le scroll-story par la scrub-zone (HTML)

**Files:**
- Modify: `site/index.html` lignes 83–153

- [ ] **Step 1 : Remplacer le bloc `<!-- SCROLL STORY -->` entier**

Localiser (lignes 83–153) le bloc entier de `<div class="scroll-story"...>` jusqu'à `</div>` (avant `<!-- PRODUCTS -->`).

Remplacer par :

```html
<!-- SCRUB ZONE -->
<div class="scrub-zone" id="scrubZone">
  <div class="scrub-sticky">
    <video id="scrubVid" muted playsinline preload="auto"
      src="assets/video/0524.mp4"
      poster="assets/images/caroube-arbre.jpg">
    </video>
    <div class="scrub-overlay"></div>

    <!-- Panneaux texte -->
    <div class="scrub-panel active" id="scPanel0">
      <div class="scrub-panel__num">
        <span class="fr-text">01 — Terroir d'exception</span>
        <span class="en-text" hidden>01 — Exceptional terroir</span>
      </div>
      <h2>
        <span class="fr-text">Une terre<br><em>d'exception</em></span>
        <span class="en-text" hidden>A land<br><em>of exception</em></span>
      </h2>
      <p>
        <span class="fr-text">La région du Saïss abrite des caroubiers centenaires sur un terroir unique. Les gousses sont récoltées à la main selon des méthodes ancestrales, transmises de génération en génération depuis les collines de Fès.</span>
        <span class="en-text" hidden>The Saïss region shelters century-old carob trees on a unique terroir. Pods are harvested by hand using ancestral methods, passed down from generation to generation in the hills of Fès.</span>
      </p>
      <div class="scrub-panel__foot">
        <div class="scrub-panel__line"></div>
        <span>Saïss · Fès · <span class="fr-text">Maroc</span><span class="en-text" hidden>Morocco</span></span>
      </div>
    </div>

    <div class="scrub-panel" id="scPanel1">
      <div class="scrub-panel__num">
        <span class="fr-text">02 — Savoir-faire</span>
        <span class="en-text" hidden>02 — Expertise</span>
      </div>
      <h2>
        <span class="fr-text">La qualité<br><em>à chaque</em><br>geste</span>
        <span class="en-text" hidden>Quality<br><em>at every</em><br>step</span>
      </h2>
      <p>
        <span class="fr-text">Chaque gousse est triée à la main. Caroube brute, graines, pulpe, farine — notre gamme répond aux exigences de l'industrie mondiale de l'alimentation, de la pharmacie et de la cosmétique, avec traçabilité totale.</span>
        <span class="en-text" hidden>Every pod is sorted by hand. Raw carob, seeds, pulp, flour — our range meets the demands of the global food, pharmaceutical and cosmetics industry, with full traceability.</span>
      </p>
      <div class="scrub-panel__foot">
        <div class="scrub-panel__line"></div>
        <span>4 <span class="fr-text">gammes · Qualité certifiée</span><span class="en-text" hidden>lines · Certified quality</span></span>
      </div>
    </div>

    <div class="scrub-panel" id="scPanel2">
      <div class="scrub-panel__num">
        <span class="fr-text">03 — Export mondial</span>
        <span class="en-text" hidden>03 — Global export</span>
      </div>
      <h2>
        <span class="fr-text">15 pays.<br><em>Un seul</em><br>standard.</span>
        <span class="en-text" hidden>15 countries.<br><em>One</em><br>standard.</span>
      </h2>
      <p>
        <span class="fr-text">Maîtrisant l'ensemble de la chaîne, de la récolte à la logistique internationale, nous exportons vers 15+ pays sur 3 continents. Europe, Asie, Moyen-Orient, Amériques — le caroube du Saïss s'invite partout.</span>
        <span class="en-text" hidden>Controlling the entire chain from harvest to international logistics, we export to 15+ countries on 3 continents. Europe, Asia, Middle East, Americas — Saïss carob is everywhere.</span>
      </p>
      <div class="scrub-panel__foot">
        <div class="scrub-panel__line"></div>
        <span>15+ <span class="fr-text">pays · 500+ tonnes / an</span><span class="en-text" hidden>countries · 500+ tonnes / year</span></span>
      </div>
    </div>

    <!-- Dots de progression -->
    <div class="scrub-progress">
      <div class="scrub-dot active" id="scDot0"></div>
      <div class="scrub-dot" id="scDot1"></div>
      <div class="scrub-dot" id="scDot2"></div>
    </div>
  </div>
</div>
```

- [ ] **Step 2 : Vérifier dans le navigateur**

Recharger `http://localhost:8080`.
- La section sous le hero ne doit pas afficher le vieux slideshow
- Scroller vers le bas : la scrub-zone doit être visible (même sans CSS/JS finalisés)
- La section `#produits` doit toujours être présente plus bas

- [ ] **Step 3 : Commit**

```bash
git add site/index.html
git commit -m "feat: remplacer scroll-story par scrub-zone (HTML)"
```

---

## Task 4 : CSS de la scrub-zone

**Files:**
- Modify: `site/assets/css/style.css`

- [ ] **Step 1 : Ajouter les styles en fin de `style.css`**

```css
/* ── Scrub Zone ──────────────────────────────────────────────── */
.scrub-zone {
  height: 400vh;
  position: relative;
}

.scrub-sticky {
  position: sticky;
  top: 0;
  height: 100vh;
  overflow: hidden;
}

.scrub-sticky video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
}

.scrub-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to right,
    rgba(0,0,0,.75) 0%,
    rgba(0,0,0,.45) 55%,
    rgba(0,0,0,.1)  100%
  );
  pointer-events: none;
}

/* Panneaux texte */
.scrub-panel {
  position: absolute;
  left: 8vw;
  bottom: 10vh;
  max-width: 520px;
  opacity: 0;
  transform: translateX(-28px);
  transition: opacity .65s cubic-bezier(.16,1,.3,1),
              transform .65s cubic-bezier(.16,1,.3,1);
  pointer-events: none;
}

.scrub-panel.active {
  opacity: 1;
  transform: translateX(0);
  pointer-events: auto;
}

.scrub-panel__num {
  font-size: .68rem;
  text-transform: uppercase;
  letter-spacing: .18em;
  color: #E8B84B;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: .8rem;
}

.scrub-panel__num::after {
  content: '';
  display: block;
  width: 40px;
  height: 1px;
  background: #E8B84B66;
}

.scrub-panel h2 {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: clamp(2.2rem, 4.5vw, 3.8rem);
  font-weight: 400;
  line-height: 1.1;
  color: #fff;
  margin: 0 0 1.2rem;
}

.scrub-panel h2 em {
  font-style: italic;
  color: #f0e8d0;
}

.scrub-panel p {
  font-size: clamp(.88rem, 1.2vw, 1rem);
  color: #c8c4b8;
  line-height: 1.75;
  font-family: 'Inter', sans-serif;
  font-weight: 300;
  max-width: 440px;
  margin: 0 0 1.5rem;
}

.scrub-panel__foot {
  display: flex;
  align-items: center;
  gap: .8rem;
  font-size: .65rem;
  text-transform: uppercase;
  letter-spacing: .14em;
  color: #6a6455;
}

.scrub-panel__line {
  width: 30px;
  height: 1px;
  background: #6a6455;
  flex-shrink: 0;
}

/* Dots de progression */
.scrub-progress {
  position: absolute;
  right: 2.5rem;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: .8rem;
}

.scrub-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: rgba(255,255,255,.25);
  transition: background .4s, transform .4s;
}

.scrub-dot.active {
  background: #E8B84B;
  transform: scale(1.5);
}

/* ── Supprimer anciens styles scroll-story (si présents) ─────── */
.scroll-story,
.scroll-story__sticky,
.story-visual,
.story-right,
.story-panel,
.story-thumb,
.story-progress,
.story-dot {
  display: none !important;
}
```

- [ ] **Step 2 : Vérifier dans le navigateur**

Recharger `http://localhost:8080` et scroller lentement.
- La scrub-zone doit avoir 400vh de hauteur (scroll long avant d'atteindre produits)
- La vidéo remplit tout l'écran dans la zone sticky
- Le panneau 0 est visible à gauche (texte "01 — Terroir d'exception")
- Les dots sont visibles à droite
- Aucune trace de l'ancien scroll-story

- [ ] **Step 3 : Commit**

```bash
git add site/assets/css/style.css
git commit -m "feat: CSS scrub-zone — sticky video, panneaux, dots"
```

---

## Task 5 : JavaScript — pilotage scroll → video.currentTime

**Files:**
- Modify: `site/index.html` lignes 388–422 (bloc `/* SCROLL STORY */` et `/* SLIDESHOWS */`)

- [ ] **Step 1 : Localiser et remplacer le JS dans index.html**

Trouver le bloc (lignes 388–422) :
```js
/* SCROLL STORY */
var story = document.getElementById('scrollStory');
// ... tout jusqu'à ...
startSlideshow('#slideshow .slide', 5000);
```

Remplacer par :

```js
/* SCRUB ZONE — scroll pilote video.currentTime */
(function() {
  var zone    = document.getElementById('scrubZone');
  var vid     = document.getElementById('scrubVid');
  var panels  = [0,1,2].map(function(i){ return document.getElementById('scPanel'+i); });
  var dots    = [0,1,2].map(function(i){ return document.getElementById('scDot'+i); });
  var curIdx  = 0;

  function setPanel(idx) {
    if (idx === curIdx) return;
    curIdx = idx;
    panels.forEach(function(p, i) { p.classList.toggle('active', i === idx); });
    dots.forEach(function(d, i)   { d.classList.toggle('active', i === idx); });
  }

  window.addEventListener('scroll', function() {
    if (!zone || !vid.duration) return;
    var rect     = zone.getBoundingClientRect();
    var scrolled = -rect.top;
    var total    = zone.offsetHeight - window.innerHeight;
    if (scrolled < 0 || scrolled > total) return;

    var progress   = scrolled / total;
    vid.currentTime = progress * vid.duration;

    var panelIdx = progress < 0.33 ? 0 : progress < 0.66 ? 1 : 2;
    setPanel(panelIdx);
  }, { passive: true });

  /* Lancer la lecture puis mettre en pause pour que currentTime soit pilotable */
  vid.addEventListener('loadedmetadata', function() {
    vid.play().then(function() { vid.pause(); }).catch(function(){});
  });
})();
```

- [ ] **Step 2 : Vérifier dans le navigateur**

Recharger `http://localhost:8080`. Scroller dans la scrub-zone :
- La vidéo avance frame par frame au scroll (pas de lecture automatique)
- À 0–33% de la zone : panneau "01 — Terroir" visible, dot 0 actif
- À 33–66% : panneau "02 — Savoir-faire" apparaît, dot 1 actif
- À 66–100% : panneau "03 — Export mondial" apparaît, dot 2 actif
- Si la vidéo ne scrube pas : ouvrir la console navigateur et vérifier qu'il n'y a pas d'erreur

- [ ] **Step 3 : Commit**

```bash
git add site/index.html
git commit -m "feat: JS scrubbing — scroll pilote video.currentTime + panneaux"
```

---

## Task 6 : Finitions et vérifications finales

**Files:**
- Modify: `site/index.html` (si ajustements nécessaires)
- Modify: `site/assets/css/style.css` (si ajustements nécessaires)

- [ ] **Step 1 : Vérifier le bilingue**

Dans le navigateur, cliquer sur le sélecteur de langue EN.
- Tous les textes des panneaux doivent basculer en anglais
- Revenir en FR : les textes repassent en français

- [ ] **Step 2 : Vérifier les sections en-dessous**

Scroller jusqu'à la fin de la scrub-zone et vérifier que :
- `#apropos` (stats bar) s'affiche correctement
- `#produits` (cartes produits) s'affiche correctement
- `#carte` (carte SVG du monde) s'affiche correctement
- Footer s'affiche correctement

- [ ] **Step 3 : Vérifier mobile (simulateur Chrome DevTools)**

Dans Chrome, ouvrir DevTools → Toggle device toolbar → iPhone 14.
- La vidéo hero s'affiche correctement (object-fit:cover)
- La scrub-zone fonctionne au touch-scroll
- Les textes des panneaux ne débordent pas

- [ ] **Step 4 : Vérifier prefers-reduced-motion**

La ligne existante en bas de index.html :
```js
if (window.matchMedia('(prefers-reduced-motion:reduce)').matches)
  document.querySelectorAll('[data-reveal]').forEach(...)
```
Ne touche pas aux nouvelles classes. Aucun changement requis.

- [ ] **Step 5 : Commit final**

```bash
git add -p   # vérifier chaque modification avant de stager
git commit -m "feat: page d'accueil luxe — vidéo hero + scrubbing vue éclatée"
```

---

## Checklist de succès (depuis la spec)

- [ ] La vidéo se lance automatiquement dans le hero sans bord blanc
- [ ] Le scroll dans la scrub-zone fait avancer la vidéo de façon fluide
- [ ] Les 3 panneaux apparaissent aux bons moments (33%/66%/100%)
- [ ] Les deux langues (FR/EN) fonctionnent
- [ ] Mobile : vidéo charge, scrubbing fonctionne au touch
- [ ] Stats, produits, carte du monde — non affectés
