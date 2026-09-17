# Blueprint 06 — Agentnews (veille hebdomadaire assistée par IA)

## Objectif
Chaque semaine, informer le propriétaire du site de l'actualité pertinente pour l'activité (caroube, légumineuses, aliment de bétail, céréales, et tous les produits du site) via un résumé rédigé, ET proposer un article précis à publier sur le site — sans dépendre d'une clé API IA côté serveur : la recherche et la rédaction sont faites par l'agent Claude Code lui-même (routine programmée), et la publication sur le site nécessite une validation humaine par email.

## Pourquoi pas côté serveur
Une tentative précédente ajoutait une IA côté PHP (sélection + rédaction via l'API Anthropic, espace de gestion à lien signé) — abandonnée faute de `ANTHROPIC_API_KEY`. Agentnews évite ce blocage : il n'y a aucun appel API à héberger, aucune clé à gérer, aucun nouveau code PHP/JS. L'« IA » est l'agent qui exécute la routine ; le site ne change pas de mécanisme de publication (toujours `site/assets/data/news.json`, toujours le déploiement FTP existant).

## Architecture

```
Routine programmée "agentnews" (cloud, hebdomadaire, ex. lundi 8h UTC)
  1. Lit site/assets/data/news.json → titres/URLs existants (dédup)
  2. Cherche dans Gmail le fil « Agentnews — proposition » de la semaine
     précédente et regarde s'il y a une réponse
       → réponse positive (contient "oui" / "yes" / "publie" / "go")
         → ajoute l'article proposé en pinned dans news.json (FR + EN),
           commit + push sur main → déclenche deploy.yml (FTP)
       → pas de réponse sous 7 jours, ou réponse négative
         → rien n'est publié, le candidat est abandonné
  3. Recherche web (WebSearch) sur tous les thèmes ci-dessous (produits
     existants + futures lignes de produits), écarte les doublons
     (titre/URL déjà dans news.json ou déjà proposés/refusés dans un
     fil Gmail récent)
  4. À partir de cette recherche, produit DEUX choses distinctes :
     a. Un résumé hebdomadaire (≈500 mots FR + ≈500 mots EN) de
        l'actualité trouvée, tous thèmes confondus, avec la liste des
        sources (nom + lien) en bas, à titre de vérification
     b. UN article précis choisi pour la proposition de publication
        sur le site (résumé court FR + résumé court EN, comme avant)
  5. Envoie un seul email (Gmail MCP) au propriétaire du site contenant
     les deux sections : le résumé hebdomadaire, puis la proposition
     de publication avec sa consigne de validation
```

Aucun fichier du dépôt n'est modifié par les étapes 3-5 : seule une validation positive (étape 2) touche `news.json`.

## Thèmes de recherche

| Catégorie | Mots-clés |
|---|---|
| Produits existants | caroube / carob, gomme de caroube (E410, locust bean gum), farine de caroube (carob flour/powder), pulpe de caroube (carob pulp), légumineuses (lentilles, pois chiches, fèves, haricots, pois secs) |
| Futures lignes de produits | aliment de bétail / animal feed (tourteaux, mélasse, compléments énergétiques bovins/ovins/caprins/volaille), céréales / cereals (blé, orge, maïs — import-export, cours mondiaux, récoltes Maroc) |
| Marché / secteur | export agroalimentaire Maroc, filière caroubier marocaine, réglementation export agricole Maroc/UE, salons professionnels (SIAL, Anuga, Gulfood), tendances substituts du cacao et ingrédients sans gluten |

Les « futures lignes de produits » sont traitées à égalité avec les produits déjà présents sur le site : elles n'ont pas encore de page dédiée, mais l'activité de l'entreprise les couvre déjà.

## Format de l'email

Un seul email par semaine, sujet fixe (inchangé pour que la recherche Gmail de l'étape 2 continue de fonctionner) : `Agentnews — proposition de la semaine du YYYY-MM-DD`.

Le corps contient deux sections distinctes :

**1. Résumé hebdomadaire** — un résumé rédigé (pas une simple liste de liens) d'environ 500 mots en français, puis d'environ 500 mots en anglais, couvrant l'actualité trouvée pour tous les thèmes ci-dessus (produits existants, futures lignes de produits, marché/secteur). En bas de chaque résumé, la liste des sources citées (nom du média + lien), présentée explicitement comme *« sources, à titre de vérification »* — ce ne sont pas des liens à valider ou sur lesquels agir, juste une référence.

**2. Proposition de la semaine** — inchangé : titre de l'article choisi, source, lien, date de publication, résumé FR (≈200 caractères), résumé EN (≈200 caractères), et en clair : *« Répondez OUI à cet email pour publier cette actualité sur le site, ou ignorez ce message pour passer cette semaine. »*

## Règle de validation et de dédoublonnage

- L'agent recherche dans Gmail un fil dont le sujet commence par `Agentnews — proposition` et regarde s'il contient une réponse envoyée après l'email de proposition.
- Réponse contenant un mot positif (oui, yes, publie, go, ok) → validée.
- Absence de réponse après 7 jours, ou réponse négative/autre → le candidat est abandonné, il n'est pas republié automatiquement la semaine suivante (l'agent garde en mémoire, via l'historique Gmail, les titres/URL déjà proposés pour ne pas les reproposer).
- Avant de proposer un nouvel article, l'agent vérifie qu'il ne figure pas déjà dans `news.json` (pinned ou RSS) par titre normalisé, comme le fait `fetch-news.php`.

## Ajout à `news.json`

Un article validé devient **deux entrées pinned**, une par langue (c'est le schéma déjà utilisé par les articles pinned existants — chaque entrée a un seul champ `lang`, pas de contenu bilingue dans un seul objet) :

```json
{ "title": "Titre en français", "source": "...", "published": "YYYY-MM-DD", "summary": "Résumé FR", "lang": "fr", "pinned": true }
{ "title": "English title",     "source": "...", "published": "YYYY-MM-DD", "summary": "EN summary",  "lang": "en", "pinned": true }
```

Le champ `image` est **optionnel** — `main.js` (l.185, 218) et le rendu des cards gèrent déjà son absence. Agentnews ne télécharge ni ne génère d'image. À la place, avant d'ajouter l'article, l'agent vérifie si l'une des images déjà présentes dans `site/assets/images/` (`news-caroube-marche.jpg`, `news-legumineuses-fao.jpg`, `news-farine-caroube.jpg`, `news-siam.jpg`, `news-japon.jpg`, `news-cosmetique.jpg`) correspond clairement au thème de l'article (ex. un article sur la caroube → une image caroube). Si une correspondance nette existe, il réutilise son chemin dans le champ `image` (même image pour les deux entrées FR/EN). Sinon, il omet le champ `image` — pas d'image approximative, pas de nouvelle image générée ou téléchargée.

## Limites et prérequis

- Aucune clé API externe requise : la recherche et la rédaction sont faites par l'agent lui-même.
- Nécessite le connecteur **Gmail MCP** connecté sur le compte Claude (claude.ai/customize/connectors) — utilisé à la fois pour lire les réponses et envoyer les propositions.
- La routine cloud a son propre checkout git du dépôt `aniss62/site-gs` et doit pouvoir y pousser (accès en écriture sur `main`).
- Cadence minimale d'une routine programmée : 1 heure — l'hebdomadaire est très confortable.
- La routine cloud ne peut pas lire le `.env` local ni aucun fichier de la machine : tout ce dont elle a besoin vient de Gmail, du web, ou du contenu du dépôt git.

## Mettre en place la routine

1. Vérifier que le connecteur Gmail est actif sur le compte Claude.
2. Utiliser `/schedule` pour créer la routine : dépôt `aniss62/site-gs`, cron hebdomadaire (ex. `0 8 * * 1`, soit lundi 8h UTC — après le pipeline RSS existant qui tourne à 6h UTC), connecteur Gmail attaché, prompt reprenant les 5 étapes de l'Architecture ci-dessus.
3. Lancer la routine une première fois manuellement (`RemoteTrigger` action `run`, ou depuis claude.ai/code/routines) pour vérifier que l'email de proposition arrive correctement.

## Tester

- Déclenchement manuel de la routine → vérifier réception de l'email (sujet, résumé hebdomadaire FR/EN ≈500 mots avec sources en bas, puis section proposition avec titre/source/lien).
- Répondre « OUI » → relancer la routine (ou attendre le prochain cycle) → vérifier que `news.json` contient les deux nouvelles entrées pinned et qu'un commit a été poussé sur `main`.
- Ne pas répondre → vérifier qu'aucun commit n'est fait et qu'un nouveau candidat différent est proposé la semaine suivante.
