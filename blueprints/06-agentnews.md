# Blueprint 06 — Agentnews (veille hebdomadaire assistée par IA)

## Objectif
Chaque semaine, proposer au propriétaire du site UN article d'actualité pertinent pour l'activité (caroube, légumineuses, aliment de bétail, céréales, et tous les produits du site), prêt à publier sur le site d'un simple « OUI », avec les liens des sources pour vérification. Le même mail permet aussi de publier un texte personnel (texte et image de son choix), indépendamment de l'article proposé — sans dépendre d'une clé API IA côté serveur : la recherche et la rédaction sont faites par l'agent Claude Code lui-même (routine programmée), et la publication sur le site nécessite une validation humaine par email.

## Pourquoi pas côté serveur
Une tentative précédente ajoutait une IA côté PHP (sélection + rédaction via l'API Anthropic, espace de gestion à lien signé) — abandonnée faute de `ANTHROPIC_API_KEY`. Agentnews évite ce blocage : il n'y a aucun appel API à héberger, aucune clé à gérer, aucun nouveau code PHP/JS. L'« IA » est l'agent qui exécute la routine ; le site ne change pas de mécanisme de publication (toujours `site/assets/data/news.json`, toujours le déploiement FTP existant).

## Architecture

```
Routine programmée "agentnews" (cloud, hebdomadaire, ex. lundi 8h UTC)
  1. Lit site/assets/data/news.json → titres/URLs existants (dédup)
  2. Consulte Gmail (fils « Agentnews — proposition » récents) uniquement
     pour ne pas reproposer un article déjà proposé ou refusé. La
     publication sur réponse n'est PAS faite par cette routine (voir
     « Publication automatique » plus bas)
  3. Recherche web (WebSearch) sur tous les thèmes ci-dessous (produits
     existants + futures lignes de produits), écarte les doublons
     (titre/URL déjà dans news.json ou déjà proposés/refusés dans un
     fil Gmail récent) et les sources de plus de 30 jours
  4. Choisit UN article précis pour la proposition de publication, avec
     DEUX textes FR + DEUX textes EN : un résumé court (≈200 caractères,
     affiché sur la carte de la page Actualités) et un texte complet
     (≈300-500 mots, affiché uniquement quand on clique sur « Lire la
     suite »)
  5. Envoie un seul email (Gmail MCP) au propriétaire du site contenant
     uniquement la proposition de publication, ses consignes de
     réponse (OUI, corrections, texte personnel) et la liste des
     sources de vérification
```

Il n'y a plus de résumé hebdomadaire rédigé dans le mail (supprimé le 2026-10-31 : il n'était pas utilisé, doublait la proposition et a été à l'origine d'une erreur de date, voir « Fraîcheur des sources »).

Aucun fichier du dépôt n'est modifié par cette routine : seule une réponse positive à un mail de proposition, traitée par la routine horaire, touche `news.json`.

## Publication automatique (routine horaire)

Depuis le 2026-10-19, la publication sur réponse n'est plus faite par la routine hebdomadaire (qui ne se réveille que le lundi 8h UTC : une réponse arrivée le lundi à 10h attendait une semaine, puis dépassait le délai de 4 jours) mais par une routine séparée, **`agentnews — publication sur reponse OUI`**, qui tourne **toutes les heures** (minute 17). Elle cherche les fils `Agentnews proposition` des 30 derniers jours (recherche par mots-clés, corbeille incluse), vérifie qu'une réponse positive d'un validateur autorisé est arrivée dans les 4 jours, que le titre FR n'est pas déjà dans `news.json` (anti-doublon), puis ajoute les deux entrées pinned, commit, pousse sur `main` et répond dans le fil. La publication suit donc un « OUI » d'au plus une heure.

La routine hebdomadaire ne fait plus que la veille et l'envoi de la proposition ; elle ne modifie aucun fichier. Le format des blocs de l'email (en-tête `== Proposition de la semaine ==`, `Titre (FR) :`, `Résumé court (FR) :`, `Texte complet (FR) :`, etc.) est relu tel quel par la routine de publication : ne pas le changer sans adapter celle-ci (son prompt contient ces étiquettes). Toute note de bas de mail, y compris la liste des sources de vérification, doit figurer après la ligne « Répondez OUI ».

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
- **Mise à jour automatique de l'anglais** : quand un bloc français est corrigé (`Titre (FR) :`, `Résumé court (FR) :` ou `Texte complet (FR) :`) et que le bloc anglais correspondant n'est pas corrigé dans la même réponse, la routine met à jour ce bloc EN en traduisant fidèlement le texte FR corrigé, sans rien ajouter ni retrancher (titre → titre, résumé court → résumé court, texte complet → texte complet). Un bloc EN collé à l'identique de l'original compte comme non corrigé : il est donc mis à jour lui aussi. Si le bloc EN correspondant est corrigé dans la même réponse, il est repris mot pour mot et la traduction automatique n'a pas lieu. La confirmation liste les champs EN mis à jour automatiquement. Le sens inverse (correction EN → FR) n'est pas automatique : le français reste tel qu'écrit.
- Le caractère positif de la réponse est jugé uniquement sur le texte situé avant la première étiquette : un « oui » ou « ok » dans un texte corrigé ne valide rien.
- Si plusieurs réponses positives existent dans le fil, la plus ancienne fait foi. La réponse de confirmation de la routine liste les champs corrigés.

### Publier un texte personnel (avec image)

Depuis le 2026-10-31, une réponse au mail de proposition peut aussi publier un texte personnel, **indépendamment** de l'article proposé : l'article proposé n'est alors pas publié (sauf si une autre réponse du fil dit « OUI »), et un « OUI » n'est pas nécessaire.

Le mot-clé est **PERSO** (ou « personnel »), écrit en premier dans la réponse, suivi des mêmes blocs étiquetés que pour les corrections, rédigés cette fois en entier :

```
PERSO

Titre (FR) :
Mon titre

Résumé court (FR) :
Une ou deux phrases (≈200 caractères).

Texte complet (FR) :
Le texte, sur plusieurs paragraphes.

Titre (EN) :
...
Résumé court (EN) :
...
Texte complet (EN) :
...
```

Règles appliquées par la routine horaire :
- Validateurs, délai et anti-doublon (titre FR déjà dans `news.json`) : identiques à la publication d'une proposition. Le fil doit être un mail « Agentnews — proposition » de moins de 30 jours (aucun autre délai : le délai de 4 jours ne s'applique pas, le texte personnel n'étant lié à aucune actualité).
- Obligatoires : `Titre (FR) :` et `Texte complet (FR) :`. `Résumé court (FR) :` est facultatif : s'il manque, la routine en tire la première phrase du texte complet (≈200 caractères, sans rien ajouter).
- Version anglaise : si les blocs EN manquent, la routine traduit fidèlement le titre, le résumé et le texte, sans rien ajouter, et le signale dans sa réponse de confirmation. Si les blocs EN sont fournis, ils sont repris mot pour mot. Un texte rédigé en anglais seulement est traité de même dans l'autre sens.
- Le texte est repris mot pour mot, sans reformulation ni correction.
- Source : `Source :` si elle est donnée, sinon « Les Greniers du Saïss ». Date de publication : date de la réponse.
- **Image** : une pièce jointe de la réponse (JPEG, PNG ou WebP, 5 Mo maximum) est enregistrée sous `site/assets/images/news-perso-AAAA-MM-JJ.<ext>` et référencée dans le champ `image` des deux entrées. Sans pièce jointe : pas d'image (la routine ne réutilise pas les images existantes pour un texte personnel). Si la pièce jointe est illisible ou trop lourde, le texte est publié sans image et la réponse de confirmation le dit.
- Même format `news.json` que pour une proposition (deux entrées `pinned`, FR et EN), même commit, même réponse de confirmation dans le fil.

**À vérifier au premier test** : que le connecteur Gmail de la routine donne accès au contenu des pièces jointes. Si ce n'est pas le cas, l'image ne pourra pas être publiée par cette voie ; solution de repli : joindre l'image au dépôt à la main, ou indiquer dans la réponse une ligne `Image : https://…` que la routine téléchargerait si son environnement le permet.

## Fraîcheur des sources

Depuis le 2026-10-26, règle appliquée à toute source citée dans le mail (incident : un article FreshPlaza de juillet 2024 avait été présenté comme actualité de la semaine dans le résumé hebdomadaire, supprimé depuis) :
- Toute source citée doit avoir une date de publication **vérifiée dans le corps de l'article** (« Publication date », date de l'article). La date affichée dans l'en-tête ou le bandeau d'une page (souvent celle du jour) et l'absence de date dans un résultat de recherche ne prouvent rien.
- Une source de plus de 30 jours est écartée. Si elle est citée malgré tout pour le contexte, elle est signalée explicitement « plus ancien » avec sa date, et jamais présentée comme « cette semaine » ou « cette année ».
- Dans la liste des sources de vérification, chaque source porte sa date de publication.
- L'article de la proposition a moins de 30 jours, sans exception, hormis l'unique dérogation caroube (voir « Priorité caroube » : 60 jours, date vérifiée et affichée).

## Thèmes de recherche

| Catégorie | Mots-clés |
|---|---|
| Produits existants | caroube / carob, gomme de caroube (E410, locust bean gum), pulpe de caroube (carob pulp), légumineuses (lentilles, pois chiches, fèves, haricots, pois secs) |
| Futures lignes de produits | aliment de bétail / animal feed (tourteaux, pulpe de betterave, luzerne, son de blé, paille, bovins/ovins/caprins/volaille), céréales / cereals (blé, orge, maïs — import-export, cours mondiaux, récoltes Maroc) |
| Marché / secteur | export agroalimentaire Maroc, filière caroubier marocaine, réglementation export agricole Maroc/UE, salons professionnels (SIAL, Anuga, Gulfood), tendances substituts du cacao et ingrédients sans gluten |

Les « futures lignes de produits » sont traitées à égalité avec les produits déjà présents sur le site : elles n'ont pas encore de page dédiée, mais l'activité de l'entreprise les couvre déjà.

## Salons majeurs (depuis le 2026-11-23)

Constat : Fi Europe 2026 (Francfort, du 17 au 19 novembre 2026, dates à reconfirmer à la source) n'a jamais été proposé alors que ce salon réunit les ingrédients (dont la gomme de caroube E410) et l'alimentation animale. Le thème « salons professionnels » n'avait pas de liste de salons ni de règle.

- **Salons à surveiller chaque semaine** : Fi Europe (prochaine édition à Paris, du 30 novembre au 2 décembre 2027, à reconfirmer), Africa Food Show Morocco, SIAM (Meknès, avril 2027), SIAL, Anuga, Gulfood et Gulfood Manufacturing, ainsi que tout salon d'ingrédients ou d'alimentation animale d'envergure internationale. Liste à compléter avec les salons que le propriétaire du site indique.
- **Règle** : un grand salon terminé depuis moins de 30 jours, ou qui débute dans les 30 prochains jours, est un candidat prioritaire (au même niveau que la caroube, après elle en cas de conflit). Chercher le salon lui-même (nom + année + « exhibitors », « highlights », « locust bean gum », « animal feed »), jamais en y accolant « Morocco » (ce mot réduit les résultats à des pages d'exposants marocains).
- **Dates** : les dates d'un salon se vérifient sur le site officiel ou dans deux sources concordantes, comme toute autre source.

## Priorité caroube (depuis le 2026-11-23)

Constat (journal de la routine du 2026-11-23) : l'actualité caroube est rare, les requêtes génériques ramènent surtout des pages intemporelles (rapports de marché, fiches produit, articles anciens), et la routine ne peut pas ouvrir la plupart des sites de presse depuis son environnement cloud, donc elle ne peut pas confirmer les dates. Résultat : aucun article caroube n'était proposé depuis septembre.

- **Priorité** : si un article sur la caroube (caroube, caroubier, farine ou pulpe de caroube, gomme E410 / locust bean gum, substitut du cacao à base de caroube) publié il y a **moins de 60 jours**, non déjà publié ni proposé, est confirmé, il est proposé **avant** les autres thèmes. C'est la seule dérogation à la règle des 30 jours : sa date de publication vérifiée est écrite dans le texte et dans la liste des sources (« publié le JJ/MM/AAAA »), jamais « cette semaine ». Au-delà de 60 jours, ou si la date n'est pas vérifiée, l'article est écarté comme les autres.
- **Recherches caroube ciblées, à lancer chaque semaine avant les autres thèmes** (FR et EN, sans mois ni année dans la requête, qui orientent vers des pages datées ; mode `extended` autorisé pour celles-ci) :
  - `caroube` / `caroubier` avec `site:` sur lematin.ma, le360.ma, hespress.com, agrimaroc.ma, moroccoworldnews.com ;
  - `carob` / `locust bean gum` / `carob flour` avec `site:` sur freshplaza.com, foodingredientsfirst.com, nutraingredients.com, confectionerynews.com ;
  - noms d'acteurs de la filière (par exemple Nexira / Keragum, signalés dans la recherche du 2026-11-23) et `Morocco carob exports`.
- **Couverture mondiale** (la caroube est le produit phare : en voir le maximum) : chercher aussi hors du Maroc, dans les pays producteurs, transformateurs et consommateurs, et dans leurs langues, avec les mêmes requêtes sans mois ni année : espagnol (`algarroba`, `garrofa`, `harina de algarroba`), portugais (`alfarroba`), italien (`carruba`, `farina di carruba`), grec (`χαρούπι`), turc (`keçiboynuzu`), arabe (`خروب`), anglais (`carob`, `locust bean gum`, `carob syrup`, `carob kibbles`, `carob powder`). Pays à couvrir : Espagne, Portugal, Italie, Grèce, Chypre, Turquie, Algérie, Tunisie, Maroc, États-Unis, Australie, Israël. Sujets : production et récoltes, prix, exportations, gomme E410 et épaississants (marché, prix, pénuries), substituts du cacao (la tension sur le cacao relance la caroube), santé et études scientifiques, produits nouveaux (chocolat sans cacao, farines, sirops), réglementation (UE, Maroc), acquisitions et investissements, salons.
- **Autres actualités caroube** : parmi tout ce qui est trouvé, UNE actualité est proposée (la plus pertinente pour l'activité, ou la plus récente à pertinence égale) ; toutes les autres actualités caroube de moins de 60 jours sont listées dans la rubrique « Autres actualités caroube repérées (non proposées) » du mail (voir « Format de l'email »). Une actualité déjà publiée sur le site ou déjà proposée n'est pas répétée.
- **Dates quand l'article est illisible** : si l'ouverture de la page échoue (domaine bloqué), la date doit apparaître dans l'extrait du résultat de recherche ou dans l'URL (ex. `/2026/11/`). Sans date visible, la source n'est pas retenue : une deuxième source datée concordante peut la confirmer.
- **Réseau** : la routine ne peut ouvrir que les domaines autorisés dans les paramètres réseau de son environnement claude.ai. Pour vérifier les dates à la source, ajouter à cette liste au moins : lematin.ma, le360.ma, hespress.com, agrimaroc.ma, moroccoworldnews.com, freshplaza.com, foodingredientsfirst.com, nutraingredients.com, confectionerynews.com. Tant que ce n'est pas fait, la limite ci-dessus s'applique.

## Format de l'email

Un seul email par semaine, sujet fixe (inchangé pour que la recherche Gmail de l'étape 2 continue de fonctionner) : `Agentnews — proposition de la semaine du YYYY-MM-DD`.

**Destinataires** : à `anisssebbane@gmail.com`, en copie (CC) `Office@lesgreniersdusaiss.ma` (l'adresse officielle du site, déjà utilisée comme `SMTP_TO`/`SMTP_FROM` dans `contact.php` et affichée en contact sur le site). Trois adresses peuvent valider (`anisssebbane@gmail.com`, `Office@lesgreniersdusaiss.ma` et `sebti.othmane@lesgreniersdusaiss.ma`, cette dernière n'étant pas forcément destinataire du mail) : une réponse positive envoyée depuis l'une quelconque déclenche la publication (voir règle de validation ci-dessous).

Le corps contient une seule section, `== Proposition de la semaine ==` (plus de résumé hebdomadaire) : titre de l'article choisi (`Titre (FR) :`, `Titre (EN) :`), `Source :`, `Lien :`, `Date de publication :`, puis pour le français et l'anglais chacun DEUX textes distincts clairement étiquetés :
- un **résumé court** (≈200 caractères) — deviendra le champ `summary` de `news.json`, affiché sur la carte de la page Actualités ;
- un **texte complet** (≈300-500 mots, plusieurs paragraphes, factuel, basé sur les faits trouvés en recherche) — deviendra le champ `content` de `news.json`, affiché uniquement dans la fenêtre modale quand le visiteur clique sur « Lire la suite », et devant se suffire à lui-même pour quelqu'un qui n'a pas accès à l'article original (terminer par une mention de la source).

Puis, en clair : *« Répondez OUI à cet email pour publier cette actualité sur le site, ou ignorez ce message pour passer cette semaine. »*

Puis, juste après (toujours en dessous de la ligne « Répondez OUI », jamais avant) :
1. *« Pour modifier le texte avant publication, répondez OUI puis recopiez uniquement le ou les blocs à corriger avec leur étiquette (Titre (FR) :, Titre (EN) :, Résumé court (FR) :, Texte complet (FR) :, Résumé court (EN) :, Texte complet (EN) :). Les blocs non recopiés restent tels quels, sauf l'anglais : si vous corrigez un bloc français sans corriger le bloc anglais correspondant, celui-ci est mis à jour automatiquement par traduction. »*
2. *« Pour publier votre propre texte à la place (avec une image en pièce jointe si vous le souhaitez), répondez PERSO puis rédigez Titre (FR) :, Résumé court (FR) :, Texte complet (FR) : (et, si vous le voulez, les blocs EN ; sinon ils sont traduits). »*
3. *« La publication est automatique dans l'heure qui suit un OUI (dans les 4 jours). »*

Enfin, après ces consignes, la liste **« Sources, à titre de vérification »** : pour chaque source ayant servi à rédiger la proposition, nom du média, lien et date de publication vérifiée. Ce sont des liens de référence, pas des actions à faire. Cette liste doit rester sous la ligne « Répondez OUI » pour ne jamais être lue comme un bloc de texte à publier.

Puis, depuis le 2026-11-23, la liste **« Autres actualités caroube repérées (non proposées) »** : toutes les actualités caroube de moins de 60 jours trouvées cette semaine dans le monde et non retenues pour la proposition, une ligne chacune (titre, média, date de publication vérifiée, lien, une phrase de contexte). Elle sert d'information et reste, comme la liste des sources, sous la ligne « Répondez OUI » : elle n'est jamais publiée et n'a aucune étiquette de bloc. S'il n'y en a pas, écrire « Aucune autre actualité caroube confirmée cette semaine ».

## Règle de validation et de dédoublonnage

- L'agent recherche dans Gmail **tous** les fils dont le sujet commence par `Agentnews — proposition` qui n'ont pas encore été traités (pas seulement celui de la semaine immédiatement précédente — une réponse a pu arriver après la fin d'un cycle antérieur, une fois le fil de cette semaine-là déjà considéré) et regarde s'ils contiennent une réponse envoyée après l'email de proposition, depuis `anisssebbane@gmail.com`, `Office@lesgreniersdusaiss.ma` **ou** `sebti.othmane@lesgreniersdusaiss.ma` (liste des validateurs autorisés ; toute autre adresse est ignorée).
- Réponse contenant un mot positif (oui, yes, publie, go, ok) → validée, quel que soit lequel des validateurs a répondu, quel que soit le fil sur lequel elle est arrivée, et quel que soit le délai écoulé depuis l'envoi de la proposition. **La publication est alors obligatoire et immédiate** : pas de nouvelle vérification de pertinence, pas de question sur le pourquoi du délai — on applique la règle, point.
- **PERSO** : une réponse dont le texte nouveau commence par PERSO (ou « personnel ») publie le texte personnel qu'elle contient (voir « Publier un texte personnel »), mêmes validateurs et même anti-doublon, sans délai propre (tout fil Agentnews de moins de 30 jours), sans lien avec l'article proposé. Un « OUI » seul dans le fil publie toujours la proposition ; PERSO et OUI peuvent coexister dans un même fil (deux publications distinctes).
- Absence de réponse après 4 jours, ou réponse négative/autre → le candidat est abandonné, il n'est pas republié automatiquement la semaine suivante (l'agent garde en mémoire, via l'historique Gmail, les titres/URL déjà proposés pour ne pas les reproposer). Une réponse positive qui arrive après ce délai de 4 jours n'est plus prise en compte pour ce candidat.
- Avant de proposer un nouvel article, l'agent vérifie qu'il ne figure pas déjà dans `news.json` (pinned ou RSS) par titre normalisé, comme le fait `fetch-news.php`.

## Ajout à `news.json`

Un article validé devient **deux entrées pinned**, une par langue (c'est le schéma déjà utilisé par les articles pinned existants — chaque entrée a un seul champ `lang`, pas de contenu bilingue dans un seul objet). Chaque entrée a désormais deux champs de texte : `summary` (résumé court, ≈200 caractères, affiché sur la carte) et `content` (texte complet, ≈300-500 mots, affiché uniquement dans le modal « Lire la suite ») :

```json
{ "title": "Titre en français", "source": "...", "published": "YYYY-MM-DD", "summary": "Résumé court FR (~200 car.)", "content": "Texte complet FR (~300-500 mots, plusieurs paragraphes)", "lang": "fr", "pinned": true }
{ "title": "English title",     "source": "...", "published": "YYYY-MM-DD", "summary": "Short EN summary (~200 chars)", "content": "Full EN text (~300-500 words, several paragraphs)", "lang": "en", "pinned": true }
```

Le champ `content` est optionnel — les articles RSS existants (`fetch-news.php`) n'en ont pas et le modal se rabat alors sur `summary` (voir `main.js`, `openNewsModal`).

Le champ `image` est **optionnel** — `main.js` (l.185, 218) et le rendu des cards gèrent déjà son absence. Agentnews ne télécharge ni ne génère d'image pour une proposition (pour un texte PERSO, la seule image possible est la pièce jointe de la réponse). **Règle (depuis le 2026-11-24) : la photo doit montrer le sujet de l'article, jamais une photo choisie au hasard.** Avant d'ajouter l'article, l'agent cherche dans `site/assets/images/` une image qui montre le produit ou le sujet précis traité, par exemple : pois chiches → `pois-chiches.jpg` ; lentilles → `lentilles.jpg` ; fèves → `feves.jpg` ou `feverole.jpg` ; haricots → `haricots.jpg` ; petits pois → `petit-pois.jpg` ; pois secs → `pois-secs.jpg` ; légumineuses en général → `legumineuses-mix.jpg` ; caroube → `caroube-*.jpg`, `caroubegousses.jpg`, `graines-caroube.jpg`, `farine-caroube.jpg`, `pulpe-caroube.jpg` ; céréales → `cereales.jpg` ; aliment de bétail → `aliments-betail.jpg` ; épices → `epices-*.jpg`, `coriandre.jpg`, `poivre-noir.jpg`. L'agent **ouvre l'image (Read) pour constater** qu'elle montre bien le sujet : le nom du fichier ne suffit pas (incident : `news-legumineuses-fao.jpg` montre un mélange d'épices, pas des légumineuses, et illustrait un article sur les pois chiches ; elle ne doit plus servir pour des légumineuses). Une image de salon, de ville, de logo ou de personnes n'illustre pas un produit. S'il existe une correspondance nette, son chemin est écrit dans le champ `image` (même image pour les deux entrées FR/EN). Sinon, le champ `image` est omis : pas d'image approximative, pas d'image aléatoire, pas de nouvelle image générée ou téléchargée.

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

- Déclenchement manuel de la routine → vérifier réception de l'email (sujet, section `== Proposition de la semaine ==` seule, sans résumé hebdomadaire, puis consignes de réponse et liste « Sources, à titre de vérification » avec dates).
- Répondre « OUI » → relancer la routine (ou attendre le prochain cycle) → vérifier que `news.json` contient les deux nouvelles entrées pinned et qu'un commit a été poussé sur `main`.
- Ne pas répondre → vérifier qu'aucun commit n'est fait et qu'un nouveau candidat différent est proposé la semaine suivante.
- Répondre « PERSO » avec un titre, un texte FR et une image en pièce jointe → vérifier que `news.json` contient les deux entrées pinned (EN traduit si non fourni), que l'image est dans `site/assets/images/` et référencée, et que la réponse de confirmation signale la traduction.
