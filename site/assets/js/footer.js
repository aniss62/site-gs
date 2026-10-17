/* ============================================================
   footer.js : bandeau "Contactez-nous" + footer partagés
   injectés dans #main-footer. IIFE: aucune variable globale.

   Note sécurité : le contenu injecté est 100% statique
   (chaînes hardcodées, aucune saisie utilisateur).
   ============================================================ */

(function () {
  'use strict';

  /* ── 1. Résoudre le root selon meta[name="base-url"] ───────── */
  var meta = document.querySelector('meta[name="base-url"]');
  var metaContent = (meta && meta.getAttribute('content')) ? meta.getAttribute('content') : '';
  var root = metaContent ? metaContent + '/' : '';

  function t(fr, en) {
    return '<span class="fr-text">' + fr + '</span><span class="en-text" hidden>' + en + '</span>';
  }

  /* Pas de bandeau contact sur la page contact elle-même */
  var onContactPage = /contact\.html$/.test(window.location.pathname);

  /* ── 2. Bandeau "Contactez-nous" ───────────────────────────── */
  var bandHTML = onContactPage ? '' :
      '<section class="getintouch" aria-labelledby="gitTitle">'
    +   '<div class="getintouch__inner">'
    +     '<div class="getintouch__text">'
    +       '<h2 id="gitTitle">' + t('Contactez-nous', 'Get in touch') + '</h2>'
    +       '<p>' + t(
              'Devis, échantillons, conditions d&rsquo;export : notre &eacute;quipe vous r&eacute;pond sous 24 h.',
              'Quotes, samples, export terms: our team replies within 24 hours.') + '</p>'
    +       '<a class="btn btn-primary" href="' + root + 'contact.html">' + t('Nous contacter', 'Contact us') + '</a>'
    +     '</div>'
    +   '</div>'
    + '</section>';

  /* ── 3. Footer en trois colonnes ───────────────────────────── */
  var footerHTML =
      '<footer class="ft">'
    +   '<div class="ft__inner">'

    +     '<div class="ft__col ft__col--lead">'
    +       '<h3>' + t('Suivez nos actualit&eacute;s du march&eacute; de la caroube et des l&eacute;gumineuses.', 'Follow our carob and legumes market news.') + '</h3>'
    +       '<a class="btn btn-outline" href="' + root + 'news.html">' + t('Voir les actualit&eacute;s', 'See the news') + '</a>'
    +     '</div>'

    +     '<nav class="ft__col ft__links" aria-label="Footer">'
    +       '<a href="' + root + 'about.html">' + t('&Agrave; propos', 'About') + '</a>'
    +       '<a href="' + root + 'qualite.html">' + t('Qualit&eacute;', 'Quality') + '</a>'
    +       '<a href="' + root + 'durabilite.html">' + t('Durabilit&eacute;', 'Sustainability') + '</a>'
    +       '<a href="' + root + 'news.html">' + t('Actualit&eacute;s', 'News') + '</a>'
    +       '<a href="' + root + 'contact.html">Contact</a>'
    +       '<a href="' + root + 'mentions-legales.html">' + t('Mentions l&eacute;gales', 'Legal notice') + '</a>'
    +       '<a href="' + root + 'confidentialite.html">' + t('Politique de confidentialit&eacute;', 'Privacy policy') + '</a>'
    +       '<a href="' + root + 'conditions.html">' + t('Conditions d&rsquo;utilisation', 'Terms of use') + '</a>'
    +     '</nav>'

    +     '<div class="ft__col ft__contact">'
    +       '<p class="ft__addr"><strong>Les Greniers du Sa&iuml;ss</strong><br>Lot 60, Q.I. Ouafae, Bensouda<br>F&egrave;s, ' + t('Maroc', 'Morocco') + '</p>'
    +       '<a class="ft__line" href="tel:+212535729082">'
    +         '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/></svg>'
    +         '+212 5 35 72 90 82</a>'
    +       '<a class="ft__line" href="mailto:Office@lesgreniersdusaiss.ma">'
    +         '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M21 3L3 10.5l7 3 3 7L21 3zM10 13.5L21 3"/></svg>'
    +         'Office@lesgreniersdusaiss.ma</a>'
    +     '</div>'

    +   '</div>'
    +   '<p class="ft__copy">&copy; 2026 Les Greniers du Sa&iuml;ss</p>'
    + '</footer>';

  /* ── 4. Injecter dans #main-footer ─────────────────────────── */
  var container = document.getElementById('main-footer');
  if (!container) { return; }
  container.innerHTML = bandHTML + footerHTML; // safe: 100% static hardcoded strings, no user input

  /* ── 5. Langue initiale (limitée au bloc injecté) ──────────── */
  var lang = localStorage.getItem('sitelang') || localStorage.getItem('gs_lang') || 'fr';
  var isFr = (lang === 'fr');
  var frEls = container.querySelectorAll('.fr-text');
  var enEls = container.querySelectorAll('.en-text');
  for (var i = 0; i < frEls.length; i++) frEls[i].hidden = !isFr;
  for (var j = 0; j < enEls.length; j++) enEls[j].hidden = isFr;

  /* ── 6. Assistant FAQ (chatbot) : chargé sur toutes les pages ── */
  var bot = document.createElement('script');
  bot.src = root + 'assets/js/chatbot.js';
  bot.defer = true;
  document.body.appendChild(bot);
})();
