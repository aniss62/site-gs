#!/usr/bin/env node
// Local equivalent of fetch-news.php — uses Node.js to test news fetching
// Run: node equipment/fetch-news-local.js

const https = require('https');
const fs = require('fs');
const path = require('path');

const OUTPUT = path.join(__dirname, '../site/assets/data/news.json');

const RSS_FEEDS = [
  {
    url: 'https://news.google.com/rss/search?q=caroube+carob+maroc+agriculture&hl=fr&gl=MA&ceid=MA:fr',
    lang: 'fr'
  },
  {
    url: 'https://news.google.com/rss/search?q=carob+legumes+morocco+agriculture+export&hl=en&gl=US&ceid=US:en',
    lang: 'en'
  }
];

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function extractTag(block, tag) {
  const cdataMatch = block.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`));
  if (cdataMatch) return cdataMatch[1];
  const plainMatch = block.match(new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`));
  return plainMatch ? plainMatch[1] : '';
}

function parseRSS(xml, lang) {
  const articles = [];
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];

  for (const m of items) {
    const item = m[1];
    const title = extractTag(item, 'title');
    const link = extractTag(item, 'link');
    const pubDate = extractTag(item, 'pubDate');
    const source = extractTag(item, 'source') || 'Google News';
    const desc = extractTag(item, 'description');

    const summary = desc.replace(/<[^>]+>/g, '').substring(0, 150).trim();
    const published = pubDate
      ? new Date(pubDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];

    if (title && link) {
      articles.push({ title: title.trim(), source: source.trim(), url: link.trim(), published, summary, lang });
    }
  }

  return articles.slice(0, 20);
}

async function main() {
  console.log('Fetching news...');
  const all = [];

  for (const feed of RSS_FEEDS) {
    try {
      const xml = await fetchUrl(feed.url);
      const articles = parseRSS(xml, feed.lang);
      console.log(`  ${feed.lang}: ${articles.length} articles`);
      all.push(...articles);
    } catch (err) {
      console.error(`  Failed to fetch ${feed.url}: ${err.message}`);
    }
  }

  all.sort((a, b) => b.published.localeCompare(a.published));

  const output = {
    updated_at: new Date().toISOString(),
    articles: all
  };

  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, JSON.stringify(output, null, 2));
  console.log(`Written ${all.length} articles to ${OUTPUT}`);
}

main().catch(console.error);
