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
    +   '<div class="nav__item nav__item--mega">'
    +     '<button class="nav__link nav__link--btn" aria-expanded="false" aria-haspopup="true">'
    +       '<span class="fr-text">Nos Produits</span><span class="en-text" hidden>Our Products</span>'
    +       '<span class="nav__chevron">&#9662;</span>'
    +     '</button>'
    +     '<div class="nav__mega" hidden>'
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
    +         '<p class="mega__heading" style="margin-top:.85rem">'
    +           '<span class="fr-text">&#127805; Autres fili&egrave;res</span><span class="en-text" hidden>&#127805; Other Lines</span>'
    +         '</p>'
    +         '<a href="' + root + 'products/aliments-betail.html">'
    +           '<span class="fr-text">Aliments de b&eacute;tail</span><span class="en-text" hidden>Animal Feed</span>'
    +         '</a>'
    +         '<a href="' + root + 'products/cereales.html">'
    +           '<span class="fr-text">C&eacute;r&eacute;ales</span><span class="en-text" hidden>Cereals</span>'
    +         '</a>'
    +       '</div>'
    +     '</div>'
    +   '</div>'
    +   '<a class="nav__link" href="' + root + 'about.html">'
    +     '<span class="fr-text">&Agrave; propos</span><span class="en-text" hidden>About</span>'
    +   '</a>'
    +   '<div class="nav__item nav__item--mega">'
    +     '<button class="nav__link nav__link--btn" aria-expanded="false" aria-haspopup="true">'
    +       '<span class="fr-text">Notre d&eacute;marche</span><span class="en-text" hidden>Our Approach</span>'
    +       '<span class="nav__chevron">&#9662;</span>'
    +     '</button>'
    +     '<div class="nav__mega nav__mega--single" hidden>'
    +       '<div class="mega__col">'
    +         '<a href="' + root + 'applications.html">'
    +           '<span class="fr-text">Applications</span><span class="en-text" hidden>Applications</span>'
    +         '</a>'
    +         '<a href="' + root + 'qualite.html">'
    +           '<span class="fr-text">Qualit&eacute;</span><span class="en-text" hidden>Quality</span>'
    +         '</a>'
    +         '<a href="' + root + 'durabilite.html">'
    +           '<span class="fr-text">Durabilit&eacute;</span><span class="en-text" hidden>Sustainability</span>'
    +         '</a>'
    +       '</div>'
    +     '</div>'
    +   '</div>'
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
  var megaItems   = gnav ? gnav.querySelectorAll('.nav__item--mega') : [];
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

  /* ── 8. Méga-menus desktop : mouseenter / mouseleave ───────── */
  var hoverQuery = window.matchMedia('(hover: hover) and (pointer: fine)');

  function closeMega(item) {
    var panel = item.querySelector('.nav__mega');
    var btn   = item.querySelector('.nav__link--btn');
    if (panel) panel.hidden = true;
    if (btn) btn.setAttribute('aria-expanded', 'false');
    item.classList.remove('is-open');
  }

  for (var m = 0; m < megaItems.length; m++) {
    (function (item) {
      var panel = item.querySelector('.nav__mega');
      var btn   = item.querySelector('.nav__link--btn');
      if (!panel || !btn) return;

      item.addEventListener('mouseenter', function () {
        if (!hoverQuery.matches) return;
        panel.hidden = false;
        btn.setAttribute('aria-expanded', 'true');
        item.classList.add('is-open');
      });

      item.addEventListener('mouseleave', function () {
        if (!hoverQuery.matches) return;
        closeMega(item);
      });

      /* ── 9. Méga-menu mobile : clic sur le bouton ────────────── */
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var isOpen = !panel.hidden;
        /* Fermer les autres méga-menus ouverts */
        for (var n = 0; n < megaItems.length; n++) {
          if (megaItems[n] !== item) closeMega(megaItems[n]);
        }
        panel.hidden = isOpen;
        btn.setAttribute('aria-expanded', String(!isOpen));
        item.classList.toggle('is-open', !isOpen);
      });
    })(megaItems[m]);
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
      for (var e1 = 0; e1 < megaItems.length; e1++) closeMega(megaItems[e1]);
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

    /* Fermer les méga-menus */
    for (var c1 = 0; c1 < megaItems.length; c1++) closeMega(megaItems[c1]);

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

})();
