/* ============================================================
   nav.js — Méga-menu partagé desktop + mobile
   IIFE: aucune variable globale sauf window.sitelang

   Note sécurité : container.innerHTML est utilisé intentionnellement.
   Le contenu est 100% statique (chaînes hardcodées, pas de saisie
   utilisateur), donc aucun risque XSS. DOMPurify non requis.
   ============================================================ */

(function () {
  'use strict';

  /* ── 1. Résoudre le root selon meta[name="base-url"] ───────── */
  var meta = document.querySelector('meta[name="base-url"]');
  var metaContent = (meta && meta.getAttribute('content')) ? meta.getAttribute('content') : '';
  var root = metaContent ? metaContent + '/' : '';

  /* ── 2. Construire le HTML de la nav ───────────────────────── */
  var navHTML = '<nav class="nav" id="gnav">'
    + '<a class="nav__logo" href="' + root + 'index.html">'
    +   '<img class="nav__logo-img" src="' + root + 'assets/images/logo/logo.png" alt="Les Greniers du Saïss">'
    + '</a>'
    + '<div class="nav__links" id="gnavLinks">'
    +   '<a class="nav__link" href="' + root + 'index.html">'
    +     '<span class="fr-text">Accueil</span><span class="en-text" hidden>Home</span>'
    +   '</a>'
    +   '<div class="nav__item nav__item--mega" id="megaItem">'
    +     '<button class="nav__link nav__link--btn" id="megaBtn" aria-expanded="false" aria-haspopup="true">'
    +       '<span class="fr-text">Nos Produits</span><span class="en-text" hidden>Our Products</span>'
    +       '<span class="nav__chevron">&#9662;</span>'
    +     '</button>'
    +     '<div class="nav__mega" id="megaPanel" hidden>'
    +       '<div class="mega__col">'
    +         '<p class="mega__heading">'
    +           '<span class="fr-text">&#127807; Caroube</span><span class="en-text" hidden>&#127807; Carob</span>'
    +         '</p>'
    +         '<a href="' + root + 'products/caroube-brute.html">'
    +           '<span class="fr-text">Caroube brute</span><span class="en-text" hidden>Raw carob</span>'
    +         '</a>'
    +         '<a href="' + root + 'products/graines-caroube.html">'
    +           '<span class="fr-text">Graines de caroube</span><span class="en-text" hidden>Carob seeds</span>'
    +         '</a>'
    +         '<a href="' + root + 'products/pulpe-caroube.html">'
    +           '<span class="fr-text">Pulpe de caroube</span><span class="en-text" hidden>Carob pulp</span>'
    +         '</a>'
    +         '<a href="' + root + 'products/farine-caroube.html">'
    +           '<span class="fr-text">Farine de caroube</span><span class="en-text" hidden>Carob flour</span>'
    +         '</a>'
    +       '</div>'
    +       '<div class="mega__col mega__col--right">'
    +         '<p class="mega__heading">'
    +           '<span class="fr-text">&#127806; L&eacute;gumineuses</span><span class="en-text" hidden>&#127806; Legumes</span>'
    +         '</p>'
    +         '<a href="' + root + 'products/legumineuses.html">'
    +           '<span class="fr-text">Voir toute la gamme &#8594;</span><span class="en-text" hidden>See full range &#8594;</span>'
    +         '</a>'
    +         '<p class="mega__sub">'
    +           '<span class="fr-text">Lentilles &middot; Pois chiches &middot; F&egrave;ves &middot; Haricots &middot; Pois secs</span>'
    +           '<span class="en-text" hidden>Lentils &middot; Chickpeas &middot; Fava beans &middot; Beans &middot; Dry peas</span>'
    +         '</p>'
    +       '</div>'
    +     '</div>'
    +   '</div>'
    +   '<a class="nav__link" href="' + root + 'about.html">'
    +     '<span class="fr-text">&Agrave; propos</span><span class="en-text" hidden>About</span>'
    +   '</a>'
    +   '<a class="nav__link" href="' + root + 'news.html">'
    +     '<span class="fr-text">Actualit&eacute;s</span><span class="en-text" hidden>News</span>'
    +   '</a>'
    +   '<a class="nav__link" href="' + root + 'contact.html">Contact</a>'
    +   '<button class="nav__lang" id="gnavLangBtn">EN</button>'
    + '</div>'
    + '<button class="nav__hamburger" id="gnavHamburger" aria-label="Menu" aria-expanded="false">'
    +   '<span></span><span></span><span></span>'
    + '</button>'
    + '</nav>';

  /* ── 3. Injecter dans #main-nav ────────────────────────────── */
  /* Sécurité : innerHTML est safe ici — contenu 100% statique, aucune entrée utilisateur */
  var container = document.getElementById('main-nav');
  if (container) {
    container.innerHTML = navHTML; /* safe: static hardcoded strings only */
  }

  /* ── 4. Langue initiale ────────────────────────────────────── */
  var lang = localStorage.getItem('sitelang') || localStorage.getItem('gs_lang') || 'fr';
  window.sitelang = lang;

  /* ── 5. applyLang : bascule .fr-text / .en-text ───────────── */
  function applyLang() {
    var frEls = document.querySelectorAll('.fr-text');
    var enEls = document.querySelectorAll('.en-text');
    var isFr = (lang === 'fr');

    for (var i = 0; i < frEls.length; i++) {
      frEls[i].hidden = !isFr;
    }
    for (var j = 0; j < enEls.length; j++) {
      enEls[j].hidden = isFr;
    }

    var btn = document.getElementById('gnavLangBtn');
    if (btn) {
      btn.textContent = isFr ? 'EN' : 'FR';
    }

    window.sitelang = lang;
    document.documentElement.lang = lang;
  }

  /* Appliquer immédiatement */
  applyLang();

  /* ── 6. Obtenir les éléments DOM après injection ───────────── */
  var gnav        = document.getElementById('gnav');
  var gnavLinks   = document.getElementById('gnavLinks');
  var megaItem    = document.getElementById('megaItem');
  var megaBtn     = document.getElementById('megaBtn');
  var megaPanel   = document.getElementById('megaPanel');
  var langBtn     = document.getElementById('gnavLangBtn');
  var hamburger   = document.getElementById('gnavHamburger');

  /* ── 7. Bouton langue ──────────────────────────────────────── */
  if (langBtn) {
    langBtn.addEventListener('click', function () {
      lang = (lang === 'fr') ? 'en' : 'fr';
      localStorage.setItem('sitelang', lang);
      localStorage.setItem('gs_lang', lang);
      applyLang();
    });
  }

  /* ── 8. Méga-menu desktop : mouseenter / mouseleave ────────── */
  if (megaItem && megaPanel && megaBtn) {
    var hoverQuery = window.matchMedia('(hover: hover) and (pointer: fine)');

    megaItem.addEventListener('mouseenter', function () {
      if (!hoverQuery.matches) return;
      megaPanel.hidden = false;
      megaBtn.setAttribute('aria-expanded', 'true');
      megaItem.classList.add('is-open');
    });

    megaItem.addEventListener('mouseleave', function () {
      if (!hoverQuery.matches) return;
      megaPanel.hidden = true;
      megaBtn.setAttribute('aria-expanded', 'false');
      megaItem.classList.remove('is-open');
    });

    /* ── 9. Méga-menu mobile : clic sur #megaBtn ─────────────── */
    megaBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      var isOpen = !megaPanel.hidden;
      megaPanel.hidden = isOpen;
      megaBtn.setAttribute('aria-expanded', String(!isOpen));
      megaItem.classList.toggle('is-open', !isOpen);
    });
  }

  /* ── 10. Hamburger ─────────────────────────────────────────── */
  if (hamburger && gnavLinks) {
    hamburger.addEventListener('click', function (e) {
      e.stopPropagation();
      var isOpen = gnavLinks.classList.toggle('nav__links--open');
      hamburger.setAttribute('aria-expanded', String(isOpen));
      hamburger.classList.toggle('is-open', isOpen);
    });
  }

  /* ── 11. Fermer sur Escape ─────────────────────────────────── */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (megaPanel) megaPanel.hidden = true;
      if (megaBtn) megaBtn.setAttribute('aria-expanded', 'false');
      if (megaItem) megaItem.classList.remove('is-open');
      if (gnavLinks) gnavLinks.classList.remove('nav__links--open');
      if (hamburger) {
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.classList.remove('is-open');
      }
    }
  });

  /* ── 12. Fermer sur clic extérieur ─────────────────────────── */
  document.addEventListener('click', function (e) {
    if (!gnav || gnav.contains(e.target)) return;

    /* Fermer le méga-menu */
    if (megaPanel && !megaPanel.hidden) {
      megaPanel.hidden = true;
      if (megaBtn) megaBtn.setAttribute('aria-expanded', 'false');
      if (megaItem) megaItem.classList.remove('is-open');
    }

    /* Fermer le menu mobile */
    if (gnavLinks && gnavLinks.classList.contains('nav__links--open')) {
      gnavLinks.classList.remove('nav__links--open');
      if (hamburger) {
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.classList.remove('is-open');
      }
    }
  });

  /* ── 13. Marquer le lien actif ─────────────────────────────── */
  function markActiveLink() {
    var pathname = window.location.pathname;
    var filename = pathname.split('/').pop() || '';

    var links = document.querySelectorAll('#gnav .nav__link, #gnav .mega__col a');
    for (var k = 0; k < links.length; k++) {
      var href = links[k].getAttribute('href') || '';
      var hrefFile = href.split('/').pop() || '';

      var isActive = false;

      if (hrefFile === 'index.html') {
        /* Page d'accueil active si "/" ou "/index.html" ou filename vide */
        isActive = (pathname === '/' || pathname.endsWith('/index.html') || filename === '' || filename === 'index.html');
      } else if (hrefFile && hrefFile === filename) {
        isActive = true;
      }

      if (isActive) {
        links[k].classList.add('nav__link--active');
      }
    }
  }

  markActiveLink();

  /* ── 14. Sur la page d'accueil : remplacer les liens par des ancres ─ */
  (function adaptHomepageLinks() {
    var path = window.location.pathname;
    var isHome = (path === '/' || path.endsWith('/index.html') || path === '' ||
                  path.replace(/.*\//, '') === '' || path.replace(/.*\//, '') === 'index.html');
    if (!isHome) return;

    var map = {
      'about.html': '#savoir-faire'
    };

    var links = document.querySelectorAll('#gnav a');
    for (var i = 0; i < links.length; i++) {
      var href = links[i].getAttribute('href') || '';
      var file = href.split('/').pop();
      if (map[file]) {
        links[i].setAttribute('href', map[file]);
      }
    }
  })();

})();
