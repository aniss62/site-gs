/* ============================================================
   chatbot.js : assistant FAQ (sans serveur, sans IA externe)
   Répond à une dizaine de questions sur la société, ses produits
   et l'import/export. Toutes les réponses reprennent le contenu
   déjà publié sur le site. Aucune saisie n'est envoyée nulle part.
   Sécurité : tout est écrit avec textContent / createElement.
   ============================================================ */
(function () {
  'use strict';
  if (document.getElementById('gsbot')) return;

  var meta = document.querySelector('meta[name="base-url"]');
  var root = (meta && meta.getAttribute('content')) ? meta.getAttribute('content') + '/' : '';

  var EMAIL = 'Office@lesgreniersdusaiss.ma';
  var PHONE = '+212 5 35 72 90 82';

  /* ── Base de connaissances (FR / EN) ──────────────────────── */
  var FAQ = [
    { id: 'about',
      q: ['Qui est Les Greniers du Saïss ?', 'Who is Les Greniers du Saïss?'],
      k: 'qui societe entreprise histoire fondee 2008 groupe filiale presentation who company about founded history subsidiary',
      a: ["Fondée en 2008 à Fès, au cœur de la plaine fertile du Saïss, Les Greniers du Saïss est une entreprise marocaine de négoce import-export, active dans l'export de produits de caroube (Kharoub) et de légumineuses et dans l'import de céréales. Filiale du Groupe Saïss Céréales, elle s'appuie sur une organisation industrielle, de la sélection des matières premières à la livraison internationale, et bénéficie d'un accès privilégié à des matières premières d'exception et d'un ancrage industriel solide.",
          "Founded in 2008 in Fez, in the heart of the fertile Saïss plain, Les Greniers du Saïss is a Moroccan import-export trading company, active in the export of carob products (Kharoub) and legumes and in the import of cereals. A subsidiary of Groupe Saïss Céréales, it relies on an industrial organization, from raw material selection to international delivery, and benefits from privileged access to exceptional raw materials and a solid industrial foundation."],
      l: ['about.html', 'Découvrir la société', 'About us'] },
    { id: 'products',
      q: ['Quels produits proposez-vous ?', 'Which products do you offer?'],
      k: 'produit produits gamme catalogue proposez vendez offre products range catalogue offer sell',
      a: ["Notre gamme : caroube brute, graines de caroube, pulpe de caroube, légumineuses (lentilles, pois chiches, fèves, féverole, haricots, pois secs, petit pois), céréales (blé, orge, maïs, millet), épices (coriandre, poivre noir) ainsi que des aliments de bétail et dérivés (tourteaux, mélasse, compléments, minéraux).",
          "Our range: raw carob, carob seeds, carob pulp, legumes (lentils, chickpeas, fava beans, field beans, beans, dried peas, green peas), cereals (wheat, barley, corn, millet), spices (coriander, black pepper) and animal feed and derivatives (oilcakes, molasses, supplements, minerals)."],
      l: ['index.html#produits', 'Voir les produits', 'See the products'] },
    { id: 'carob',
      q: ['Que savez-vous sur la caroube ?', 'What can you tell me about carob?'],
      k: 'caroube kharoub gousse graines pulpe e410 carob locust seeds pulp pods',
      a: ["La caroube brute (Kharoub) est la gousse entière du caroubier (Ceratonia siliqua), séchée naturellement, riche en sucres naturels, fibres et tanins. Les graines, extraites de la gousse, sont la matière première de la farine de graines de caroube (E410), un épaississant naturel. La pulpe, obtenue par broyage et tamisage des gousses, est riche en sucres naturels et en fibres.",
          "Raw carob (Kharoub) is the whole pod of the carob tree (Ceratonia siliqua), naturally dried and rich in natural sugars, fibre and tannins. The seeds, extracted from the pod, are the raw material for carob bean gum (E410), a natural thickener. The pulp, obtained by grinding and sieving the pods, is rich in natural sugars and fibre."],
      l: ['products/caroube-brute.html', 'Fiche Caroube brute', 'Raw carob page'] },
    { id: 'legumes',
      q: ['Quelles légumineuses exportez-vous ?', 'Which legumes do you trade?'],
      k: 'legumineuse legumineuses lentille lentilles pois chiches feves feverole haricots petit pois legumes lentils chickpeas beans peas fava',
      a: ["Nous assurons l'import et l'export de toutes variétés de légumineuses : lentilles, pois chiches, fèves, féverole, haricots, pois secs et petit pois. Nos lentilles proviennent à la fois de notre production locale et de l'importation, notamment les variétés Richlea et Eston.",
          "We handle the import and export of all varieties of legumes: lentils, chickpeas, fava beans, field beans, beans, dried peas and green peas. Our lentils come both from our local production and from imports, including the Richlea and Eston varieties."],
      l: ['products/legumineuses.html', 'Voir les légumineuses', 'See the legumes'] },
    { id: 'cereals',
      q: ['Travaillez-vous les céréales et les épices ?', 'Do you trade cereals and spices?'],
      k: 'cereale cereales ble orge mais epice epices coriandre poivre cereals wheat barley corn spices coriander pepper',
      a: ["Oui. Nous opérons en négoce import-export de céréales (blé, orge, maïs, millet), sélectionnées selon des critères stricts de qualité et de traçabilité. Notre gamme d'épices comprend la coriandre, cultivée localement au Maroc, et le poivre noir, importé des grandes régions productrices (Inde, Vietnam).",
          "Yes. We operate as an import-export trader of cereals (wheat, barley, corn, millet), selected according to strict quality and traceability criteria. Our spice range includes coriander, grown locally in Morocco, and black pepper, imported from the main producing regions (India, Vietnam)."],
      l: ['products/cereales.html', 'Voir les céréales', 'See the cereals'] },
    { id: 'packaging',
      q: ['Quels conditionnements proposez-vous ?', 'What packaging do you offer?'],
      k: 'conditionnement conditionnements emballage sac sacs big bag vrac packaging bag bulk',
      a: ["Selon les produits : sacs de 25 kg ou 50 kg, big bags de 500 à 1 200 kg (par exemple 1 000 kg pour la caroube brute et la pulpe), et vrac sur demande pour les céréales et les aliments de bétail. Le marquage personnalisé et la certification d'origine sont disponibles pour les légumineuses. Le conditionnement est adapté aux spécifications du client.",
          "Depending on the product: 25 kg or 50 kg bags, big bags of 500 to 1,200 kg (for example 1,000 kg for raw carob and pulp), and bulk on request for cereals and animal feed. Custom marking and certificate of origin are available for legumes. Packaging is adapted to each customer's specifications."] },
    { id: 'markets',
      q: ['Dans quels pays exportez-vous ?', 'Which countries do you export to?'],
      k: 'pays export exportez marche marches monde europe amerique moyen orient afrique continent livraison countries markets worldwide europe americas middle east africa shipping',
      a: ["Nous exportons vers plus de 15 pays sur 4 continents : Europe, Moyen-Orient, Amériques et Afrique, avec une maîtrise de toute la chaîne, de la récolte à la logistique internationale.",
          "We export to more than 15 countries across 4 continents: Europe, the Middle East, the Americas and Africa, controlling the whole chain from harvest to international logistics."] },
    { id: 'quality',
      q: ['Comment garantissez-vous la qualité ?', 'How do you guarantee quality?'],
      k: 'qualite controle analyse laboratoire tracabilite lot norme quality control analysis laboratory traceability batch',
      a: ["Le contrôle qualité intervient à chaque étape : sélection rigoureuse à la source, tri optique et mécanique, analyses physico-chimiques et microbiologiques systématiques (résultats transmis avec chaque lot), conditionnement adapté et traçabilité complète par lot. Chaque lot est identifié par un numéro unique.",
          "Quality control applies at every stage: rigorous selection at source, optical and mechanical sorting, systematic physico-chemical and microbiological analyses (results provided with each batch), tailored packaging and full batch traceability. Each batch is identified by a unique number."],
      l: ['qualite.html', 'Voir la page Qualité', 'See the Quality page'] },
    { id: 'docs',
      q: ['Quels documents fournissez-vous ? Êtes-vous certifiés ?', 'Which documents do you provide? Are you certified?'],
      k: 'document documents certificat certificats certification certifie certifies fiche technique analyse iso documentation certificates certified technical datasheet',
      a: ["Pour chaque commande : certificats d'origine, fiches techniques et analyses sont disponibles. Côté certifications, nous travaillons à l'obtention de certifications internationales : contactez-nous pour connaître notre statut actuel.",
          "For every order, certificates of origin, technical datasheets and analyses are available. As for certifications, we are working towards obtaining international certifications: contact us for our current status."] },
    { id: 'uses',
      q: ['À quoi sert la caroube ? Quelles applications ?', 'What is carob used for?'],
      k: 'application applications usage usages utilisation sert industrie cacao epaississant cosmetique pharmaceutique petfood uses use industry cocoa thickener cosmetics pharmaceutical',
      a: ["La caroube et ses dérivés servent dans l'agroalimentaire (substitut naturel du cacao, épaississant E410), la pharmacie (liant, excipient), la cosmétique, l'alimentation animale, la nutrition sportive et le petfood. Elle est appréciée pour son pouvoir sucrant, son effet épaississant, sa richesse en fibres et l'absence de caféine.",
          "Carob and its derivatives are used in food (natural cocoa substitute, E410 thickener), pharmaceuticals (binder, excipient), cosmetics, animal feed, sports nutrition and pet food. It is valued for its natural sweetness, thickening effect, fibre content and absence of caffeine."],
      l: ['applications.html', "Domaines d'application", 'Applications'] },
    { id: 'quote',
      q: ['Comment demander un devis ou vous contacter ?', 'How can I request a quote or contact you?'],
      k: 'devis contact contacter commande commander prix tarif adresse telephone email mail joindre quote contact order price phone address reach',
      a: ["Écrivez-nous à " + EMAIL + " ou appelez le " + PHONE + ". Vous pouvez aussi utiliser le formulaire de contact du site : nous répondons dans les 24-48 h. Adresse : LOT 60, Quartier Industriel Ouafae, Bensouda, 30006 Fès, Maroc.",
          "Write to us at " + EMAIL + " or call " + PHONE + ". You can also use the contact form on the website: we reply within 24-48 hours. Address: LOT 60, Quartier Industriel Ouafae, Bensouda, 30006 Fès, Morocco."],
      l: ['contact.html', 'Page Contact', 'Contact page'] }
  ];

  var FALLBACK = ["Je n'ai pas de réponse précise à cette question. Choisissez l'une des questions ci-dessus ou contactez notre équipe : " + EMAIL + " · " + PHONE + ".",
                  "I don't have a precise answer to that question. Pick one of the questions above or contact our team: " + EMAIL + " · " + PHONE + "."];
  var GREETING = ["Bonjour, je m'appelle Caro. Je réponds aux questions fréquentes sur Les Greniers du Saïss, ses produits et l'import/export. Choisissez une question ou écrivez la vôtre.",
                  "Hello, my name is Caro. I answer frequently asked questions about Les Greniers du Saïss, its products and import/export. Pick a question or type your own."];

  /* ── Utilitaires ──────────────────────────────────────────── */
  function norm(s) {
    return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]+/g, ' ');
  }
  function curLang() { return (window.sitelang || localStorage.getItem('sitelang') || localStorage.getItem('gs_lang') || 'fr'); }
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }
  /* Deux spans FR/EN : basculés par le sélecteur de langue du site */
  function bilingual(parent, fr, en) {
    var s1 = el('span', 'fr-text', fr), s2 = el('span', 'en-text', en);
    var isFr = curLang() === 'fr';
    s1.hidden = !isFr; s2.hidden = isFr;
    parent.appendChild(s1); parent.appendChild(s2);
  }
  /* Texte avec e-mail / téléphone cliquables (sans innerHTML) */
  function richText(parent, text) {
    text.split(/(Office@lesgreniersdusaiss\.ma|\+212 5 35 72 90 82)/g).forEach(function (p) {
      if (p === EMAIL) { var a = el('a', null, p); a.href = 'mailto:' + EMAIL; parent.appendChild(a); }
      else if (p === PHONE) { var b = el('a', null, p); b.href = 'tel:+212535729082'; parent.appendChild(b); }
      else if (p) parent.appendChild(document.createTextNode(p));
    });
  }
  function richBilingual(parent, fr, en) {
    var s1 = el('span', 'fr-text'), s2 = el('span', 'en-text');
    richText(s1, fr); richText(s2, en);
    var isFr = curLang() === 'fr';
    s1.hidden = !isFr; s2.hidden = isFr;
    parent.appendChild(s1); parent.appendChild(s2);
  }
  /* Icône de Caro : une gousse de caroube (trait, couleur héritée) */
  function icon(size) {
    var NS = 'http://www.w3.org/2000/svg';
    var s = document.createElementNS(NS, 'svg');
    s.setAttribute('width', size); s.setAttribute('height', size); s.setAttribute('viewBox', '0 0 32 32');
    s.setAttribute('fill', 'none'); s.setAttribute('stroke', 'currentColor');
    s.setAttribute('stroke-width', '2'); s.setAttribute('stroke-linecap', 'round'); s.setAttribute('stroke-linejoin', 'round');
    s.setAttribute('aria-hidden', 'true');
    function path(d, extra) {
      var p = document.createElementNS(NS, 'path'); p.setAttribute('d', d);
      if (extra) p.setAttribute('fill', 'currentColor');
      s.appendChild(p);
    }
    path('M4 28C3 14 13 5 28.5 4C30 4.2 30.2 5.2 29.5 6C25 9 22.5 13 21 18C19.5 23.5 16 27.5 10 28.8C7.5 29.3 5.2 29.2 4 28z'); // gousse
    var seeds = document.createElementNS(NS, 'path');                                                             // graines
    seeds.setAttribute('d', 'M9.5 22.5h.01M13 18.3h.01M17 14.5h.01M21.5 11h.01');
    seeds.setAttribute('stroke-width', '3');
    s.appendChild(seeds);
    return s;
  }

  /* ── Interface ────────────────────────────────────────────── */
  var wrap = el('div', 'gsbot'); wrap.id = 'gsbot';

  var fab = el('button', 'gsbot__fab'); fab.type = 'button';
  fab.setAttribute('aria-expanded', 'false'); fab.setAttribute('aria-controls', 'gsbot-panel');
  fab.setAttribute('aria-label', 'Caro, assistant / Caro, chat assistant');
  fab.appendChild(icon(30));

  var panel = el('section', 'gsbot__panel'); panel.id = 'gsbot-panel'; panel.hidden = true;
  panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', 'Caro, assistant Les Greniers du Saïss');

  var head = el('header', 'gsbot__head');
  var avatar = el('span', 'gsbot__avatar'); avatar.appendChild(icon(22));
  var title = el('strong'); bilingual(title, 'Caro · assistant Les Greniers du Saïss', 'Caro · Les Greniers du Saïss assistant');
  var close = el('button', 'gsbot__close', '×'); close.type = 'button'; close.setAttribute('aria-label', 'Fermer / Close');
  head.appendChild(avatar); head.appendChild(title); head.appendChild(close);

  var log = el('div', 'gsbot__log'); log.setAttribute('role', 'log'); log.setAttribute('aria-live', 'polite');
  var chips = el('div', 'gsbot__chips');

  var form = el('form', 'gsbot__form');
  var input = el('input'); input.type = 'text'; input.maxLength = 200; input.autocomplete = 'off';
  input.setAttribute('aria-label', 'Votre question / Your question');
  var send = el('button'); send.type = 'submit';
  bilingual(send, 'Envoyer', 'Send');
  form.appendChild(input); form.appendChild(send);

  panel.appendChild(head); panel.appendChild(log); panel.appendChild(chips); panel.appendChild(form);
  wrap.appendChild(fab); wrap.appendChild(panel);

  function botMsg(fr, en, link) {
    var m = el('div', 'gsbot__msg gsbot__msg--bot');
    var p = el('p'); richBilingual(p, fr, en); m.appendChild(p);
    if (link) {
      var a = el('a', 'gsbot__link'); a.href = root + link[0];
      bilingual(a, link[1] + ' →', link[2] + ' →');
      m.appendChild(a);
    }
    log.appendChild(m); log.scrollTop = log.scrollHeight;
  }
  function userMsg(text) {
    log.appendChild(el('div', 'gsbot__msg gsbot__msg--user', text));
    log.scrollTop = log.scrollHeight;
  }
  function answer(item) { botMsg(item.a[0], item.a[1], item.l); }

  function match(text) {
    var words = norm(text).split(' ').filter(function (w) { return w.length > 2; });
    var best = null, bestScore = 0;
    FAQ.forEach(function (it) {
      var kw = ' ' + norm(it.k) + ' ', score = 0;
      words.forEach(function (w) {
        if (kw.indexOf(' ' + w + ' ') > -1) score += 2;
        else if (w.length > 4 && kw.indexOf(' ' + w) > -1) score += 1;
      });
      if (score > bestScore) { bestScore = score; best = it; }
    });
    return bestScore >= 2 ? best : null;
  }

  FAQ.forEach(function (it) {
    var c = el('button', 'gsbot__chip'); c.type = 'button';
    bilingual(c, it.q[0], it.q[1]);
    c.addEventListener('click', function () {
      userMsg(curLang() === 'fr' ? it.q[0] : it.q[1]);
      answer(it);
    });
    chips.appendChild(c);
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var text = input.value.trim();
    if (!text) return;
    userMsg(text); input.value = '';
    var hit = match(text);
    if (hit) answer(hit); else botMsg(FALLBACK[0], FALLBACK[1], ['contact.html', 'Page Contact', 'Contact page']);
  });

  function setPlaceholder() { input.placeholder = curLang() === 'fr' ? 'Votre question…' : 'Your question…'; }
  input.addEventListener('focus', setPlaceholder);

  function open(state) {
    panel.hidden = !state;
    fab.setAttribute('aria-expanded', String(state));
    fab.classList.toggle('is-open', state);
    if (state) {
      if (!log.children.length) botMsg(GREETING[0], GREETING[1]);
      setPlaceholder();
      input.focus();
    } else { fab.focus(); }
  }
  fab.addEventListener('click', function () { open(panel.hidden); });
  close.addEventListener('click', function () { open(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) open(false); });

  document.body.appendChild(wrap);
})();
