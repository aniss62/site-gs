/* ============================================================
   footer.js — Footer partagé injecté dans #main-footer
   IIFE: aucune variable globale

   Note sécurité : le contenu injecté est 100% statique
   (chaînes hardcodées, aucune saisie utilisateur).
   DOMPurify non requis — même pattern que nav.js.
   ============================================================ */

(function () {
  'use strict';

  /* ── 1. Résoudre le root selon meta[name="base-url"] ───────── */
  var meta = document.querySelector('meta[name="base-url"]');
  var metaContent = (meta && meta.getAttribute('content')) ? meta.getAttribute('content') : '';
  var root = metaContent ? metaContent + '/' : '';

  /* ── 2. Construire le HTML du footer ───────────────────────── */
  var footerHTML = '<footer class="footer">'
    + '<div class="footer__top">'

    /* ── Colonne marque ── */
    +   '<div class="footer__brand">'
    +     '<a href="' + root + 'index.html">'
    +       '<img class="footer__logo-img" src="' + root + 'assets/images/logo/logo.png" alt="Les Greniers du Sa&iuml;ss">'
    +     '</a>'
    +     '<p>'
    +       '<span class="fr-text">Exportateur de caroube et de l&eacute;gumineuses depuis le Sa&iuml;ss, Maroc. Fond&eacute;e en 2008. Pr&eacute;sente dans 15+ pays sur 3 continents.</span>'
    +       '<span class="en-text" hidden>Exporter of carob and legumes from Sa&iuml;ss, Morocco. Founded in 2008. Present in 15+ countries on 3 continents.</span>'
    +     '</p>'
    +     '<div class="footer__social">'
    +       '<a class="footer__social-link" href="#" aria-label="LinkedIn">'
    +         '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
    +           '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>'
    +           '<rect x="2" y="9" width="4" height="12"/>'
    +           '<circle cx="4" cy="4" r="2"/>'
    +         '</svg>'
    +       '</a>'
    +       '<a class="footer__social-link" href="#" aria-label="Instagram">'
    +         '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
    +           '<rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>'
    +           '<path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>'
    +           '<line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>'
    +         '</svg>'
    +       '</a>'
    +     '</div>'
    +   '</div>'

    /* ── Colonne navigation ── */
    +   '<div class="footer__col">'
    +     '<h5><span class="fr-text">Navigation</span><span class="en-text" hidden>Navigation</span></h5>'
    +     '<a href="' + root + 'index.html"><span class="fr-text">Accueil</span><span class="en-text" hidden>Home</span></a>'
    +     '<a href="' + root + 'products/caroube-brute.html"><span class="fr-text">Caroube brute</span><span class="en-text" hidden>Raw carob</span></a>'
    +     '<a href="' + root + 'products/legumineuses.html"><span class="fr-text">L&eacute;gumineuses</span><span class="en-text" hidden>Legumes</span></a>'
    +     '<a href="' + root + 'about.html"><span class="fr-text">&Agrave; propos</span><span class="en-text" hidden>About</span></a>'
    +     '<a href="' + root + 'news.html"><span class="fr-text">Actualit&eacute;s</span><span class="en-text" hidden>News</span></a>'
    +   '</div>'

    /* ── Colonne contact ── */
    +   '<div class="footer__col">'
    +     '<h5>Contact</h5>'
    +     '<a href="mailto:Office@lesgreniersdusaiss.ma">Office@lesgreniersdusaiss.ma</a>'
    +     '<a href="tel:+212535729082">+212 5 35 72 90 82</a>'
    +     '<span>Lot 60, Q.I. Ouafae, Bensouda &middot; F&egrave;s</span>'
    +   '</div>'

    + '</div>'

    /* ── Barre basse ── */
    + '<div class="footer__bottom">'
    +   '<div class="footer__copy">&copy; 2026 Les Greniers du Sa&iuml;ss &middot; F&egrave;s, Maroc &middot; <span class="fr-text">Fond&eacute;e en 2008</span><span class="en-text" hidden>Founded in 2008</span></div>'
    +   '<div class="footer__legal">'
    +     '<a href="' + root + 'contact.html"><span class="fr-text">Confidentialit&eacute;</span><span class="en-text" hidden>Privacy</span></a>'
    +     '<a href="' + root + 'contact.html"><span class="fr-text">Mentions l&eacute;gales</span><span class="en-text" hidden>Legal notice</span></a>'
    +   '</div>'
    + '</div>'

    + '</footer>';

  /* ── 3. Injecter dans #main-footer ─────────────────────────── */
  var container = document.getElementById('main-footer');
  if (!container) { return; }
  container.innerHTML = footerHTML; // safe: 100% static hardcoded strings, no user input

  /* ── 4. Langue initiale ────────────────────────────────────── */
  var lang = localStorage.getItem('sitelang') || localStorage.getItem('gs_lang') || 'fr';

  /* ── 5. Appliquer la langue aux seuls éléments du footer ───── */
  /* nav.js gère le document entier ; ici on restreint au footer injecté */
  var isFr = (lang === 'fr');
  var frEls = container.querySelectorAll('.fr-text');
  var enEls = container.querySelectorAll('.en-text');

  for (var i = 0; i < frEls.length; i++) {
    frEls[i].hidden = !isFr;
  }
  for (var j = 0; j < enEls.length; j++) {
    enEls[j].hidden = isFr;
  }

})();
