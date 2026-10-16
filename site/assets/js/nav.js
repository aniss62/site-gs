/* ============================================================
   nav.js : en-tête partagé, menu plein écran en cascade, recherche
   IIFE: aucune variable globale sauf window.sitelang

   Note sécurité : innerHTML est utilisé uniquement avec des chaînes
   statiques définies dans ce fichier (aucune saisie utilisateur).
   Les résultats de recherche sont construits avec textContent.
   ============================================================ */

(function () {
  'use strict';

  /* ── 1. Résoudre le root selon meta[name="base-url"] ───────── */
  var meta = document.querySelector('meta[name="base-url"]');
  var metaContent = (meta && meta.getAttribute('content')) ? meta.getAttribute('content') : '';
  var root = metaContent ? metaContent + '/' : '';

  /* ── 2. Structure du menu (niveaux 1 à 3) ──────────────────── */
  var MENU = [
    { fr: 'Nos produits', en: 'Our products', children: [
      { fr: 'Caroube', en: 'Carob', children: [
        { fr: 'Caroube brute', en: 'Raw carob', href: 'products/caroube-brute.html' },
        { fr: 'Graines de caroube', en: 'Carob seeds', href: 'products/graines-caroube.html' },
        { fr: 'Pulpe de caroube', en: 'Carob pulp', href: 'products/pulpe-caroube.html' }
      ] },
      { fr: 'Légumineuses', en: 'Legumes', href: 'products/legumineuses.html' },
      { fr: 'Céréales', en: 'Cereals', href: 'products/cereales.html' },
      { fr: 'Épices', en: 'Spices', href: 'products/epices.html' },
      { fr: 'Aliments de bétail et dérivés', en: 'Animal feed and derivatives', href: 'products/aliments-betail.html' }
    ] },
    { fr: 'À propos', en: 'About', href: 'about.html' },
    { fr: 'Notre démarche', en: 'Our approach', children: [
      { fr: 'Applications', en: 'Applications', href: 'applications.html' },
      { fr: 'Qualité', en: 'Quality', href: 'qualite.html' },
      { fr: 'Durabilité', en: 'Sustainability', href: 'durabilite.html' }
    ] },
    { fr: 'Actualités', en: 'News', href: 'news.html' },
    { fr: 'Contact', en: 'Contact', href: 'contact.html' }
  ];

  /* Pages interrogeables par la recherche */
  var PAGES = [
    { fr: 'Accueil', en: 'Home', href: 'index.html', kw: 'accueil home' },
    { fr: 'Caroube brute', en: 'Raw carob', href: 'products/caroube-brute.html', kw: 'caroube kharoub gousses carob pods' },
    { fr: 'Graines de caroube', en: 'Carob seeds', href: 'products/graines-caroube.html', kw: 'graines seeds caroube carob' },
    { fr: 'Pulpe de caroube', en: 'Carob pulp', href: 'products/pulpe-caroube.html', kw: 'pulpe pulp kibbles poudre farine' },
    { fr: 'Légumineuses', en: 'Legumes', href: 'products/legumineuses.html', kw: 'lentilles pois chiches fèves haricots féverole lentils chickpeas beans' },
    { fr: 'Céréales', en: 'Cereals', href: 'products/cereales.html', kw: 'blé céréales négoce wheat cereals' },
    { fr: 'Épices', en: 'Spices', href: 'products/epices.html', kw: 'coriandre poivre noir epices spices coriander pepper' },
    { fr: 'Aliments de bétail et dérivés', en: 'Animal feed and derivatives', href: 'products/aliments-betail.html', kw: 'bétail feed élevage animal' },
    { fr: 'À propos', en: 'About', href: 'about.html', kw: 'histoire entreprise fondée 2008 about history company' },
    { fr: 'Applications', en: 'Applications', href: 'applications.html', kw: 'application industrie alimentaire cosmétique pharmacie' },
    { fr: 'Qualité', en: 'Quality', href: 'qualite.html', kw: 'qualité traçabilité certification quality' },
    { fr: 'Durabilité', en: 'Sustainability', href: 'durabilite.html', kw: 'durabilité agriculture rse sustainability' },
    { fr: 'Actualités', en: 'News', href: 'news.html', kw: 'actualités news presse' },
    { fr: 'Contact', en: 'Contact', href: 'contact.html', kw: 'contact devis quote adresse téléphone' },
    { fr: 'Mentions légales', en: 'Legal notice', href: 'mentions-legales.html', kw: 'légal legal mentions' },
    { fr: 'Politique de confidentialité', en: 'Privacy policy', href: 'confidentialite.html', kw: 'confidentialité privacy données rgpd' },
    { fr: 'Conditions d’utilisation', en: 'Terms of use', href: 'conditions.html', kw: 'conditions terms utilisation' }
  ];

  var ICON = {
    globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="9.5"/><path d="M2.5 12h19M12 2.5c2.6 2.7 3.9 5.9 3.9 9.5s-1.3 6.8-3.9 9.5c-2.6-2.7-3.9-5.9-3.9-9.5S9.4 5.2 12 2.5z"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/></svg>',
    burger: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="M3 6h18"/><path d="M7 12h14"/><path d="M11 18h10"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19"/></svg>'
  };

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function label(item) {
    return '<span class="fr-text">' + esc(item.fr) + '</span><span class="en-text" hidden>' + esc(item.en) + '</span>';
  }

  /* ── 3. Menu en listes imbriquées (colonnes en desktop, accordéon en mobile) ── */
  function menuList(items, level) {
    var html = '<ul class="menu__list menu__list--l' + level + '">';
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      if (it.children) {
        html += '<li class="menu__li menu__li--parent">'
          + '<button type="button" class="menu__item" aria-expanded="false">' + label(it)
          + '<svg class="menu__chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg></button>'
          + menuList(it.children, level + 1) + '</li>';
      } else {
        html += '<li class="menu__li"><a class="menu__item" href="' + root + it.href + '">' + label(it) + '</a></li>';
      }
    }
    return html + '</ul>';
  }

  /* ── 4. HTML de l'en-tête, du menu, de la recherche et de la barre mobile ── */
  var navHTML =
      '<header class="hd" id="gnav">'
    +   '<a class="hd__logo" href="' + root + 'index.html" aria-label="Les Greniers du Saïss">'
    +     '<img class="hd__logo-img" src="' + root + 'assets/images/logo/logo.png" alt="Les Greniers du Saïss">'
    +   '</a>'
    +   '<div class="hd__icons">'
    +     '<button type="button" class="hd__icon" data-act="lang" aria-label="Langue / Language">' + ICON.globe + '<span class="hd__lang" id="gnavLangBtn">EN</span></button>'
    +     '<button type="button" class="hd__icon" data-act="search" aria-label="Rechercher / Search">' + ICON.search + '</button>'
    +     '<button type="button" class="hd__icon hd__burger" data-act="menu" aria-label="Menu" aria-expanded="false" aria-controls="gmenu">'
    +       '<span class="hd__burger-open">' + ICON.burger + '</span><span class="hd__burger-close">' + ICON.close + '</span>'
    +     '</button>'
    +   '</div>'
    + '</header>'

    + '<div class="menu" id="gmenu" hidden>'
    +   '<nav class="menu__cols" aria-label="Menu principal">' + menuList(MENU, 1) + '</nav>'
    + '</div>'

    + '<div class="search" id="gsearch" hidden role="dialog" aria-modal="true" aria-label="Recherche">'
    +   '<div class="search__box">'
    +     '<input class="search__input" id="gsearchInput" type="search" autocomplete="off" placeholder="Rechercher…" aria-label="Rechercher">'
    +     '<ul class="search__results" id="gsearchResults"></ul>'
    +   '</div>'
    + '</div>'

    + '<div class="mbar" id="gmbar">'
    +   '<button type="button" class="mbar__btn" data-act="lang" aria-label="Langue / Language">' + ICON.globe + '</button>'
    +   '<button type="button" class="mbar__btn" data-act="search" aria-label="Rechercher / Search">' + ICON.search + '</button>'
    +   '<button type="button" class="mbar__btn mbar__burger" data-act="menu" aria-label="Menu" aria-expanded="false" aria-controls="gmenu">'
    +     '<span class="hd__burger-open">' + ICON.burger + '</span><span class="hd__burger-close">' + ICON.close + '</span>'
    +   '</button>'
    + '</div>';

  /* ── 5. Injecter dans #main-nav ────────────────────────────── */
  var container = document.getElementById('main-nav');
  if (container) {
    container.innerHTML = navHTML; /* safe: static strings only */
  }

  var gnav = document.getElementById('gnav');
  var menu = document.getElementById('gmenu');
  var search = document.getElementById('gsearch');
  var searchInput = document.getElementById('gsearchInput');
  var searchResults = document.getElementById('gsearchResults');
  if (!gnav || !menu) return;

  /* ── 6. Langue ─────────────────────────────────────────────── */
  var lang = localStorage.getItem('sitelang') || localStorage.getItem('gs_lang') || 'fr';
  window.sitelang = lang;

  function applyLang() {
    var isFr = (lang === 'fr');
    var frEls = document.querySelectorAll('.fr-text');
    var enEls = document.querySelectorAll('.en-text');
    for (var i = 0; i < frEls.length; i++) frEls[i].hidden = !isFr;
    for (var j = 0; j < enEls.length; j++) enEls[j].hidden = isFr;

    var btn = document.getElementById('gnavLangBtn');
    if (btn) btn.textContent = isFr ? 'EN' : 'FR';
    if (searchInput) searchInput.placeholder = isFr ? 'Rechercher…' : 'Search…';

    window.sitelang = lang;
    document.documentElement.lang = lang;
  }
  applyLang();

  function toggleLang() {
    lang = (lang === 'fr') ? 'en' : 'fr';
    localStorage.setItem('sitelang', lang);
    localStorage.setItem('gs_lang', lang);
    applyLang();
    /* Met aussi à jour les textes pilotés par data-i18n */
    if (typeof I18N !== 'undefined' && I18N && I18N.setLang) I18N.setLang(lang);
    if (!search.hidden) renderResults(searchInput.value);
  }

  /* ── 7. En-tête : transparent sur le hero, blanc au scroll ─── */
  /* Le script s'exécute avant le contenu de la page : on attend le DOM complet
     pour savoir s'il y a un hero, et on réapplique la langue au contenu chargé. */
  function afterDomReady() {
    var hasHero = !!document.querySelector('.hero, .page-hero:not(.page-hero--light), .story-hero');
    document.body.classList.add('has-hd');
    if (!hasHero) {
      gnav.classList.add('hd--solid');
      document.body.classList.add('hd-offset');
    }
    applyLang();
    onScroll();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', afterDomReady);
  else afterDomReady();

  function onScroll() {
    gnav.classList.toggle('hd--scrolled', window.scrollY > 20);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── 8. Menu plein écran ───────────────────────────────────── */
  var burgers = document.querySelectorAll('[data-act="menu"]');

  function setBurgerState(open) {
    for (var i = 0; i < burgers.length; i++) burgers[i].setAttribute('aria-expanded', String(open));
  }

  function closeBranches(except) {
    var parents = menu.querySelectorAll('.menu__li--parent.is-open');
    for (var i = 0; i < parents.length; i++) {
      if (except && (parents[i] === except || parents[i].contains(except))) continue;
      parents[i].classList.remove('is-open');
      parents[i].querySelector('.menu__item').setAttribute('aria-expanded', 'false');
    }
  }

  function openMenu() {
    closeSearch();
    menu.hidden = false;
    document.body.classList.add('menu-open');
    setBurgerState(true);
  }

  function closeMenu() {
    menu.hidden = true;
    if (search.hidden) document.body.classList.remove('menu-open');
    setBurgerState(false);
    closeBranches(null);
  }

  function toggleMenu() { if (menu.hidden) openMenu(); else closeMenu(); }

  menu.addEventListener('click', function (e) {
    var btn = e.target.closest('button.menu__item');
    if (btn) {
      var li = btn.parentNode;
      var willOpen = !li.classList.contains('is-open');
      closeBranches(li);
      li.classList.toggle('is-open', willOpen);
      btn.setAttribute('aria-expanded', String(willOpen));
      return;
    }
    if (e.target.closest('a')) { closeMenu(); return; }
    /* Clic sur le fond du menu (hors liens) : fermer */
    if (e.target === menu || e.target.classList.contains('menu__cols')) closeMenu();
  });

  /* ── 9. Recherche ──────────────────────────────────────────── */
  function renderResults(q) {
    while (searchResults.firstChild) searchResults.removeChild(searchResults.firstChild);
    q = (q || '').trim().toLowerCase();
    if (!q) return;
    var shown = 0;
    for (var i = 0; i < PAGES.length && shown < 8; i++) {
      var p = PAGES[i];
      var hay = (p.fr + ' ' + p.en + ' ' + p.kw).toLowerCase();
      if (hay.indexOf(q) === -1) continue;
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = root + p.href;
      a.textContent = (lang === 'fr') ? p.fr : p.en;
      li.appendChild(a);
      searchResults.appendChild(li);
      shown++;
    }
    if (!shown) {
      var none = document.createElement('li');
      none.className = 'search__none';
      none.textContent = (lang === 'fr') ? 'Aucun résultat' : 'No results';
      searchResults.appendChild(none);
    }
  }

  function openSearch() {
    closeMenu();
    search.hidden = false;
    document.body.classList.add('menu-open');
    searchInput.value = '';
    renderResults('');
    setTimeout(function () { searchInput.focus(); }, 30);
  }

  function closeSearch() {
    if (search.hidden) return;
    search.hidden = true;
    if (menu.hidden) document.body.classList.remove('menu-open');
  }

  searchInput.addEventListener('input', function () { renderResults(searchInput.value); });
  searchInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      var first = searchResults.querySelector('a');
      if (first) window.location.href = first.href;
    }
  });
  search.addEventListener('click', function (e) {
    if (e.target === search) closeSearch();
  });

  /* ── 10. Boutons d'en-tête, barre mobile et bouton du hero ─── */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-act]');
    if (!b) return;
    var act = b.getAttribute('data-act');
    if (act === 'lang') toggleLang();
    else if (act === 'search') { if (search.hidden) openSearch(); else closeSearch(); }
    else if (act === 'menu') toggleMenu();
    else if (act === 'open-menu') openMenu();
  });

  /* ── 11. Échap ferme menu et recherche ─────────────────────── */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeMenu(); closeSearch(); }
  });

  /* ── 12. Page courante ─────────────────────────────────────── */
  (function markActiveLink() {
    var filename = window.location.pathname.split('/').pop() || 'index.html';
    var links = menu.querySelectorAll('a.menu__item');
    for (var k = 0; k < links.length; k++) {
      var hrefFile = (links[k].getAttribute('href') || '').split('/').pop();
      if (hrefFile === filename) links[k].setAttribute('aria-current', 'page');
    }
  })();
})();
