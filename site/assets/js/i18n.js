/* ============================================================
   i18n.js — Bilingual FR/EN system
   ============================================================ */

const I18N = (() => {
  let translations = {};
  let currentLang = 'fr';

  function detectLang() {
    const stored = localStorage.getItem('gs_lang');
    if (stored === 'fr' || stored === 'en') return stored;
    const browser = (navigator.language || navigator.userLanguage || 'fr').substring(0, 2).toLowerCase();
    return browser === 'en' ? 'en' : 'fr';
  }

  async function loadTranslations(lang) {
    const base = document.querySelector('meta[name="base-url"]')?.content || '';
    const url = `${base}/assets/i18n/${lang}.json`;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn(`[i18n] Failed to load ${lang}.json`, e);
      return {};
    }
  }

  function get(key) {
    const parts = key.split('.');
    let val = translations;
    for (const p of parts) {
      if (val == null) return key;
      val = val[p];
    }
    return val != null ? val : key;
  }

  function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      const text = get(key);
      if (text && text !== key) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = text;
        } else {
          el.textContent = text;
        }
      }
    });

    document.querySelectorAll('[data-i18n-attr]').forEach(el => {
      const pairs = el.dataset.i18nAttr.split(',');
      for (const pair of pairs) {
        const [attr, key] = pair.trim().split(':');
        const text = get(key.trim());
        if (text && text !== key.trim()) el.setAttribute(attr.trim(), text);
      }
    });

    document.documentElement.lang = currentLang;
    document.querySelectorAll('.lang-switcher button').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === currentLang);
    });
  }

  async function setLang(lang) {
    if (lang !== 'fr' && lang !== 'en') return;
    currentLang = lang;
    localStorage.setItem('gs_lang', lang);
    translations = await loadTranslations(lang);
    applyTranslations();
  }

  async function init() {
    currentLang = detectLang();
    translations = await loadTranslations(currentLang);
    applyTranslations();

    document.querySelectorAll('.lang-switcher button').forEach(btn => {
      btn.addEventListener('click', () => setLang(btn.dataset.lang));
    });
  }

  return { init, setLang, get, currentLang: () => currentLang };
})();

document.addEventListener('DOMContentLoaded', () => I18N.init());
