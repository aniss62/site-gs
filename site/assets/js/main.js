/* ============================================================
   main.js — Nav mobile, scroll effects, news loader, counter
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initActiveLink();
  initCounters();
  initNewsLoader();
  initScrollReveal();
});

/* ── Nav scroll shadow ──────────────────────────────────────── */
function initNavbar() {
  const nav = document.querySelector('.nav');
  if (!nav) return;

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });
}

/* ── Active nav link (géré par nav.js — stub vide) ──────────── */
function initActiveLink() {}

/* ── Animated counters ──────────────────────────────────────── */
function initCounters() {
  const counters = document.querySelectorAll('[data-counter]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.counter, 10);
      const duration = 1600;
      const start = performance.now();

      function update(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target) + (el.dataset.suffix || '');
        if (progress < 1) requestAnimationFrame(update);
      }

      requestAnimationFrame(update);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
}

/* ── News loader ────────────────────────────────────────────── */
function initNewsLoader() {
  const grid = document.getElementById('news-grid');
  const teaser = document.getElementById('news-teaser');
  const updatedEl = document.getElementById('news-updated');

  if (!grid && !teaser) return;

  const base = document.querySelector('meta[name="base-url"]')?.content || '';
  fetch(`${base}/assets/data/news.json`)
    .then(r => r.ok ? r.json() : Promise.reject(r.status))
    .then(data => {
      const articles = data.articles || [];

      if (updatedEl && data.updated_at) {
        const d = new Date(data.updated_at);
        updatedEl.textContent = d.toLocaleDateString(I18N.currentLang() === 'en' ? 'en-GB' : 'fr-FR', {
          day: 'numeric', month: 'long', year: 'numeric'
        });
      }

      if (teaser) {
        renderNewsCards(teaser, articles.slice(0, 3));
      }

      if (grid) {
        if (articles.length === 0) {
          grid.textContent = I18N.get('news.empty');
        } else {
          renderNewsCards(grid, articles);
        }
      }
    })
    .catch(() => {
      if (grid) grid.textContent = I18N.get('news.error');
    });
}

function initNewsModal() {
  if (document.getElementById('news-modal')) return;

  const modal = document.createElement('div');
  modal.id = 'news-modal';
  modal.className = 'news-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'nm-title');

  const backdrop = document.createElement('div');
  backdrop.className = 'news-modal__backdrop';

  const box = document.createElement('div');
  box.className = 'news-modal__box';

  const closeBtn = document.createElement('button');
  closeBtn.className = 'news-modal__close';
  closeBtn.setAttribute('aria-label', 'Fermer');
  closeBtn.textContent = '✕';

  const img = document.createElement('img');
  img.id = 'nm-img';
  img.className = 'news-modal__img';
  img.alt = '';

  const content = document.createElement('div');
  content.className = 'news-modal__content';

  const sourceEl = document.createElement('span');
  sourceEl.id = 'nm-source';
  sourceEl.className = 'news-card__source';

  const titleEl = document.createElement('h3');
  titleEl.id = 'nm-title';

  const dateEl = document.createElement('span');
  dateEl.id = 'nm-date';
  dateEl.className = 'news-modal__date';

  const summaryEl = document.createElement('p');
  summaryEl.id = 'nm-summary';

  content.appendChild(sourceEl);
  content.appendChild(titleEl);
  content.appendChild(dateEl);
  content.appendChild(summaryEl);

  box.appendChild(closeBtn);
  box.appendChild(img);
  box.appendChild(content);

  modal.appendChild(backdrop);
  modal.appendChild(box);
  document.body.appendChild(modal);

  const close = () => {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  };
  closeBtn.addEventListener('click', close);
  backdrop.addEventListener('click', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
}

function openNewsModal(article) {
  const modal = document.getElementById('news-modal');
  const img = document.getElementById('nm-img');
  document.getElementById('nm-source').textContent = article.source || '';
  document.getElementById('nm-title').textContent = article.title || '';
  document.getElementById('nm-date').textContent = article.published || '';
  document.getElementById('nm-summary').textContent = article.summary || '';
  if (article.imgSrc) {
    img.src = article.imgSrc;
    img.alt = article.title || '';
    img.style.display = '';
  } else {
    img.style.display = 'none';
  }
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function renderNewsCards(container, articles) {
  initNewsModal();
  container.textContent = '';
  const base = (document.querySelector('meta[name="base-url"]')?.content || '').replace(/\/$/, '');

  articles.forEach(article => {
    const card = document.createElement('article');
    card.className = 'news-card';

    if (article.image) {
      const imgWrap = document.createElement('div');
      imgWrap.className = 'news-card__img';
      const img = document.createElement('img');
      img.src = base ? base + '/' + article.image : article.image;
      img.alt = article.title || '';
      img.loading = 'lazy';
      imgWrap.appendChild(img);
      card.appendChild(imgWrap);
    }

    const body = document.createElement('div');
    body.className = 'news-card__body';

    const source = document.createElement('div');
    source.className = 'news-card__source';
    source.textContent = article.source || '';

    const title = document.createElement('h4');
    title.textContent = article.title || '';

    const summary = document.createElement('p');
    summary.textContent = article.summary || '';

    const footer = document.createElement('div');
    footer.className = 'news-card__footer';

    const date = document.createElement('span');
    date.textContent = article.published || '';

    const btn = document.createElement('button');
    btn.className = 'news-card__link';
    btn.textContent = (I18N.get('news.read_more') || 'Lire la suite') + ' →';
    const imgSrc = article.image ? (base ? base + '/' + article.image : article.image) : '';
    btn.addEventListener('click', () => openNewsModal({ ...article, imgSrc }));

    footer.appendChild(date);
    footer.appendChild(btn);

    body.appendChild(source);
    body.appendChild(title);
    body.appendChild(summary);
    body.appendChild(footer);
    card.appendChild(body);
    container.appendChild(card);
  });
}

/* ── Scroll reveal ──────────────────────────────────────────── */
function initScrollReveal() {
  const els = document.querySelectorAll('[data-reveal]');
  if (!els.length) return;

  const style = document.createElement('style');
  style.textContent = `
    [data-reveal] { opacity: 0; transform: translateY(24px); transition: opacity .55s ease, transform .55s ease; }
    [data-reveal].revealed { opacity: 1; transform: none; }
  `;
  document.head.appendChild(style);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => observer.observe(el));
}
