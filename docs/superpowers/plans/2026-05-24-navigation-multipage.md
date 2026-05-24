# Navigation multi-pages — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transformer le site en multi-pages avec un méga-menu partagé (desktop + mobile accordion), un footer partagé, chaque rubrique sur sa propre page.

**Architecture:** Extraire le CSS de `index.html` dans `style.css`. Créer `nav.js` et `footer.js` qui s'auto-injectent via `<div id="main-nav">` et `<div id="main-footer">`. Appliquer page par page — `caroube-brute.html` en pilote, `index.html` en dernier.

**Tech Stack:** HTML5, CSS3, JavaScript vanilla, `localStorage` pour la persistance FR/EN, PHP intouché.

---

## Fichiers créés / modifiés

| Fichier | Action | Rôle |
|---------|--------|------|
| `site/assets/css/style.css` | Créer | CSS extrait du bloc `<style>` de index.html (lignes 14–332) |
| `site/assets/js/nav.js` | Créer | Méga-menu + mobile + FR/EN partagé |
| `site/assets/js/footer.js` | Créer | Footer injecté sur toutes les pages |
| `site/products/caroube-brute.html` | Modifier | Pilote — nav/footer partagés |
| `site/products/graines-caroube.html` | Modifier | Nav/footer partagés |
| `site/products/pulpe-caroube.html` | Modifier | Nav/footer partagés |
| `site/products/farine-caroube.html` | Modifier | Nav/footer partagés |
| `site/products/legumineuses.html` | Modifier | Nav/footer partagés |
| `site/about.html` | Modifier | Nav/footer partagés |
| `site/news.html` | Modifier | Nav/footer partagés |
| `site/contact.html` | Modifier | Nav/footer partagés |
| `site/index.html` | Modifier EN DERNIER | Remplace `<style>` inline + ancienne nav |

---

## Task 1 : Extraire le CSS de index.html → style.css

**Files:**
- Create: `site/assets/css/style.css`
- Modify: `site/index.html`

- [ ] **Step 1 : Démarrer le serveur local**

```bash
cd site && php -S localhost:8080
```

Ouvrir http://localhost:8080 et noter l'aspect visuel actuel (référence).

- [ ] **Step 2 : Copier le CSS dans style.css**

Extraire tout le contenu entre `<style>` et `</style>` de `site/index.html` (lignes 14–332, sans les balises elles-mêmes) et le placer dans `site/assets/css/style.css`.

- [ ] **Step 3 : Ajouter le CSS du méga-menu à la fin de style.css**

Ajouter à la fin de `site/assets/css/style.css` :

```css
/* ── MEGA-MENU & HAMBURGER ─────────────────────────────────── */
.nav__item--mega{position:relative}
.nav__link--btn{background:none;border:none;padding:0;cursor:pointer;display:flex;align-items:center;gap:.3rem;font-family:var(--fl);font-size:.78rem;font-weight:600;color:var(--blue-dark);letter-spacing:.03em;transition:color .2s}
.nav__link--btn:hover{color:var(--blue)}
.nav__link--btn::after{content:'';position:absolute;bottom:-3px;left:0;width:0;height:2px;background:var(--gold);transition:width .25s ease;border-radius:1px}
.nav__link--btn:hover::after{width:100%}
.nav__chevron{font-size:.55rem;transition:transform .2s;display:inline-block}
.nav__item--mega:hover .nav__chevron,.nav__item--mega.is-open .nav__chevron{transform:rotate(180deg)}
.nav__mega{position:absolute;top:calc(100% + 12px);left:50%;transform:translateX(-50%);background:var(--white);border:1px solid var(--border);border-top:3px solid var(--gold);border-radius:0 0 10px 10px;box-shadow:0 8px 32px rgba(11,26,92,.12);padding:1.5rem;display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;min-width:440px;z-index:400}
.mega__col{display:flex;flex-direction:column;gap:.35rem}
.mega__col--right{border-left:1px solid var(--border);padding-left:1.5rem}
.mega__heading{font-family:var(--fl);font-size:.62rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--gold-dark);margin-bottom:.25rem}
.mega__col a{font-family:var(--fl);font-size:.76rem;color:var(--blue-dark);font-weight:500;padding:.3rem .5rem;border-radius:5px;transition:background .15s,color .15s;text-decoration:none;display:block}
.mega__col a:hover{background:#f0f3ff;color:var(--blue)}
.mega__sub{font-size:.67rem;color:var(--muted);line-height:1.7;padding:0 .5rem}
.nav__link--active{color:var(--blue)!important}
.nav__link--active::after{width:100%!important}
.nav__hamburger{display:none;flex-direction:column;gap:5px;background:none;border:none;cursor:pointer;padding:.4rem;z-index:10}
.nav__hamburger span{display:block;width:22px;height:2px;background:var(--blue-dark);border-radius:2px;transition:transform .25s,opacity .25s}
.nav__hamburger.is-open span:nth-child(1){transform:translateY(7px) rotate(45deg)}
.nav__hamburger.is-open span:nth-child(2){opacity:0}
.nav__hamburger.is-open span:nth-child(3){transform:translateY(-7px) rotate(-45deg)}
@media(max-width:768px){
  .nav__hamburger{display:flex}
  .nav__links{display:none;flex-direction:column;position:absolute;top:100%;left:0;right:0;background:var(--white);border-top:2px solid var(--gold);padding:1rem 1.5rem;gap:0;box-shadow:0 8px 24px rgba(11,26,92,.12);z-index:299}
  .nav__links--open{display:flex}
  .nav__link,.nav__link--btn{padding:.75rem 0;border-bottom:1px solid rgba(43,75,160,.07);width:100%}
  .nav__mega{position:static;transform:none;border:none;border-top:1px solid var(--border);box-shadow:none;padding:.5rem 0 .5rem 1rem;min-width:0;background:#f8f9ff;border-radius:6px;margin:.3rem 0;grid-template-columns:1fr;gap:.5rem}
  .mega__col--right{border-left:none;padding-left:0}
}
```

- [ ] **Step 4 : Remplacer `<style>` dans index.html par `<link>`**

Dans `site/index.html`, remplacer les lignes 12–332 (de `<link rel="preconnect"...>` jusqu'à `</style>`) par :

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&family=Inter:wght@300;400;500&family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/style.css">
```

- [ ] **Step 5 : Ajouter meta base-url dans index.html**

Dans le `<head>` de `site/index.html`, après `<meta name="viewport"...>`, ajouter :

```html
<meta name="base-url" content="">
```

- [ ] **Step 6 : Vérification visuelle**

Recharger http://localhost:8080 — la page doit être **pixel-perfect identique** à avant. Aucune différence visuelle acceptable.

- [ ] **Step 7 : Commit**

```bash
git add site/assets/css/style.css site/index.html
git commit -m "refactor: extraire CSS inline index.html vers assets/css/style.css"
```

---

## Task 2 : Créer nav.js — méga-menu partagé

**Files:**
- Create: `site/assets/js/nav.js`

Le fichier complet est dans le spec : `docs/superpowers/specs/2026-05-24-navigation-multipage-design.md`.

Structure du nav.js (à implémenter) :

```
(function() {
  1. Lire meta[name="base-url"] pour construire root = "" ou "../"
  2. Construire la chaîne HTML du nav (logo, liens, méga-panel, hamburger)
     en utilisant root pour tous les href et src.
     NOTE: container.innerHTML = html est sécurisé ici car html est
     100% statique — aucune entrée utilisateur n'est interpolée.
  3. Injecter dans document.getElementById('main-nav')
  4. Lire localStorage.getItem('sitelang') || 'fr'
  5. applyLang() : cacher .fr-text/.en-text, mettre à jour le bouton
  6. Exposer window.sitelang = lang
  7. Listener sur #gnavLangBtn : toggle lang, sauver localStorage, applyLang()
  8. Méga-menu desktop : mouseenter/mouseleave sur #megaItem → toggle megaPanel.hidden
  9. Méga-menu mobile : click sur #megaBtn → toggle megaPanel.hidden
  10. Hamburger : click sur #gnavHamburger → toggle .nav__links--open sur #gnavLinks
  11. Fermer sur clic extérieur au #gnav
  12. Marquer lien actif : comparer window.location.pathname aux href des liens
})();
```

**HTML du nav (structure exacte à générer) :**

```html
<nav class="nav" id="gnav">
  <a class="nav__logo" href="{root}index.html">
    <img class="nav__logo-img" src="{root}assets/images/logo/logo.png" alt="Les Greniers du Saïss">
  </a>
  <div class="nav__links" id="gnavLinks">
    <a class="nav__link" href="{root}index.html">
      <span class="fr-text">Accueil</span><span class="en-text" hidden>Home</span>
    </a>
    <div class="nav__item nav__item--mega" id="megaItem">
      <button class="nav__link nav__link--btn" id="megaBtn" aria-expanded="false" aria-haspopup="true">
        <span class="fr-text">Nos Produits</span><span class="en-text" hidden>Our Products</span>
        <span class="nav__chevron">▾</span>
      </button>
      <div class="nav__mega" id="megaPanel" hidden>
        <div class="mega__col">
          <p class="mega__heading">
            <span class="fr-text">🌿 Caroube</span><span class="en-text" hidden>🌿 Carob</span>
          </p>
          <a href="{root}products/caroube-brute.html">
            <span class="fr-text">Caroube brute</span><span class="en-text" hidden>Raw carob</span>
          </a>
          <a href="{root}products/graines-caroube.html">
            <span class="fr-text">Graines de caroube</span><span class="en-text" hidden>Carob seeds</span>
          </a>
          <a href="{root}products/pulpe-caroube.html">
            <span class="fr-text">Pulpe de caroube</span><span class="en-text" hidden>Carob pulp</span>
          </a>
          <a href="{root}products/farine-caroube.html">
            <span class="fr-text">Farine de caroube</span><span class="en-text" hidden>Carob flour</span>
          </a>
        </div>
        <div class="mega__col mega__col--right">
          <p class="mega__heading">
            <span class="fr-text">🌾 Légumineuses</span><span class="en-text" hidden>🌾 Legumes</span>
          </p>
          <a href="{root}products/legumineuses.html">
            <span class="fr-text">Voir toute la gamme →</span><span class="en-text" hidden>See full range →</span>
          </a>
          <p class="mega__sub">
            <span class="fr-text">Lentilles · Pois chiches · Fèves · Haricots · Pois secs</span>
            <span class="en-text" hidden>Lentils · Chickpeas · Fava beans · Beans · Dry peas</span>
          </p>
        </div>
      </div>
    </div>
    <a class="nav__link" href="{root}about.html">
      <span class="fr-text">À propos</span><span class="en-text" hidden>About</span>
    </a>
    <a class="nav__link" href="{root}news.html">
      <span class="fr-text">Actualités</span><span class="en-text" hidden>News</span>
    </a>
    <a class="nav__link" href="{root}contact.html">Contact</a>
    <button class="nav__lang" id="gnavLangBtn">EN</button>
  </div>
  <button class="nav__hamburger" id="gnavHamburger" aria-label="Menu" aria-expanded="false">
    <span></span><span></span><span></span>
  </button>
</nav>
```

- [ ] **Step 1 : Créer site/assets/js/nav.js** (voir structure ci-dessus)

- [ ] **Step 2 : Vérifier syntaxe**

```bash
node --check site/assets/js/nav.js
```

Résultat attendu : aucune sortie (= aucune erreur).

- [ ] **Step 3 : Commit**

```bash
git add site/assets/js/nav.js
git commit -m "feat: créer nav.js — méga-menu partagé desktop + mobile"
```

---

## Task 3 : Créer footer.js — footer partagé

**Files:**
- Create: `site/assets/js/footer.js`

Structure du footer.js :

```
(function() {
  1. Lire meta[name="base-url"] → root
  2. Construire HTML du footer (identique au footer de index.html actuel,
     avec tous les href mis à jour vers de vraies pages)
     NOTE: container.innerHTML est sécurisé (contenu 100% statique)
  3. Injecter dans document.getElementById('main-footer')
  4. Lire localStorage.getItem('sitelang') || 'fr'
  5. Appliquer hidden sur .fr-text/.en-text dans le footer uniquement
})();
```

**HTML du footer à générer (liens mis à jour) :**

```html
<footer class="footer">
  <div class="footer__top">
    <div class="footer__brand">
      <a href="{root}index.html">
        <img class="footer__logo-img" src="{root}assets/images/logo/logo.png" alt="Les Greniers du Saïss">
      </a>
      <p>
        <span class="fr-text">Exportateur de caroube et de légumineuses depuis le Saïss, Maroc. Fondée en 2008. Présente dans 15+ pays sur 3 continents.</span>
        <span class="en-text" hidden>Exporter of carob and legumes from Saïss, Morocco. Founded in 2008. Present in 15+ countries on 3 continents.</span>
      </p>
      <div class="footer__social">
        <!-- SVG LinkedIn + Instagram (mêmes que dans index.html actuel) -->
      </div>
    </div>
    <div class="footer__col">
      <h5><span class="fr-text">Navigation</span><span class="en-text" hidden>Navigation</span></h5>
      <a href="{root}index.html"><span class="fr-text">Accueil</span><span class="en-text" hidden>Home</span></a>
      <a href="{root}products/caroube-brute.html"><span class="fr-text">Caroube brute</span><span class="en-text" hidden>Raw carob</span></a>
      <a href="{root}products/legumineuses.html"><span class="fr-text">Légumineuses</span><span class="en-text" hidden>Legumes</span></a>
      <a href="{root}about.html"><span class="fr-text">À propos</span><span class="en-text" hidden>About</span></a>
      <a href="{root}news.html"><span class="fr-text">Actualités</span><span class="en-text" hidden>News</span></a>
    </div>
    <div class="footer__col">
      <h5>Contact</h5>
      <a href="mailto:Office@lesgreniersdusaiss.ma">Office@lesgreniersdusaiss.ma</a>
      <a href="tel:+212535729082">+212 5 35 72 90 82</a>
      <span>Lot 60, Q.I. Ouafae, Bensouda · Fès</span>
    </div>
  </div>
  <div class="footer__bottom">
    <div class="footer__copy">© 2026 Les Greniers du Saïss · Fès, Maroc · <span class="fr-text">Fondée en 2008</span><span class="en-text" hidden>Founded in 2008</span></div>
    <div class="footer__legal">
      <a href="{root}contact.html"><span class="fr-text">Confidentialité</span><span class="en-text" hidden>Privacy</span></a>
      <a href="{root}contact.html"><span class="fr-text">Mentions légales</span><span class="en-text" hidden>Legal notice</span></a>
    </div>
  </div>
</footer>
```

- [ ] **Step 1 : Créer site/assets/js/footer.js** (voir structure ci-dessus)

- [ ] **Step 2 : Vérifier syntaxe**

```bash
node --check site/assets/js/footer.js
```

- [ ] **Step 3 : Commit**

```bash
git add site/assets/js/footer.js
git commit -m "feat: créer footer.js — footer partagé injecté"
```

---

## Task 4 : Pilote — appliquer nav+footer à caroube-brute.html

**Files:**
- Modify: `site/products/caroube-brute.html`

- [ ] **Step 1 : Ajouter style.css en premier dans le head**

Avant `<link rel="stylesheet" href="../assets/css/main.css">`, insérer :

```html
  <link rel="stylesheet" href="../assets/css/style.css">
```

- [ ] **Step 2 : Injecter nav au début du body**

Juste après `<body>` et avant `<!-- Page Hero -->`, insérer :

```html
<div id="main-nav"></div>
<script src="../assets/js/nav.js"></script>
```

- [ ] **Step 3 : Injecter footer et footer.js avant </body>**

Juste avant `</body>`, insérer (avant les scripts existants) :

```html
<div id="main-footer"></div>
<script src="../assets/js/footer.js"></script>
```

- [ ] **Step 4 : Vérifier dans le navigateur**

http://localhost:8080/products/caroube-brute.html

- ✅ Méga-menu visible en haut
- ✅ "Nos Produits" survol → panneau à 2 colonnes
- ✅ "Caroube brute" surligné comme actif dans le méga-panel
- ✅ Footer avec adresse Fès en bas
- ✅ FR/EN fonctionne
- ✅ Contenu produit intact

Mobile (< 768px) :
- ✅ Hamburger ☰ visible
- ✅ Menu accordion fonctionne

- [ ] **Step 5 : Commit**

```bash
git add site/products/caroube-brute.html
git commit -m "feat: appliquer nav/footer partagés à caroube-brute.html (pilote)"
```

---

## Task 5 : Appliquer nav+footer aux 4 autres pages produits

**Files:**
- Modify: `site/products/graines-caroube.html`
- Modify: `site/products/pulpe-caroube.html`
- Modify: `site/products/farine-caroube.html`
- Modify: `site/products/legumineuses.html`

Chaque fichier reçoit exactement les mêmes 3 modifications que Task 4 steps 1–3.

- [ ] **Step 1 : Modifier graines-caroube.html** → vérifier http://localhost:8080/products/graines-caroube.html
- [ ] **Step 2 : Modifier pulpe-caroube.html** → vérifier http://localhost:8080/products/pulpe-caroube.html
- [ ] **Step 3 : Modifier farine-caroube.html** → vérifier http://localhost:8080/products/farine-caroube.html
- [ ] **Step 4 : Modifier legumineuses.html** → vérifier http://localhost:8080/products/legumineuses.html

- [ ] **Step 5 : Commit**

```bash
git add site/products/graines-caroube.html site/products/pulpe-caroube.html site/products/farine-caroube.html site/products/legumineuses.html
git commit -m "feat: appliquer nav/footer partagés aux pages produits"
```

---

## Task 6 : Appliquer nav+footer à about.html, news.html, contact.html

**Files:**
- Modify: `site/about.html`
- Modify: `site/news.html`
- Modify: `site/contact.html`

Ces pages sont à la racine — chemins sans `../` (ex: `assets/css/style.css`).

- [ ] **Step 1 : Modifier about.html**

Head — ajouter style.css avant main.css :
```html
  <link rel="stylesheet" href="assets/css/style.css">
```

Body — après `<body>` :
```html
<div id="main-nav"></div>
<script src="assets/js/nav.js"></script>
```

Avant `</body>` :
```html
<div id="main-footer"></div>
<script src="assets/js/footer.js"></script>
```

Supprimer tout `<nav>` ou `<header class="nav">` existant.

Vérifier http://localhost:8080/about.html — "À propos" actif dans le menu.

- [ ] **Step 2 : Modifier news.html** → mêmes modifications → vérifier http://localhost:8080/news.html

- [ ] **Step 3 : Modifier contact.html** → mêmes modifications → vérifier http://localhost:8080/contact.html

Vérifier spécifiquement que le formulaire contact répond encore (soumettre → message succès).

- [ ] **Step 4 : Commit**

```bash
git add site/about.html site/news.html site/contact.html
git commit -m "feat: appliquer nav/footer partagés à about, news, contact"
```

---

## Task 7 : Modifier index.html — remplacer l'ancienne nav (DERNIER)

**Files:**
- Modify: `site/index.html`

- [ ] **Step 1 : Remplacer l'ancienne nav**

Localiser et supprimer le bloc (autour de la ligne 338, après l'extraction CSS) :
```html
<!-- NAV -->
<nav class="nav">
  ...tout le contenu...
</nav>
```

Le remplacer par :
```html
<!-- NAV PARTAGÉ -->
<div id="main-nav"></div>
<script src="assets/js/nav.js"></script>
```

- [ ] **Step 2 : Adapter le script inline — supprimer toggleLang**

Dans le bloc `<script>` de fin, supprimer entièrement ces lignes :
```javascript
/* LANGUAGE TOGGLE — uses hidden attribute, no innerHTML */
var lang = 'fr';
function toggleLang() {
  lang = lang === 'fr' ? 'en' : 'fr';
  document.getElementById('langBtn').textContent = lang === 'fr' ? 'EN' : 'FR';
  document.querySelectorAll('.fr-text').forEach(function(el) { el.hidden = (lang !== 'fr'); });
  document.querySelectorAll('.en-text').forEach(function(el) { el.hidden = (lang !== 'en'); });
}
```

Dans `handleContact`, remplacer `lang` par `(window.sitelang || 'fr')` :
```javascript
function handleContact(e) {
  e.preventDefault();
  document.getElementById('contactForm').hidden = true;
  document.getElementById('contactSuccess').hidden = false;
  var lang = window.sitelang || 'fr';
  document.querySelectorAll('.fr-text').forEach(function(el) { el.hidden = (lang !== 'fr'); });
  document.querySelectorAll('.en-text').forEach(function(el) { el.hidden = (lang !== 'en'); });
}
```

- [ ] **Step 3 : Ajouter footer.js en fin de body**

Juste avant `</body>`, ajouter (le footer HTML inline reste, footer.js ne s'injecte que si `<div id="main-footer">` existe — pas de conflit) :
```html
<script src="assets/js/footer.js"></script>
```

- [ ] **Step 4 : Vérification complète de index.html**

http://localhost:8080 — vérifier :
- ✅ Méga-menu présent (remplace l'ancienne nav)
- ✅ "Nos Produits" → panneau produits
- ✅ Clic sur un produit → navigue vers la bonne page
- ✅ "Accueil" marqué actif
- ✅ Hero slideshow fonctionne
- ✅ Scroll-story fonctionne
- ✅ Compteurs animés fonctionnent
- ✅ FR/EN fonctionne sur toute la page (y compris formulaire)
- ✅ Formulaire contact → message de succès
- ✅ Mobile hamburger fonctionne

- [ ] **Step 5 : Commit**

```bash
git add site/index.html
git commit -m "feat: remplacer nav inline index.html par nav.js partagé"
```

---

## Task 8 : Validation finale

- [ ] **Step 1 : Navigation complète**

Parcourir dans le navigateur :
1. http://localhost:8080 → méga-menu → Caroube brute
2. → méga-menu → Graines de caroube
3. → méga-menu → Légumineuses
4. → menu → À propos
5. → menu → Actualités
6. → menu → Contact
7. → clic logo → Accueil

À chaque étape : méga-menu visible, lien actif correct, footer présent.

- [ ] **Step 2 : Test FR/EN persistant**

Accueil → cliquer EN → naviguer sur 3 pages différentes → les textes restent en anglais. Cliquer FR → retour en français.

- [ ] **Step 3 : Test mobile 375px**

Dans Chrome DevTools, simuler iPhone SE (375px). Sur chaque page : hamburger ☰ visible, s'ouvre en drawer, "Nos Produits" en accordion.

- [ ] **Step 4 : Formulaire contact**

http://localhost:8080/contact.html → remplir + soumettre → message de succès affiché.

- [ ] **Step 5 : Commit final**

```bash
git add -A
git commit -m "feat: restructuration navigation multi-pages complète — méga-menu + mobile"
```
