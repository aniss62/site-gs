#!/usr/bin/env python3
"""Construit l'index de la recherche du site : site/assets/data/search-index.json

Parcourt toutes les pages HTML de site/, découpe chaque page en rubriques
(un bloc par titre h1-h4), récupère le texte en français ET en anglais
(via les clés data-i18n et les fichiers assets/i18n/*.json) et ajoute les
articles de assets/data/news.json.

À relancer après chaque modification du contenu du site :
    python3 equipment/build_search_index.py
"""
import glob
import html
import json
import os
import re
import sys
from html.parser import HTMLParser

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'site')
VOID = {'br', 'img', 'input', 'meta', 'link', 'hr', 'source', 'area', 'base', 'col', 'embed', 'wbr'}
SKIP = {'script', 'style', 'noscript', 'svg', 'head', 'template'}
HEADINGS = {'h1', 'h2', 'h3', 'h4'}

with open(os.path.join(ROOT, 'assets/i18n/fr.json'), encoding='utf-8') as f:
    FR = json.load(f)
with open(os.path.join(ROOT, 'assets/i18n/en.json'), encoding='utf-8') as f:
    EN = json.load(f)


def lookup(d, key):
    for part in key.split('.'):
        if not isinstance(d, dict) or part not in d:
            return None
        d = d[part]
    return d if isinstance(d, str) else None


def clean(t):
    t = re.sub(r'</?[a-zA-Z][^>]*>', ' ', t)   # seulement les vraies balises (pas « < 4 mm »)
    return re.sub(r'\s+', ' ', html.unescape(t)).strip()


class Page(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack = []          # (tag, flags)
        self.blocks = []         # blocs : dict(anchor, fr, en, tfr, ten)
        self.title_fr = self.title_en = ''
        self.section_id = None
        self.cur = None
        self.i18n = None         # (clé, profondeur, texte de secours)
        self.in_title = False
        self.new_block(None, '', '')

    def new_block(self, anchor, fr, en):
        self.cur = {'anchor': anchor, 'fr': fr, 'en': en, 'tfr': [], 'ten': []}
        self.blocks.append(self.cur)

    def lang_flag(self):
        for _, fl in reversed(self.stack):
            if fl.get('lang'):
                return fl['lang']
        return None

    def skipping(self):
        return any(t in SKIP or fl.get('hidden_attr') for t, fl in self.stack)

    def add(self, fr, en):
        if fr:
            self.cur['tfr'].append(fr)
        if en:
            self.cur['ten'].append(en)

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'title':
            self.in_title = True
        fl = {}
        cls = (a.get('class') or '').split()
        if 'fr-text' in cls:
            fl['lang'] = 'fr'
        if 'en-text' in cls:
            fl['lang'] = 'en'
        if 'skip-link' in cls:
            fl['hidden_attr'] = True
        if tag in ('section', 'article', 'header') and a.get('id'):
            self.section_id = a['id']
        if tag not in VOID:
            self.stack.append((tag, fl))
        if self.skipping():
            return
        if tag in HEADINGS:
            anchor = a.get('id') or self.section_id
            self.new_block(anchor, '', '')
            fl['heading'] = True
        key = a.get('data-i18n')
        if key and self.i18n is None and tag not in VOID:
            self.i18n = {'key': key, 'depth': len(self.stack), 'fallback': []}
        if tag in ('img',) and a.get('alt') and not self.skipping():
            self.add(clean(a['alt']), clean(a['alt']))

    def handle_endtag(self, tag):
        if tag == 'title':
            self.in_title = False
        if self.i18n and len(self.stack) == self.i18n['depth'] and self.stack and self.stack[-1][0] == tag:
            key = self.i18n['key']
            fb = clean(' '.join(self.i18n['fallback']))
            fr = clean(lookup(FR, key) or fb)
            en = clean(lookup(EN, key) or fb)
            heading = any(fl.get('heading') for _, fl in self.stack)
            self.emit(fr, en, heading)
            self.i18n = None
        if self.stack:
            # dépile jusqu'à la balise correspondante
            for i in range(len(self.stack) - 1, -1, -1):
                if self.stack[i][0] == tag:
                    del self.stack[i:]
                    break

    def emit(self, fr, en, heading):
        if heading and not self.cur['tfr'] and not self.cur['ten']:
            # titre composé de plusieurs fragments (ex. « 15 » + « pays. Un seul standard. »)
            self.cur['fr'] = (self.cur['fr'] + ' ' + fr).strip()
            self.cur['en'] = (self.cur['en'] + ' ' + en).strip()
        else:
            self.add(fr, en)

    def handle_data(self, data):
        if self.in_title:
            t = clean(data)
            if t:
                self.title_fr = self.title_fr or t.split('|')[0].strip()
            return
        if self.skipping():
            return
        t = clean(data)
        if not t:
            return
        if self.i18n is not None:
            self.i18n['fallback'].append(t)
            return
        lang = self.lang_flag()
        heading = any(fl.get('heading') for _, fl in self.stack)
        fr = t if lang in (None, 'fr') else ''
        en = t if lang in (None, 'en') else ''
        self.emit(fr, en, heading)


def page_title(path, parser):
    return parser.title_fr


MOIS_FR = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']
MOIS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']


def dates(iso):
    m = re.match(r'(\d{4})-(\d{2})-(\d{2})', iso or '')
    if not m:
        return '', ''
    y, mo, d = int(m.group(1)), int(m.group(2)), int(m.group(3))
    return '%d %s %d' % (d, MOIS_FR[mo - 1], y), '%s %d, %d' % (MOIS_EN[mo - 1], d, y)


def main():
    entries = []
    files = sorted(glob.glob(os.path.join(ROOT, '*.html')) + glob.glob(os.path.join(ROOT, 'products', '*.html')))
    for path in files:
        rel = os.path.relpath(path, ROOT).replace(os.sep, '/')
        with open(path, encoding='utf-8') as f:
            raw = f.read()
        p = Page()
        p.feed(raw)
        # titre de page : clé du H1 si possible
        h1 = re.search(r'<h1[^>]*data-i18n="([^"]+)"', raw)
        t_fr = clean(lookup(FR, h1.group(1))) if h1 and lookup(FR, h1.group(1)) else p.title_fr
        t_en = clean(lookup(EN, h1.group(1))) if h1 and lookup(EN, h1.group(1)) else p.title_fr
        for b in p.blocks:
            fr_text = clean(' '.join(dict.fromkeys(b['tfr'])))
            en_text = clean(' '.join(dict.fromkeys(b['ten'])))
            if not (b['fr'] or fr_text or en_text):
                continue
            entries.append({
                'p': rel,
                'a': b['anchor'] or '',
                'pf': t_fr, 'pe': t_en,
                'hf': b['fr'] or t_fr, 'he': b['en'] or t_en,
                'tf': fr_text, 'te': en_text,
            })
    # actualités
    try:
        with open(os.path.join(ROOT, 'assets/data/news.json'), encoding='utf-8') as f:
            news = json.load(f)
        arts = news if isinstance(news, list) else news.get('articles', [])
        for n in arts:
            base = clean(' '.join(filter(None, [n.get('source'), n.get('summary'), n.get('content')])))
            fr_d, en_d = dates(n.get('published'))
            entries.append({'p': 'news.html', 'a': '', 'pf': 'Actualités', 'pe': 'News',
                            'hf': clean(n.get('title', '')), 'he': clean(n.get('title', '')),
                            'tf': (fr_d + ' ' + base)[:640].strip(), 'te': (en_d + ' ' + base)[:640].strip()})
    except FileNotFoundError:
        pass
    out = os.path.join(ROOT, 'assets/data/search-index.json')
    with open(out, 'w', encoding='utf-8') as f:
        json.dump(entries, f, ensure_ascii=False, separators=(',', ':'))
    print('%d entrées, %d Ko -> %s' % (len(entries), os.path.getsize(out) // 1024, os.path.relpath(out)))


if __name__ == '__main__':
    sys.exit(main())
