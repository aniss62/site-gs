/* ============================================================
   components.js — Injects shared navbar and footer into every page
   ============================================================ */

(function () {
  const BASE = document.querySelector('meta[name="base-url"]')?.content || '';

  /* ── Navbar HTML ─────────────────────────────────────────── */
  const navbarHTML = `
<nav class="navbar" role="navigation" aria-label="Navigation principale">
  <div class="navbar__inner">
    <a href="${BASE}/index.html" class="navbar__logo" aria-label="Les Greniers du Saïss — Accueil">
      <img src="${BASE}/assets/images/logo/logo.png" alt="Les Greniers du Saïss" onerror="this.style.display='none'">
      <div class="navbar__logo-text">Les Greniers<span>du Saïss</span></div>
    </a>

    <ul class="navbar__nav" role="list">
      <li><a href="${BASE}/index.html" data-i18n="nav.home">Accueil</a></li>
      <li><a href="${BASE}/about.html" data-i18n="nav.about">À propos</a></li>
      <li class="navbar__dropdown">
        <button class="navbar__dropdown-trigger" aria-haspopup="true" aria-expanded="false">
          <span data-i18n="nav.products">Produits</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <ul class="navbar__dropdown-menu" role="list">
          <li><a href="${BASE}/products/caroube-brute.html"><span class="dot"></span><span data-i18n="nav.products_sub.carob_raw">Caroube brute</span></a></li>
          <li><a href="${BASE}/products/graines-caroube.html"><span class="dot"></span><span data-i18n="nav.products_sub.carob_seeds">Graines de caroube</span></a></li>
          <li><a href="${BASE}/products/pulpe-caroube.html"><span class="dot"></span><span data-i18n="nav.products_sub.carob_pulp">Pulpe de caroube</span></a></li>
          <li><a href="${BASE}/products/farine-caroube.html"><span class="dot"></span><span data-i18n="nav.products_sub.carob_flour">Farine de caroube</span></a></li>
          <li><a href="${BASE}/products/legumineuses.html"><span class="dot"></span><span data-i18n="nav.products_sub.legumes">Légumineuses</span></a></li>
        </ul>
      </li>
      <li><a href="${BASE}/applications.html" data-i18n="nav.applications">Applications</a></li>
      <li><a href="${BASE}/durabilite.html" data-i18n="nav.sustainability">Durabilité</a></li>
      <li><a href="${BASE}/qualite.html" data-i18n="nav.quality">Qualité</a></li>
      <li><a href="${BASE}/news.html" data-i18n="nav.news">Actualités</a></li>
    </ul>

    <div class="navbar__right">
      <div class="lang-switcher" aria-label="Sélecteur de langue">
        <button data-lang="fr" aria-label="Français">FR</button>
        <button data-lang="en" aria-label="English">EN</button>
      </div>
      <a href="${BASE}/contact.html" class="btn btn-gold hide-mobile" data-i18n="nav.quote">Demander un devis</a>
      <button class="navbar__hamburger" aria-label="Menu" aria-expanded="false" aria-controls="mobile-nav">
        <span></span><span></span><span></span>
      </button>
    </div>
  </div>

  <!-- Mobile nav -->
  <div class="navbar__mobile" id="mobile-nav" role="navigation" aria-label="Navigation mobile">
    <div class="navbar__mobile-section-title" data-i18n="nav.products">Produits</div>
    <a href="${BASE}/products/caroube-brute.html" data-i18n="nav.products_sub.carob_raw">Caroube brute</a>
    <a href="${BASE}/products/graines-caroube.html" data-i18n="nav.products_sub.carob_seeds">Graines de caroube</a>
    <a href="${BASE}/products/pulpe-caroube.html" data-i18n="nav.products_sub.carob_pulp">Pulpe de caroube</a>
    <a href="${BASE}/products/farine-caroube.html" data-i18n="nav.products_sub.carob_flour">Farine de caroube</a>
    <a href="${BASE}/products/legumineuses.html" data-i18n="nav.products_sub.legumes">Légumineuses</a>
    <div class="navbar__mobile-section-title">Pages</div>
    <a href="${BASE}/index.html" data-i18n="nav.home">Accueil</a>
    <a href="${BASE}/about.html" data-i18n="nav.about">À propos</a>
    <a href="${BASE}/applications.html" data-i18n="nav.applications">Applications</a>
    <a href="${BASE}/durabilite.html" data-i18n="nav.sustainability">Durabilité</a>
    <a href="${BASE}/qualite.html" data-i18n="nav.quality">Qualité</a>
    <a href="${BASE}/news.html" data-i18n="nav.news">Actualités</a>
    <a href="${BASE}/contact.html" class="mobile-cta btn btn-gold" data-i18n="nav.quote">Demander un devis</a>
    <div style="padding:.75rem .5rem; display:flex; gap:.5rem; align-items:center;">
      <div class="lang-switcher"><button data-lang="fr">FR</button><button data-lang="en">EN</button></div>
    </div>
  </div>
</nav>`;

  /* ── Footer HTML ─────────────────────────────────────────── */
  const footerHTML = `
<footer class="footer" role="contentinfo">
  <div class="footer__grid">
    <div class="footer__brand">
      <img src="${BASE}/assets/images/logo/logo.png" alt="Les Greniers du Saïss" onerror="this.style.display='none'">
      <p data-i18n="footer.tagline">Exportateurs de produits de caroube et légumineuses de qualité supérieure depuis la région du Saïss, Maroc.</p>
      <div class="footer__social" aria-label="Réseaux sociaux">
        <a href="#" aria-label="LinkedIn" title="LinkedIn">in</a>
        <a href="#" aria-label="Email" title="Email">@</a>
      </div>
    </div>
    <div class="footer__col">
      <h4 data-i18n="footer.nav_title">Navigation</h4>
      <ul>
        <li><a href="${BASE}/index.html" data-i18n="nav.home">Accueil</a></li>
        <li><a href="${BASE}/about.html" data-i18n="nav.about">À propos</a></li>
        <li><a href="${BASE}/applications.html" data-i18n="nav.applications">Applications</a></li>
        <li><a href="${BASE}/durabilite.html" data-i18n="nav.sustainability">Durabilité</a></li>
        <li><a href="${BASE}/qualite.html" data-i18n="nav.quality">Qualité</a></li>
        <li><a href="${BASE}/news.html" data-i18n="nav.news">Actualités</a></li>
        <li><a href="${BASE}/contact.html" data-i18n="nav.contact">Contact</a></li>
      </ul>
    </div>
    <div class="footer__col">
      <h4 data-i18n="footer.contact_title">Contact</h4>
      <div class="footer__contact-item">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        <span>LOT 60, Quartier Industriel Ouafae, Bensouda - 30006 Fès, Maroc</span>
      </div>
      <div class="footer__contact-item">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
        <a href="mailto:Office@lesgreniersdusaiss.ma">Office@lesgreniersdusaiss.ma</a>
      </div>
      <div class="footer__contact-item">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l.81-.81a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0 1 22 16.92z"/></svg>
        <a href="tel:+212535729082">+212 5 35 72 90 82</a>
      </div>
    </div>
  </div>
  <div class="footer__bottom">
    <span>© ${new Date().getFullYear()} Les Greniers du Saïss. <span data-i18n="footer.rights">Tous droits réservés.</span></span>
    <span data-i18n="footer.made_in">Fabriqué au Maroc</span>
  </div>
</footer>`;

  /* ── Inject ──────────────────────────────────────────────── */
  function inject() {
    const navPlaceholder = document.getElementById('navbar-placeholder');
    const footerPlaceholder = document.getElementById('footer-placeholder');

    if (navPlaceholder) {
      const div = document.createElement('div');
      div.textContent = '';
      navPlaceholder.replaceWith(div);
      div.outerHTML = navbarHTML;
    } else {
      const div = document.createElement('div');
      div.textContent = '';
      document.body.prepend(div);
      div.outerHTML = navbarHTML;
    }

    if (footerPlaceholder) {
      const div = document.createElement('div');
      footerPlaceholder.replaceWith(div);
      div.outerHTML = footerHTML;
    } else {
      const div = document.createElement('div');
      document.body.appendChild(div);
      div.outerHTML = footerHTML;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
