# Blueprint 05 — Actualités automatiques (News)

## Objectif
Alimenter automatiquement la page News avec des articles récents sur la caroube, les céréales et les légumineuses.

## Architecture

```
fetch-news.php (cron toutes les 6h)
    → Lit flux RSS Google News (caroube, carob, légumineuses)
    → Agrège et trie par date
    → Écrit site/assets/data/news.json

news.html (frontend)
    → Lit news.json via fetch() JS
    → Affiche les cards

index.html (teaser)
    → Affiche les 3 derniers articles depuis news.json
```

## Sources RSS utilisées

| Source | URL | Langue |
|--------|-----|--------|
| Google News FR | `https://news.google.com/rss/search?q=caroube+OR+carob+maroc&hl=fr&gl=MA&ceid=MA:fr` | FR |
| Google News EN | `https://news.google.com/rss/search?q=carob+legumes+morocco+agriculture&hl=en&gl=US&ceid=US:en` | EN |

## Structure de news.json

```json
{
  "updated_at": "ISO8601 timestamp",
  "articles": [
    {
      "title": "Titre de l'article",
      "source": "Nom de la source",
      "url": "URL de l'article",
      "published": "YYYY-MM-DD",
      "summary": "Résumé court (150 chars max)",
      "lang": "fr"
    }
  ]
}
```

## Maintenance

- Les articles sont filtrés : max 20 par langue, soit 40 au total
- Le fichier est écrasé à chaque run (pas d'historique infini)
- Si le cron échoue, les anciens articles restent affichés
- Les logs sont dans `.tmp/news-cron.log`

## Tester localement

```bash
# Requiert Node.js
node equipment/fetch-news-local.js

# Vérifier le résultat
cat site/assets/data/news.json | head -50
```

## Tester sur le serveur

```bash
php fetch-news.php
# ou via navigateur avec token :
# https://domaine.ma/fetch-news.php?token=greniers2025
```
