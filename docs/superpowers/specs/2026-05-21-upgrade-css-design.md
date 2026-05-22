# Spec — Upgrade CSS Design · Les Greniers du Saïss

**Date :** 2026-05-21  
**Approche :** CSS-first (Approche 1) — aucune modification structurelle du HTML  
**Périmètre :** Site complet (12 pages partagent les mêmes feuilles de style)  
**Direction :** Classique Élevé — palette bleu #2B4BA0 / or #E8B84B conservée, patterns génériques corrigés  
**Animation :** Niveau B — spring physics, cascade décalée, compteurs animés  

---

## 1. Fichiers impactés

### Fichiers CSS modifiés
| Fichier | Nature des changements |
|---------|----------------------|
| `site/assets/css/main.css` | Tokens, typographie, boutons, badges, utilitaires |
| `site/assets/css/layout.css` | Grilles, hero, stats-bar, sections alternées |
| `site/assets/css/components.css` | Navbar, cartes, CTA, footer |

### Nouveau fichier
| Fichier | Rôle |
|---------|------|
| `site/assets/css/animations.css` | Reveal au scroll, compteurs, spring physics |

### Fichier JS modifié
| Fichier | Nature des changements |
|---------|----------------------|
| `site/assets/js/main.js` | IntersectionObserver pour reveal + compteurs |

---

## 2. Design tokens (main.css)

### Typographie
- Labels (`section-label`) : passer de Inter à **Outfit 600**, `letter-spacing: .18em`
- Titres (`h1`, `h2`, `h3`) : ajouter `letter-spacing: -.02em` et `line-height: 1.05`
- Corps : Inter 400, `line-height: 1.7` (au lieu de 1.65)
- Ajouter import Google Fonts Outfit : `family=Outfit:wght@500;600;700`

### Couleurs — surfaces raffinées
```css
--color-bg:        #f4f1eb;   /* crème chaud, était #F7F7F7 */
--color-page:      #fffdf9;   /* blanc chaud, était #FFFFFF */
--color-text:      #0f1628;   /* quasi-noir teinté bleu, était #1C1C2E */
--color-text-muted:#4a4a62;   /* était #5a5a72 */
--color-border:    #e8e4dc;   /* était #e0e0ec */
```
Bleu `#2B4BA0` et or `#E8B84B` inchangés.

### Shadows teintées bleu
```css
--shadow-sm: 0 1px 3px rgba(43,75,160,.06);
--shadow-md: 0 4px 16px rgba(43,75,160,.10);
--shadow-lg: 0 8px 28px rgba(43,75,160,.14);
```

### Texture de fond (sections alternées)
Pseudo-élément `::before` avec SVG `feTurbulence`, `opacity: .04`, `pointer-events: none` sur `.section--bg`.

---

## 3. Navigation (components.css)

- `backdrop-filter: blur(14px)` + `-webkit-backdrop-filter`
- `background: rgba(30,53,120,.88)` au lieu de `#2B4BA0` uni
- `border-bottom: 1px solid rgba(255,255,255,.1)`
- `box-shadow: 0 4px 20px rgba(10,20,60,.18), inset 0 1px 0 rgba(255,255,255,.08)`
- Sélecteur de langue : remplacer le texte simple par une pill `background: rgba(255,255,255,.1)`, `border: 1px solid rgba(255,255,255,.18)`, `border-radius: 20px`
- Liens nav : `transition: color .2s` → `color: #E8B84B` au hover
- Labels nav : passer en Outfit 500

---

## 4. Boutons (main.css)

### Hiérarchie complète (3 niveaux)
**Primaire (gold) :**
```css
font-family: var(--font-labels);  /* Outfit */
border-radius: 6px;               /* était 8px — moins générique */
box-shadow: 0 4px 14px rgba(232,184,75,.3);
transition: background .22s, transform .3s cubic-bezier(.34,1.56,.64,1), box-shadow .22s;
```
Hover : `transform: translateY(-3px) scale(1.03)` + shadow renforcée  
Active : `transform: translateY(-1px) scale(.98)`

**Secondaire (outline) :**
```css
border: 1.5px solid rgba(43,75,160,.35);
transition: background .22s, border-color .22s, transform .3s cubic-bezier(.34,1.56,.64,1);
```
Hover : `background: rgba(43,75,160,.06)` + `border-color: #2B4BA0` + `translateY(-2px)`

**Tertiaire (texte) :**
Nouveau — `border-bottom: 1.5px solid transparent`, hover → `border-bottom-color: currentColor` + `gap` élargi.

---

## 5. Cartes feature (components.css)

```css
background: linear-gradient(145deg, #fff, #fdfcf8);
border: 1px solid rgba(43,75,160,.08);
box-shadow: var(--shadow-md);
transition: box-shadow .3s, transform .3s cubic-bezier(.34,1.56,.64,1), border-color .3s;
```
Hover :
```css
box-shadow: 0 10px 28px rgba(43,75,160,.15);
transform: translateY(-5px);
border-color: rgba(43,75,160,.2);
```
Icône (`.feature-card__icon`) :
```css
border: 1px solid rgba(43,75,160,.1);
transition: background .3s, transform .3s cubic-bezier(.34,1.56,.64,1);
```
`.feature-card:hover .feature-card__icon` : `transform: scale(1.12) rotate(-5deg)` + `background` renforcé.

---

## 6. Badges (main.css)

Remplacer `border-radius: 99px` (pills) par `border-radius: 5px` (carrés).  
Ajouter border teinté sur chaque variante :

```css
.badge--gold { background: rgba(232,184,75,.12); color: #b8882a; border: 1px solid rgba(232,184,75,.3); }
.badge--blue { background: rgba(43,75,160,.07);  color: #2B4BA0;  border: 1px solid rgba(43,75,160,.2);  }
.badge--green{ background: rgba(45,122,58,.07);  color: #2d7a3a;  border: 1px solid rgba(45,122,58,.2);  }
```

---

## 7. Hero (layout.css)

- Contenu : passer de `align-items: center; justify-content: center; text-align: center` à alignement **bas-gauche** (`align-items: flex-end; padding-bottom: 3rem`)
- Fond : ajouter pseudo-élément `::after` avec grain SVG `opacity: .05`
- Overlay : affiner — `background: linear-gradient(to top, rgba(10,15,40,.72) 0%, rgba(10,15,40,.3) 60%, transparent 100%)`

---

## 8. Stats bar (layout.css)

- Background : `#fff` avec `border-bottom: 1px solid #e8e4dc`
- Chiffres : Playfair Display 700 — les éléments `.stat-item__number` reçoivent `data-counter` et `data-suffix` (déjà présents en HTML, confirmer)
- Animation compteurs : déclenchée par IntersectionObserver dans `main.js`

---

## 9. Animations (animations.css + main.js)

### Fichier animations.css
```css
[data-reveal] {
  opacity: 0;
  transform: translateY(22px);
  transition: opacity .55s cubic-bezier(.22,1,.36,1),
              transform .55s cubic-bezier(.22,1,.36,1);
}
[data-reveal].is-visible { opacity: 1; transform: none; }

/* Stagger via CSS sibling delay */
[data-reveal]:nth-child(2) { transition-delay: .1s; }
[data-reveal]:nth-child(3) { transition-delay: .2s; }
[data-reveal]:nth-child(4) { transition-delay: .3s; }

/* Grain texture helper */
.grain::before {
  content: '';
  position: absolute; inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  opacity: .04;
  pointer-events: none;
}
```

### main.js — IntersectionObserver
```js
// Reveal au scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('is-visible'); observer.unobserve(e.target); }
  });
}, { threshold: 0.15 });
document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));

// Compteurs
function animateCounter(el, target, suffix, duration = 1200) {
  const start = performance.now();
  const step = now => {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(eased * target) + suffix;
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      animateCounter(e.target, +e.target.dataset.counter, e.target.dataset.suffix || '');
      counterObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.5 });
document.querySelectorAll('[data-counter]').forEach(el => counterObserver.observe(el));
```

---

## 10. Chargement des fonts

Ajouter dans `<head>` de chaque page (ou via `main.css @import`) :
```
Outfit:wght@500;600;700
```
Ajouter `font-display: swap` et `rel="preload"` sur la font principale.

---

## 11. Hors périmètre (Approche 1)

- Restructuration HTML des sections (grille brisée, bento asymétrique) → Approche 2 future
- Dark mode
- Nouveaux contenus ou pages
- Modification des fichiers i18n JSON
- Modification de contact.php ou fetch-news.php

---

## 12. Critères de succès

- [ ] Toutes les 12 pages s'affichent sans régression sur `php -S localhost:8080`
- [ ] Animations respectent `prefers-reduced-motion` (ajouter media query dans animations.css)
- [ ] Contraste WCAG 2.1 AA maintenu sur tous les textes
- [ ] Aucun `box-shadow: ... rgba(0,0,0,...)` restant dans les CSS
- [ ] Labels section en Outfit, titres en Playfair avec tracking négatif
- [ ] Badges carrés (border-radius: 5px) sur toutes les pages
- [ ] Compteurs stats-bar déclenchés une seule fois au scroll
