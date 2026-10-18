# Prompt — Refonte dans le style de lbg.it

Copie tout ce qui suit dans ta session de dev (Claude Code / Antigravity), en remplaçant les éléments entre [crochets] par ceux de ton site.

---

Refais le design de mon site existant en t'inspirant **exactement** de l'identité visuelle et de la structure du site lbg.it (LBG Sicilia Ingredients). Garde mon contenu, mon logo et ma marque ([NOM DU SITE]) : seuls le style, la mise en page et les composants changent. Ne reprends ni leurs textes, ni leurs photos, ni leur logo. Une seule différence avec l'original : la couleur d'accent verte est remplacée par un **jaune doré #DDAA00**.

## 1. Ambiance générale
- Style corporate premium, nature, épuré, beaucoup d'espace blanc.
- Typographie fine et légère (graisses 200–300) en très grandes tailles : c'est la signature du site.
- Alternance de sections : hero plein écran photo → section blanche → bandeau photo plein écran → section bleu nuit → section blanche → bandeau gris clair → footer gris.
- Angles droits partout (border-radius: 0). Pas d'ombres portées, pas de dégradés (sauf le voile sombre sur les cartes photo).
- Animations sobres : compteur de chiffres animé au scroll, apparition en fondu des blocs, images en lazy-load.

## 2. Palette de couleurs (variables CSS)
```css
:root {
  --color-text:         #404040; /* texte principal */
  --color-black:        #000000; /* chiffre clé, textes de la section contact */
  --color-white:        #FFFFFF;
  --color-accent:       #DDAA00; /* jaune doré : bouton primaire, mot mis en avant dans le hero, titre "NOS MARCHÉS", points de la carte */
  --color-accent-dark:  #B88D00; /* survol de l'accent */
  --color-navy:         #002A3A; /* bleu nuit : section produits, boutons secondaires, texte sur fond doré */
  --color-navy-tab:     #00264B; /* onglet actif */
  --color-navy-overlay: rgba(0, 42, 58, 0.75); /* fond du menu plein écran */
  --color-light-grey:   #E5E5E5; /* section "Contact" */
  --color-footer-grey:  #A9A9A9; /* fond du footer */
  --color-map-grey:     #E0E0E0; /* carte du monde */
  --color-muted:        rgba(0, 0, 0, 0.8); /* icônes header au scroll, onglet inactif */
}
```
**Contraste** : le blanc sur #DDAA00 est peu lisible (≈ 2,1:1). Sur le bouton doré, mets le texte en bleu nuit #002A3A (≈ 7:1). Pour le titre "NOS MARCHÉS" en doré sur fond blanc, garde-le en grande taille (≥ 32px) ou utilise --color-accent-dark.

## 3. Typographie

### Polices
- **Texte et titres de sections** : "Gill Sans MT W01 Light" (Monotype, payante). Alternatives : `"Gill Sans", "Gill Sans Nova"` (Adobe Fonts), ou en gratuit Google Fonts **"Cabin"** / **"Lato"** en graisse 300.
  Fallback : `-apple-system, system-ui, "Segoe UI", Roboto, "Helvetica Neue", sans-serif`.
- **H1 du hero et menu** : **"Titillium Web"** (Google Fonts, graisses 300/400/600/700).
- **Icônes** : Font Awesome (style light/regular).

### Tailles mesurées sur le site (desktop ≈ 1440px / mobile 390px)

| Élément | Police | Desktop | Mobile | Graisse | Interligne | Particularités |
|---|---|---|---|---|---|---|
| Texte courant | Gill Sans | 18px | 18px | 300 | 1.75 (31.5px) | couleur #404040 |
| H1 hero | Titillium Web | 90px | 54px | 300 | 1.25 (mobile 1.5) | blanc, dernier mot en #DDAA00 |
| Chiffre clé (compteur) | Gill Sans | 180px | 180px | 300 | — | noir, suffixe "+" |
| Libellé du compteur ("PAYS / DESSERVIS") | Gill Sans | 36px | 36px | 300 | 1.25 | MAJUSCULES, sur 2 lignes |
| Paragraphe d'accroche | Gill Sans | 36px | 27px | 300 | 1.5 | letter-spacing 1.25px |
| Titre du bandeau photo | Gill Sans | 90px | 54px | 300 | 1.25 (mobile 1.5) | blanc, letter-spacing 1.25px |
| Lignes d'engagement | Gill Sans | 24px | 24px | 400 | 1.75 (42px) | blanc |
| Titre "NOS PRODUITS" | Gill Sans | 32px | 32px | 200 | 1.5 | MAJUSCULES, letter-spacing 1.25px, blanc |
| Catégorie produit (cadre) | Gill Sans | 16px | 16px | 200 | 1.5 | MAJUSCULES, letter-spacing 1.25px |
| Lien produit | Gill Sans | 18px | 18px | 200 | 1.75 | blanc + chevron ">" |
| Titre "NOS MARCHÉS" | Gill Sans | 32px | 26px | 300 | 1.5 | MAJUSCULES, #DDAA00 |
| Onglets | Gill Sans | 18px | 18px | 400 | 1 | MAJUSCULES |
| Titre sur carte photo | Gill Sans | 31.5px | 26px | 300 | 1 | blanc, letter-spacing 1.25px |
| Titre "Contactez-nous" | Gill Sans | 36px | 36px | 300 | 1.5 | noir, letter-spacing 1.25px |
| Texte section contact | Gill Sans | 18px | 18px | 300 | 1.75 | noir |
| Boutons | Gill Sans | 18px | 18px | 400 | — | — |
| Titre newsletter (footer) | Gill Sans | 36px | 27px | 300 | 1.5 | blanc, letter-spacing 1.25px |
| Liens du footer | Gill Sans | 18px | 18px | 400 | 1.75 | blanc |
| Texte RGPD du footer | Gill Sans | 18px | 18px | 400 | 1.75 | blanc |
| Adresse (footer) | Gill Sans | 16px | 16px | 300 | 1.75 | blanc |
| Téléphone / email / LinkedIn | Gill Sans | 16px | 16px | 400 | 1.75 | MAJUSCULES, avec icône |
| Menu niveau 1 | Titillium Web | 27px | 20px | 400 | 1 | blanc |
| Menu niveaux 2 et 3 | Titillium Web | 20px | 20px | 400 | 1 | blanc |

Utilise `clamp()` pour passer en douceur du mobile au desktop (ex. H1 : `clamp(54px, 6.25vw, 90px)`).

## 4. Header
- Hauteur : 100px en desktop, 60px en mobile. Logo à gauche (≈ 160px de large en desktop), à droite seulement deux icônes fines : loupe de recherche + hamburger à 3 traits de longueurs inégales. **Aucun menu horizontal visible.**
- Sur le hero : header transparent, logo et icônes en blanc.
- Au scroll : header **sticky** fond blanc, logo en couleurs, icônes en rgba(0,0,0,0.8), transition douce.
- Clic sur la loupe : barre de recherche en overlay.
- Sur les pages intérieures, une 3ᵉ icône **globe** (sélecteur de langue) s'ajoute avant la loupe.
- **Mobile** : le header du haut ne garde que le logo. Les icônes globe / loupe / hamburger passent dans une **barre fixe en bas de l'écran**, fond bleu nuit #002A3A, ≈ 56px de haut, icônes blanches réparties à gauche, au centre et à droite.

## 5. Menu (overlay plein écran)
- Clic sur le hamburger : overlay plein écran bleu nuit semi-transparent rgba(0,42,58,0.75), on voit la page en dessous. Le header reste visible (logo blanc), le hamburger devient une croix ✕.
- **Navigation en colonnes qui s'ouvrent vers la droite** (cascade façon "mega-menu") :
  - **Colonne 1** (marge gauche ≈ 90px) : entrées de niveau 1 empilées, Titillium Web 27px blanc, espacées d'environ 64px. Les entrées avec sous-menu ont un petit chevron ">" aligné à droite de la colonne (≈ 300px de large).
  - Au clic sur une entrée à chevron : l'entrée active est **soulignée d'un trait blanc fin**, et une **colonne 2** apparaît à droite (≈ 400px du bord gauche) avec ses sous-pages, en 20px.
  - Une sous-page qui a elle-même des enfants affiche un chevron ">" et ouvre une **colonne 3** (≈ 750px du bord gauche), même style.
  - Une seule branche ouverte à la fois. Pas de séparateurs ni de fonds de colonne : tout flotte sur l'overlay.
- Structure du menu d'origine (à remplacer par mes pages) :
  - **About us >** : Company · Innovation & food safety · History · R&D center · **Production facilities >** (Carob kibbling plant · Locust bean gum plant · Blending plant) · Experimental plantation · Our team · Certifications · Ethics & compliance
  - **Sustainability**
  - **Products >** : **SEEDGUM >** (Food · Petfood) · SOLPECTIN · SOLGUAR · SOLMIX · SOLCHOC · SEEDPRO · SEEDFIBER · SOLCITRIC · SYFRUIT
  - **Application >** : Ice cream & frozen desserts · Dairy · Dairy alternatives · Jelly & fruit · Dressings & sauces · Vegan · Protein bars & powder · Bakery
  - **Contact us**
  - **Careers**
- Mon menu : [Rubrique 1 > sous-pages…] · [Rubrique 2] · [Produits/Services > sous-pages…] · [Applications > sous-pages…] · [Contact] · [Carrières].
- **Mobile** : même overlay, en accordéon vertical (les sous-niveaux s'ouvrent sous leur parent, indentés), liens à 20px.

## 6. Sections de la page d'accueil (dans l'ordre)
1. **Hero plein écran (100vh)** : photo ou vidéo nature en fond, H1 centré en blanc avec le dernier mot en #DDAA00. En bas, deux petits boutons ronds à contour blanc (menu "⋮" et lecture vidéo "▶").
2. **Chiffre clé + présentation** : fond blanc avec une carte du monde en pointillés gris clair et des points #DDAA00 (pays desservis). À gauche, compteur géant animé ("[XX]+") et libellé en majuscules sur deux lignes. À droite, paragraphe d'accroche en 36px puis bouton primaire doré "En savoir plus".
3. **Bandeau engagement** : photo aérienne plein écran avec un titre blanc en 90px ([ton slogan en 3 temps, ex. "Cultiver. Préserver. Recommencer."]). En dessous, 2 ou 3 lignes d'engagements (24px) séparées par des **lignes pointillées blanches**, puis un trait plein blanc, puis un bouton bleu nuit "Notre promesse". Bloc de texte sur ≈ 790px de large.
4. **Nos produits** : fond bleu nuit #002A3A, titre "NOS PRODUITS" en blanc. Grille de 5 colonnes séparées par des **bordures verticales pointillées** blanches. Chaque colonne : label de catégorie en majuscules dans un cadre à bordure blanche de 1px, puis liste de liens (texte blanc + chevron ">" aligné à droite).
5. **Nos marchés** : fond blanc, titre "NOS MARCHÉS" en #DDAA00. **Onglets** pleine largeur : onglet actif fond #00264B texte blanc, onglet inactif texte rgba(0,0,0,0.8) sans fond, le tout posé sur une ligne bleu nuit de 2px. Dessous, grille de 3 colonnes de cartes photo (≈ 405×270px, gouttière 20px) avec le titre en blanc en bas à gauche sur un léger voile sombre ; zoom léger au survol.
6. **Contact (CTA)** : bandeau fond #E5E5E5, titre "Contactez-nous" en 36px noir, court paragraphe, bouton bleu nuit "Nous contacter".

## 7. Arborescence et modèles de pages

### Arborescence (site d'origine → à adapter)
```
/                                   Accueil
/about-us/                          À propos — page longue, une section par sous-rubrique
   #company, #h-innovation-food-safety, #h-history …  (ancres : Company, Innovation, History pointent ici)
   /about-us/plants/research-and-development-center/
   /about-us/plants/carob-kibbling-plant/
   /about-us/plants/locust-bean-gum-plant/
   /about-us/plants/blending-plant/
   /about-us/carob-tree-experimental-plantation/
   /about-us/team/
   /about-us/certification/         (+ ancre #h-ethics-compliance)
   /about-us/esg-strategy/          ← cible de l'entrée "Sustainability" du menu
/products/                          Catalogue produits
   /product/seedgum/  /product/pet-food/  /product/solpectin/  /product/solguar-guar-gum/
   /product/solmix/  /product/solchoc/  /product/seedpro/  /product/seedfiber/
   /product/solcitric/  /product/syfruit/
/application/food-applications/     Applications (8 pages)
   ice-cream/  dairy/  diary-alternatives/  jelly/  sauces/  vegan/  protein/  bakery/
/contact/
/careers/
```
Logique à reproduire chez moi :
- **Rubriques "institutionnelles"** regroupées sous /a-propos/, avec certaines sous-entrées du menu qui sont de simples **ancres** dans la page À propos plutôt que des pages séparées.
- Pages produits au singulier (`/product/[slug]/`) et catalogue au pluriel (`/products/`).
- Applications sous un niveau intermédiaire (`/application/food-applications/[slug]/`).
- Pas de fil d'Ariane.

Mon arborescence : [liste de mes pages ici, je te laisse les ranger dans cette logique].

### Composants communs à toutes les pages intérieures
- **Hero de page** : image plein largeur en fond, hauteur ≈ 70vh (100vh sur l'accueil), H1 en blanc 90px graisse 300 (54px mobile), aligné **à gauche** et centré verticalement, sans sous-titre ni bouton.
- **Bandeau "Get in touch"** répété **en bas de chaque page**, juste avant le footer : fond #E5E5E5, ≈ 400px de haut, 2 colonnes (titre 36px + texte + bouton bleu nuit "Nous contacter" à gauche, vide à droite).
- **Bloc 2 colonnes "titre / texte"** : à gauche un grand titre (36–54px) ou un chapô en 31.5px, à droite le texte courant en plus petit. C'est la brique de base de presque toutes les pages.
- **Onglets** (même style que "NOS MARCHÉS" sur l'accueil) pour regrouper du contenu : onglet actif fond #00264B texte blanc, inactifs en texte gris, ligne bleu nuit dessous.
- **Listes à séparateurs pointillés** : chaque ligne séparée par un trait en pointillés gris, dernière ligne fermée par un trait plein.
- **Accordéons** : barre fond #E5E5E5, fine bordure bleu nuit à gauche (3px), titre 31.5px graisse 300, flèche ↓ à droite.
- **Animations** : chaque bloc apparaît en fondu au scroll.

### Modèles de pages
1. **Accueil** : voir section 6.
2. **À propos (page longue à ancres)** : hero → bloc 2 colonnes (chapô à gauche, texte à droite) → vidéo pleine largeur du conteneur → section grise "CE QUI NOUS DISTINGUE" en grille de 4 colonnes (image au-dessus, titre 31.5px, texte) → **nouveau hero 70vh** qui sert d'intertitre pour la sous-rubrique suivante ("Innovation & sécurité alimentaire") → blocs avec onglets (ex. Automatisation / Conditionnement / Livraison) → section "HISTOIRE" en frise chronologique (année en 26px + image + texte) → alternance de blocs blancs et gris → bandeau contact.
   **À retenir** : chaque sous-rubrique commence par son propre hero plein écran, ce qui découpe la page longue en chapitres.
3. **Page de détail simple** (ex. une usine, l'équipe) : hero → 1 bloc 2 colonnes (titre 36px à gauche, texte + image à droite) → bandeau contact. Page courte (≈ 3 écrans).
4. **Catalogue produits** : petit titre "Nos produits" (36px) + paragraphe d'intro **sans hero** → pour chaque catégorie, un **bandeau gris #E5E5E5** de ≈ 300px avec le nom de la catégorie en MAJUSCULES 90px graisse 300 ("TEXTURANTS NATURELS") → puis chaque produit en **carte hero plein écran** (photo en fond, nom du produit 36px + accroche en blanc en bas à gauche, petit bouton bleu nuit "Voir") séparées par 50px d'espace.
5. **Fiche produit** : hero image → intro 2 colonnes (H1 "Natural cocoa replacer" en 54px #DDAA00 à gauche, texte à droite) → 2 blocs image + texte alternés (image à gauche/droite) → section grise "Applications" avec **8 onglets** (un par usage), chaque onglet = image à gauche + texte et liste à pointillés à droite → accordéons "Avantages clés" → accordéons par variante du produit (ex. "SOLCHOC L / M / D") avec un sous-accordéon "Paramètres" (fiche technique) → bandeau contact.
6. **Page application** : hero → intro 2 colonnes (sur-titre en petit, titre 54px à gauche, texte à droite, bouton "CONTACT US") → grande image → bloc 2 colonnes titre/texte → section "PRODUITS" : liste des produits recommandés (6), chacun en ligne 3 colonnes (image / nom + description / liste à pointillés des usages + bouton "EN SAVOIR PLUS") → bandeau contact.
7. **Page RSE / engagement** : hero → bloc 2 colonnes (sur-titre MAJUSCULES + titre) → 2ᵉ hero intercalaire → blocs 2 colonnes "ENVIRONNEMENT", "SOCIAL", "GOUVERNANCE" (titre 36px à gauche, texte à droite) → une suite de blocs "Télécharger notre rapport [année]" (image de couverture + bouton de téléchargement PDF) → bandeau contact.
8. **Contact** : hero → bloc 2 colonnes coordonnées (siège, adresse, téléphone, email en 54px/36px) → bloc **formulaire + carte** : formulaire à gauche (≈ 520px), carte Google Maps à droite. Champs : Service (liste déroulante, obligatoire), Nom (obligatoire), Email, Téléphone, Société, Message, case RGPD, bouton "Envoyer". Champs de 60px de haut, bordure grise 1px #CCCCCC, fond transparent, angles droits. **Pas de bandeau contact en bas.**
9. **Carrières** : hero → bloc 2 colonnes texte de présentation → formulaire de candidature en 2 colonnes (≈ 19 champs : identité, coordonnées, poste visé, upload du CV, case RGPD, bouton "Soumettre").

## 8. Boutons
- **Primaire** : fond #DDAA00, texte #002A3A 18px, padding 12px 24px, angles droits, fin liseré blanc de 2px. Survol : fond #B88D00.
- **Secondaire** : fond #002A3A, texte blanc 18px, padding 14px 26px, angles droits. Survol : légèrement plus clair.
- Transition de 0,3s.

## 9. Footer
- Fond gris #A9A9A9, texte blanc, padding vertical généreux (≈ 100px).
- 3 colonnes :
  1. **Newsletter** (≈ 50 % de la largeur) : titre de 36px "Abonnez-vous pour être le premier informé…", champ email de 54px de haut et ≈ 450px de large, bordure blanche 1px, sans fond. En dessous : case à cocher RGPD et mention avec lien.
  2. **Liens** empilés (18px) : Carrières · À propos · Équipe · Stratégie RSE · Politique de confidentialité · Politique cookies · Paramètres cookies · Lanceur d'alerte.
  3. **Coordonnées** (16px) : siège + adresse, numéro d'entreprise, puis téléphone, email et LinkedIn en MAJUSCULES, chacun précédé d'une icône (téléphone, avion en papier, LinkedIn).
- Pas de grosse barre de copyright : sobriété totale.

## 10. Mise en page et responsive
- Conteneur max ≈ 1260px, marges latérales ≈ 155px sur desktop, 20px sur mobile.
- Grandes respirations verticales entre sections (120–160px desktop, 64–80px mobile).
- Tablette : grille produits sur 2–3 colonnes, marchés sur 2 colonnes.
- Mobile : tout en une colonne, header de 60px, footer empilé, menu en accordéon. Tailles mobiles : voir le tableau de la section 3.

## 11. Détails techniques
- Images en lazy-load, WebP, `object-fit: cover`.
- Animations au scroll avec IntersectionObserver (compteur de 0 à la valeur cible, fade-up de 20px).
- Accessibilité : focus visibles, `aria-label` sur les icônes, `aria-expanded` sur les entrées du menu à sous-niveaux, fermeture du menu avec Échap. Attention au texte blanc sur le gris #A9A9A9 : prévoir une variante plus foncée si besoin.

Applique ce design à toutes les pages existantes de mon site en conservant leur contenu, puis montre-moi le rendu de la page d'accueil avant de continuer.
