# Blueprint 05 — Actualités automatiques (News)

## Objectif
Alimenter automatiquement la page News avec des articles récents sur la caroube, les céréales et les légumineuses, sans dépendre d'un cron côté hébergeur.

## Architecture

```
.github/workflows/update-news.yml (cron GitHub Actions, chaque lundi 6h UTC)
    → php site/fetch-news.php
        → Lit flux RSS Google News (caroube, carob, légumineuses)
        → Conserve les articles "pinned" en tête
        → Ajoute en dessous les 6 RSS les plus récents (dédoublonnés par titre)
        → Écrit site/assets/data/news.json
    → Commit si changement → déclenche .github/workflows/deploy.yml (FTP)

news.html (frontend)
    → Lit news.json via fetch() JS
    → Affiche les cards

index.html (teaser)
    → Affiche les derniers articles depuis news.json
```

## Sources RSS utilisées

| Source | URL | Langue |
|--------|-----|--------|
| Google News FR | `https://news.google.com/rss/search?q=caroube+carob+maroc+agriculture&hl=fr&gl=MA&ceid=MA:fr` | FR |
| Google News EN | `https://news.google.com/rss/search?q=carob+legumes+morocco+agriculture+export&hl=en&gl=US&ceid=US:en` | EN |

## Structure de news.json

```json
{
  "updated_at": "ISO8601 timestamp",
  "articles": [
    {
      "title": "Titre de l'article",
      "source": "Nom de la source",
      "published": "YYYY-MM-DD",
      "summary": "Résumé court (200 caractères max)",
      "lang": "fr",
      "pinned": true
    }
  ]
}
```

`pinned: true` : article éditorial fixe, toujours conservé en tête et jamais supprimé par `fetch-news.php`. Les autres articles viennent des flux RSS.

## Maintenance

- Articles RSS : 5 max par flux, 6 conservés au total (les plus récents), dédoublonnés par titre par rapport aux pinned
- Les pinned ne sont jamais retirés par le script ; ils sont relus depuis le `news.json` existant à chaque exécution
- Si un flux RSS est inaccessible, le script continue avec les autres et journalise l'erreur
- Logs dans `.tmp/news-fetch.log`

## Tester en local

```bash
php site/fetch-news.php
cat site/assets/data/news.json | head -50
```

## Tester sur GitHub Actions

Onglet **Actions** du repo → workflow « Mise à jour actualités » → **Run workflow** (déclenchement manuel sans attendre le lundi).

## Déclenchement manuel sur le serveur

```
https://votre-domaine.ma/fetch-news.php?token=<FETCH_NEWS_TOKEN du .env>
```
