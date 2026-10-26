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
         → publication SYSTÉMATIQUE et immédiate, sans délibération :
           ajoute l'article proposé en pinned dans news.json (FR + EN),
           commit + push sur main → déclenche deploy.yml (FTP). Dès
           qu'une réponse positive est détectée sur un fil pas encore
           traité — même un fil plus ancien que celui de la semaine
           immédiatement précédente, par exemple parce que la réponse
           est arrivée après la fin d'un cycle précédent — elle doit
           être publiée à ce passage, sans se demander si c'est le bon
           moment ni pourquoi ça n'a pas été fait plus tôt
       → pas de réponse sous 4 jours, ou réponse négative
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
        sur le site, avec DEUX textes FR + DEUX textes EN : un résumé
        court (≈200 caractères, affiché sur la carte de la page
        Actualités) et un texte complet (≈300-500 mots, affiché
        uniquement quand on clique sur « Lire la suite »)
  5. Envoie un seul email (Gmail MCP) au propriétaire du site contenant
     les deux sections : le résumé hebdomadaire, puis la proposition
     de publication avec sa consigne de validation
```

Aucun fichier du dépôt n'est modifié par les étapes 3-5 : seule une validation positive (étape 2) touche `news.json`.

## Publication automatique (routine horaire)

Depuis le 2026-10-19, la publication sur réponse n'est plus faite par la routine hebdomadaire (qui ne se réveille que le lundi 8h UTC : une réponse arrivée le lundi à 10h attendait une semaine, puis dépassait le délai de 4 jours) mais par une routine séparée, **`agentnews — publication sur reponse OUI`**, qui tourne **toutes les heures** (minute 17). Elle cherche les fils `Agentnews proposition` des 10 derniers jours (recherche par mots-clés, corbeille incluse), vérifie qu'une réponse positive d'un validateur autorisé est arrivée dans les 4 jours, que le titre FR n'est pas déjà dans `news.json` (anti-doublon), puis ajoute les deux entrées pinned, commit, pousse sur `main` et répond dans le fil. La publication suit donc un « OUI » d'au plus une heure.

La routine hebdomadaire ne fait plus que la veille et l'envoi de la proposition (étapes 3 à 5) ; elle ne modifie aucun fichier. Le format des blocs de l'email (`Titre (FR) :`, `Résumé court (FR) :`, `Texte complet (FR) :`, etc.) est relu tel quel par la routine de publication : ne pas le changer sans adapter celle-ci. Toute note de bas de mail doit figurer après la ligne « Répondez OUI ».

### Corrections de texte dans la réponse

Depuis le 2026-10-20, la réponse de validation peut corriger le texte à publier. Le mot de validation (oui, yes, publie, go, ok) est écrit en premier, puis, optionnellement, un ou plusieurs blocs étiquetés exactement comme dans le mail de proposition :

```
OUI

Texte complet (FR) :
Le texte corrigé, sur plusieurs paragraphes si besoin.
```

Variante plus simple : copier-coller **toute la section « Proposition de la semaine »** du mail (titres, résumés courts et textes complets FR et EN), la modifier directement, et la placer sous le « OUI ». Les lignes `Source :`, `Lien :`, `Date de publication :`, `Répondez OUI…` et toute note de bas de mail sont reconnues comme des terminateurs de bloc et ne passent jamais dans le texte publié. Un bloc collé identique à l'original n'est pas compté comme une correction.

Règles appliquées par la routine horaire :
- Un titre (`Titre (FR) :` / `Titre (EN) :`) tient sur une seule ligne : seule la première ligne est reprise.
- Seuls les 6 blocs `Titre (FR) :`, `Titre (EN) :`, `Résumé court (FR) :`, `Texte complet (FR) :`, `Résumé court (EN) :`, `Texte complet (EN) :` sont lus ; l'étiquette est tolérante à la casse, aux accents et à l'espace avant les deux-points.
- Un bloc va de son étiquette à l'étiquette suivante (ou à la fin du texte nouveau, avant la citation du mail d'origine). Il remplace le champ correspondant ; les champs non recopiés restent ceux du mail d'origine.
- Le texte corrigé est repris mot pour mot, sans reformulation. La source et la date ne sont pas modifiables.
- Le caractère positif de la réponse est jugé uniquement sur le texte situé avant la première étiquette : un « oui » ou « ok » dans un texte corrigé ne valide rien.
- Si plusieurs réponses positives existent dans le fil, la plus ancienne fait foi. La réponse de confirmation de la routine liste les champs corrigés.

## Fraîcheur des sources

Depuis le 2026-10-26, la règle s'applique au résumé hebdomadaire comme à la proposition (incident : un article FreshPlaza de juillet 2024 avait été présenté comme actualité de la semaine) :
- Toute source citée doit avoir une date de publication **vérifiée dans le corps de l'article** (« Publication date », date de l'article). La date affichée dans l'en-tête ou le bandeau d'une page (souvent celle du jour) et l'absence de date dans un résultat de recherche ne prouvent rien.
- Une source de plus de 30 jours est écartée du résumé. Si elle reste utile comme contexte, elle est signalée explicitement « plus ancien » avec sa date, et jamais présentée comme « cette semaine » ou « cette année ».
- Dans la liste des sources en bas du résumé, chaque source porte sa date de publication.
- L'article de la proposition a moins de 30 jours, sans exception.

## Thèmes de recherche

| Catégorie | Mots-clés |
|---|---|
| Produits existants | caroube / carob, gomme de caroube (E410, locust bean gum), pulpe de caroube (carob pulp), légumineuses (lentilles, pois chiches, fèves, haricots, pois secs) |
| Futures lignes de produits | aliment de bétail / animal feed (tourteaux, mélasse, compléments énergétiques bovins/ovins/caprins/volaille), céréales / cereals (blé, orge, maïs — import-export, cours mondiaux, récoltes Maroc) |
| Marché / secteur | export agroalimentaire Maroc, filière caroubier marocaine, réglementation export agricole Maroc/UE, salons professionnels (SIAL, Anuga, Gulfood), tendances substituts du cacao et ingrédients sans gluten |

Les « futures lignes de produits » sont traitées à égalité avec les produits déjà présents sur le site : elles n'ont pas encore de page dédiée, mais l'activité de l'entreprise les couvre déjà.

## Format de l'email

Un seul email par semaine, sujet fixe (inchangé pour que la recherche Gmail de l'étape 2 continue de fonctionner) : `Agentnews — proposition de la semaine du YYYY-MM-DD`.

**Destinataires** : à `anisssebbane@gmail.com`, en copie (CC) `Office@lesgreniersdusaiss.ma` (l'adresse officielle du site, déjà utilisée comme `SMTP_TO`/`SMTP_FROM` dans `contact.php` et affichée en contact sur le site). Trois adresses peuvent valider (`anisssebbane@gmail.com`, `Office@lesgreniersdusaiss.ma` et `sebti.othmane@lesgreniersdusaiss.ma`, cette dernière n'étant pas forcément destinataire du mail) : une réponse positive envoyée depuis l'une quelconque déclenche la publication (voir règle de validation ci-dessous).

Le corps contient deux sections distinctes :

**1. Résumé hebdomadaire** — un résumé rédigé (pas une simple liste de liens) d'environ 500 mots en français, puis d'environ 500 mots en anglais, couvrant l'actualité trouvée pour tous les thèmes ci-dessus (produits existants, futures lignes de produits, marché/secteur). En bas de chaque résumé, la liste des sources citées (nom du média + lien), présentée explicitement comme *« sources, à titre de vérification »* — ce ne sont pas des liens à valider ou sur lesquels agir, juste une référence.

**2. Proposition de la semaine** — titre de l'article choisi, source, lien, date de publication, puis pour le français et l'anglais chacun DEUX textes distincts clairement étiquetés :
- un **résumé court** (≈200 caractères) — deviendra le champ `summary` de `news.json`, affiché sur la carte de la page Actualités ;
- un **texte complet** (≈300-500 mots, plusieurs paragraphes, factuel, basé sur les faits trouvés en recherche) — deviendra le champ `content` de `news.json`, affiché uniquement dans la fenêtre modale quand le visiteur clique sur « Lire la suite », et devant se suffire à lui-même pour quelqu'un qui n'a pas accès à l'article original (terminer par une mention de la source).

Puis, en clair : *« Répondez OUI à cet email pour publier cette actualité sur le site, ou ignorez ce message pour passer cette semaine. »*

Puis, juste après (toujours en dessous de la ligne « Répondez OUI », jamais avant) : *« Pour modifier le texte avant publication, répondez OUI puis recopiez uniquement le ou les blocs à corriger avec leur étiquette (Titre (FR) :, Titre (EN) :, Résumé court (FR) :, Texte complet (FR) :, Résumé court (EN) :, Texte complet (EN) :). Les blocs non recopiés restent tels quels. »*

## Règle de validation et de dédoublonnage

- L'agent recherche dans Gmail **tous** les fils dont le sujet commence par `Agentnews — proposition` qui n'ont pas encore été traités (pas seulement celui de la semaine immédiatement précédente — une réponse a pu arriver après la fin d'un cycle antérieur, une fois le fil de cette semaine-là déjà considéré) et regarde s'ils contiennent une réponse envoyée après l'email de proposition, depuis `anisssebbane@gmail.com`, `Office@lesgreniersdusaiss.ma` **ou** `sebti.othmane@lesgreniersdusaiss.ma` (liste des validateurs autorisés ; toute autre adresse est ignorée).
- Réponse contenant un mot positif (oui, yes, publie, go, ok) → validée, quel que soit lequel des validateurs a répondu, quel que soit le fil sur lequel elle est arrivée, et quel que soit le délai écoulé depuis l'envoi de la proposition. **La publication est alors obligatoire et immédiate** : pas de nouvelle vérification de pertinence, pas de question sur le pourquoi du délai — on applique la règle, point.
- Absence de réponse après 4 jours, ou réponse négative/autre → le candidat est abandonné, il n'est pas republié automatiquement la semaine suivante (l'agent garde en mémoire, via l'historique Gmail, les titres/URL déjà proposés pour ne pas les reproposer). Une réponse positive qui arrive après ce délai de 4 jours n'est plus prise en compte pour ce candidat.
- Avant de proposer un nouvel article, l'agent vérifie qu'il ne figure pas déjà dans `news.json` (pinned ou RSS) par titre normalisé, comme le fait `fetch-news.php`.

## Ajout à `news.json`

Un article validé devient **deux entrées pinned**, une par langue (c'est le schéma déjà utilisé par les articles pinned existants — chaque entrée a un seul champ `lang`, pas de contenu bilingue dans un seul objet). Chaque entrée a désormais deux champs de texte : `summary` (résumé court, ≈200 caractères, affiché sur la carte) et `content` (texte complet, ≈300-500 mots, affiché uniquement dans le modal « Lire la suite ») :

```json
{ "title": "Titre en français", "source": "...", "published": "YYYY-MM-DD", "summary": "Résumé court FR (~200 car.)", "content": "Texte complet FR (~300-500 mots, plusieurs paragraphes)", "lang": "fr", "pinned": true }
{ "title": "English title",     "source": "...", "published": "YYYY-MM-DD", "summary": "Short EN summary (~200 chars)", "content": "Full EN text (~300-500 words, several paragraphs)", "lang": "en", "pinned": true }
```

Le champ `content` est optionnel — les articles RSS existants (`fetch-news.php`) n'en ont pas et le modal se rabat alors sur `summary` (voir `main.js`, `openNewsModal`).

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
