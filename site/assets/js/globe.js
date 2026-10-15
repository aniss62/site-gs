/* ============================================================
   globe.js : globe en points (terres réelles, Natural Earth 110m, domaine public)
   et animation de la présence de Les Greniers du Saïss depuis Fès.
   Aucune dépendance. Canvas 2D, projection orthographique.
   ============================================================ */
(function () {
  'use strict';

  var canvas = document.getElementById('globe');
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');

  /* Masque des terres : grille 1° (360 x 180), 1 bit par cellule, encodée en base64 */
  var MASK = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH/8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH///8AEf///gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAE////D//////v/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB/wP/z////////gAAAAB/gAABwAAAAAAf4AAAAAAAAAAAAAAAAAAAAAAAAAIAf9/8A///////+AAAAD/gAAAAAAAAAAAH8gAAAAAAAAAAAAAAAAAAAAAAAYH3Hv/x////////8AAAAA/mAAAAAAAAAAAAD4AAAAAAAAAAAAAAAAAAAAAA8AAAQP+AH///////+AAAAAOAAAAAAAAAAAAAA8AAAAAAAAAAAAAAAAAAAAAHyHB8+/8AP///////4AAAAAAAAAAAAAfwAAAAH/8AAAAAAAAAAAAAAAAAAAAAP/wd3/8AAAf/////8AAAAAAAAAAAAHwAAAB////AAAB/sAAAAAAAAAAAAAAcAwAAAMAAAAH/////+AAAAAAAAAAAAcAAAAP///wAAAAAAAAAAAAAAAAAAAAf8Ac++d3gAAD/////4AAAAAAAAAAAB4AAAP/////+HwAOAAAAAAAAAAAAAAA/f+4+w/5gAAB////+wAAAAAAAAAAADgAHl3///////4Af4AAAAAwAAAAAAAAPP/4M4///AAA/////wAAAAAAAAAAAHwAfb////////4///gAAABAAA//gAACAAf+B8f//8AB////8AAAAAAAB/gAAAAAfv/////////////8AAAAAB///+P//H//PeDwf+AAn///+AAAAAAA//8AAAA8fv///////////////P+wAf////////B4GfzwD8AAf///wAAAAAAD///4cDf/3//////////////////8AD////////////34Z/wA///4AAAAAAAP///+c////v//////////////////4M////////////9gD/8A///gAwYAAAAf//88v///+//////////////////zg/////////////7A/8YAf/wAAP8AAAA/8f+D///////////////////////AgA////////////3w7/gAP/gAAP4AAAD/5/+f//////////////////////8AOB///////////+CAA/gAP/gAAAAAAAP/j/////////////////////////+AAH///////////4AgwHAAD+AAAAAAAB//H///////////////////////v/wAAP///////////wAA/AAAB+AAAAAAAB/+H//////////////////////nP+AAAX//z////////wAA/wAAAOAAAAAAAB//Dz////////////////////+A/YAAAA/yAD///////gAA/4wAAAAAAAAAAB//A////////////////////+eDgAAAAADwAAf//////4AA/94AAAAAAAAA4Ax+A///////////////////4AAPAAAAAADYAAD//////4AAf/8AAAAAAAAA8AC8G///////////////////gAAfgAAAAAMAAAA///////wAf/8AAAAAAAAA4AO8H///////////////////AAB/gAAAABgAAAA///////+A///AAAAAAAAAcANQH//////////////////8AAB/AAAAAAAAAAAf///////z///4AAAAAAAHPAOn///////////////////+CAB8AAAAAAAAAABP///////x///8AAAAAAAPfB//////////////////////+AA8AAAAAAAAAAAj///////x///8AAAAAAAOPz//////////////////////+AAwAAAAAAAAAAAD///////////8AAAAAAAAPn//////////////////////6AAgAAAAAAAAAAAH///////////MAAAAAAAA4f//////////////////////7AAAAAAAAAAAAAABv////////8MPAAAAAAAAD///////////////////////zAAAAAAAAAAAAAAAH/////////gfgAAAAAAAf///////////////////////yAAAAAAAAAAAAAAAf/////////gCgAAAAAAAH///////////////////////iAAAAAAAAAAAAAAAP/////////tAAAAAAAAAD/////eP/h//////////////BAAAAAAAAAAAAAAAP/////////+AAAAAAAAAB//f//P/+B/////////////+AAAAAAAAAAAAAAAAP////////8wAAAAAAAAAD//H/+AP+P/////////////8GAAAAAAAAAAAAAAAf////////wAAAAAAAAAH//jz/8AD+H/////////////4PwAAAAAAAAAAAAAAf////////gAAAAAAAAAH/4N4/8AB/B////////////+ALAAAAAAAAAAAAAAAP////////gAAAAAAAAAH/wAcf+Ph/g////////////8AAAAAAAAAAAAAAAAAf///////8AAAAAAAAAAH/AMHfP///x///////////P4AMAAAAAAAAAAAAAAAP///////8AAAAAAAAAAP/AMCOP///h//////////+RwAMAAAAAAAAAAAAAAAH///////oAAAAAAAAAAP/AAEHP///g//////////8B4AYAAAAAAAAAAAAAAAH///////wAAAAAAAAAAH+AEYGH///w//////////+w4C4AAAAAAAAAAAAAAAD///////wAAAAAAAAAAAg/+ACBM//////////////g4D4AAAAAAAAAAAAAAAB///////wAAAAAAAAAAAz/+ABwE/////////////+A4/4AAAAAAAAAAAAAAAB///////AAAAAAAAAAAB//8AAAB//////////////AhmAAAAAAAAAAAAAAAAAP/////+AAAAAAAAAAAD//+AAAB//////////////gHgAAAAAAAAAAAAAAAAAH/////4AAAAAAAAAAAP///4OAB//////////////gDAAAAAAAAAAAAAAAAAAG/////4AAAAAAAAAAAP///8P4z//////////////wCAAAAAAAAAAAAAAAAAACf////4AAAAAAAAAAAP/////////////////////gAAAAAAAAAAAAAAAAAAABf//hgYAAAAAAAAAAAP/////////P///////////wAAAAAAAAAAAAAAAAAAAAv/+AAYAAAAAAAAAAA///////9//H///////////wAAAAAAAAAAAAAAAAAAAB3/+AAcAAAAAAAAAAD///////5//j///////////gAAAAAAAAAAAAAAAAAAAAT/+AAMgAAAAAAAAAH///////8//wn//////////AAAAAAAAAAAAAAAAAAAAAJ/+AAEAAAAAAAAAAH///////+f/8R/////////+AAAAAAAAAAAAAAAAAAAAAM/8AAAAAAAAAAAAAP///////+f/44Af///////8wAAAAAAAAAAAAAAAAAAAAGf8AAAAAAAAAAAAAP////////P//+AP///////4gAAAAAAAAAAAAAAAAAAAAAP8AAvAAAAAAAAAAf////////H///AH//////+AgAAAAAAAAAAAAAAAAAAAAAP+A4BgAAAAAAAAAf////////n//+AD//4P//IAAAAAAAAAAAAAAAAAAAAAAAP+B4AcAAAAAAAAAf////////j//8AAf/4P/8AAAAAAAAAAAAAAAAgAAAAAAAH/B4AB4AAAAAAAAf////////h//8AAf/gH/84AAAAAAAAAAAAAAAAAAAAAAAD/vwAn5AAAAAAAAP////////x//4AAf/AD/8QAwAAAAAAAAAAAAAAAAAAAAAAf/wAAAAAAAAAAAf////////4//gAAf+AD/+AAwAAAAAAAAAAAAAAAAAAAAAAH/gAAAAAAAAAAAf////////4f8AAAf8AD//AAwAAAAAAAAAAAAAAAAAAAAAAAH/gAAAAAAAAAAf////////8f8AAAPwAAP/gAwAAAAAAAAAAAAAAAAAAAAAAAD/gAAAAAAAAAAf////////+fgAAAPwAAP/gA4AAAAAAAAAAAAAAAAAAAAAAAA/AAAAAAAAAAAf/////////eAAAAPwAAP/gAsAAAAAAAAAAAAAAAAAAAAAAAAHgAgAAAAAAAAf/////////gAAAAHwAAM/gACAAAAAAAAAAAAAAAAAAAAAAAADABIAAAAAAAAP/////////g4AAAHwAAEfgBLAAAAAAAAAAAAAAAAAAAAAAAADgP/aAAAAAAAH//////////4AAADwAAIOAAEAAAAAAAAAAAAAAAAAAAAAAAAByP/+AAAAAAAD//////////4AAADoAAIEACJAAAAAAAAAAAAAAAAAAAAAAAAA9///AAAAAAAB//////////wAAABYAAMAAAHAAAAAAAAAAAAAAAAAAAAAAAAAE///wAAAAAAB//////////wAAAAMAAEAAALgAAAAAAAAAAAAAAAAAAAAAAAAA///wAAAAAAAf/////////gAAAAMAADAAMDAAAAAAAAAAAAAAAAAAAAAAAAAA////gAAAAAAP+B///////gAAAAAABDgAeAAAAAAAAAAAAAAAAAAAAAAAAAAA////wAAAAAAAAAv//////AAAAAAAAzgA+AAAAAAAAAAAAAAAAAAAAAAAAAAA////4AAAAAAAAAH/////+AAAAAAAAZgB4AAAAAAAAAAAAAAAAAAAAAAAAAAB////4AAAAAAAAAH/////8AAAAAAAAcwH8AAAAAAAAAAAAAAAAAAAAAAAAAAB////8AAAAAAAAAH/////wAAAAAAAAHQf8AYAAAAAAAAAAAAAAAAAAAAAAAAD////8AAAAAAAAAH/////gAAAAAAAAHgf88YAAAAAAAAAAAAAAAAAAAAAAAAH////+AAAAAAAAAH/////AAAAAAAAADgf9AAgAAAAAAAAAAAAAAAAAAAAAAAH/////4AAAAAAAAH/////AAAAAAAAAD4P5wAxAAAAAAAAAAAAAAAAAAAAAAAH//////AAAAAAAAD////8AAAAAAAAAB8P5wAz4AgAAAAAAAAAAAAAAAAAAAAH//////4AAAAAAAB////8AAAAAAAAAA8AxQif/AIAAAAAAAAAAAAAAAAAAAAP//////+AAAAAAAB////4AAAAAAAAAAcABYAD/wQAAAAAAAAAAAAAAAAAAAAH///////gAAAAAAA////4AAAAAAAAAAMAAIAI/ziAAAAAAAAAAAAAAAAAAAAH///////gAAAAAAA////4AAAAAAAAAAHEAAAA/8BgAAAAAAAAAAAAAAAAAAAD///////gAAAAAAAf///4AAAAAAAAAAB+AAAA/4AIAAAAAAAAAAAAAAAAAAAB///////gAAAAAAAf///4AAAAAAAAAAAAm5gAOMAAAAAAAAAAAAAAAAAAAAAB///////AAAAAAAAf///8AAAAAAAAAAAABCAAAHAHAAAAAAAAAAAAAAAAAAAA//////+AAAAAAAAf///8AAAAAAAAAAAAAAAACAgBAAAAAAAAAAAAAAAAAAAA//////+AAAAAAAAf///8AAAAAAAAAAAAAAAgCAAAAAAAAAAAAAAAAAAAAAAAf/////8AAAAAAAAf///+AQAAAAAAAAAAAAD+CAAAAAAAAAAAAAAAAAAAAAAAf/////4AAAAAAAA////+AwAAAAAAAAAAAAD8HAAAAAAAAAAAAAAAAAAAAAAAP/////4AAAAAAAA////+BwAAAAAAAAAAAB34HgAACAAAAAAAAAAAAAAAAAAAH/////4AAAAAAAA////8DwAAAAAAAAAAAD/8HgAAAAAAAAAAAAAAAAAAAAAAB/////4AAAAAAAB////4PwAAAAAAAAAAAH//HgAABADAAAAAAAAAAAAAAAAAA/////4AAAAAAAB////gPgAAAAAAAAAAAP///wAAAAGAAAAAAAAAAAAAAAAAAf////wAAAAAAAA////APgAAAAAAAAAAAf///wAAAAAAAAAAAAAAAAAAAAAAAP////wAAAAAAAAf//+APgAAAAAAAAAAAf///8AAAAAAAAAAAAAAAAAAAAAAAP////gAAAAAAAAf//+APgAAAAAAAAAAP////+AAIAAAAAAAAAAAAAAAAAAAAP////gAAAAAAAAP//+AfAAAAAAAAAAAf////+AAGAAAAAAAAAAAAAAAAAAAAf////AAAAAAAAAP///AfAAAAAAAAAAB//////gAAAAAAAAAAAAAAAAAAAAAAf///4AAAAAAAAAP///AfAAAAAAAAAAB//////gAAAAAAAAAAAAAAAAAAAAAAf///gAAAAAAAAAP//+AOAAAAAAAAAAB//////wAAAAAAAAAAAAAAAAAAAAAAf///AAAAAAAAAAP//4AAAAAAAAAAAAA//////4AAAAAAAAAAAAAAAAAAAAAAf//+AAAAAAAAAAH//4AAAAAAAAAAAAB//////4AAAAAAAAAAAAAAAAAAAAAAf//+AAAAAAAAAAH//4AAAAAAAAAAAAA//////4AAAAAAAAAAAAAAAAAAAAAA///+AAAAAAAAAAD//wAAAAAAAAAAAAA//////8AAAAAAAAAAAAAAAAAAAAAA///8AAAAAAAAAAB//gAAAAAAAAAAAAAf/////4AAAAAAAAAAAAAAAAAAAAAA///8AAAAAAAAAAB//AAAAAAAAAAAAAAf/////4AAAAAAAAAAAAAAAAAAAAAA///4AAAAAAAAAAA/+AAAAAAAAAAAAAAf/8///4AAAAAAAAAAAAAAAAAAAAAA///gAAAAAAAAAAA/8AAAAAAAAAAAAAAf+AP//wAAAAAAAAAAAAAAAAAAAAAA///gAAAAAAAAAAA/wAAAAAAAAAAAAAAf8AG//gAAAAAAAAAAAAAAAAAAAAAA//3AAAAAAAAAAAAQAAAAAAAAAAAAAAAOAAF//gAACAAAAAAAAAAAAAAAAAAB//4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//AAABAAAAAAAAAAAAAAAAAAB//4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/AAAAgAAAAAAAAAAAAAAAAAD//4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/AAAAyAAAAAAAAAAAAAAAAAD//gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADYAAAA8AAAAAAAAAAAAAAAAAD/8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4AAAAAAAAAAAAAAAAAD/8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAACYAAAAAAAAAAAAAAAAAD/gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcAAADAAAAAAAAAAAAAAAAAAH/4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcAAAGAAAAAAAAAAAAAAAAAAB/gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAeAAAAAAAAAAAAAAAAAAH/gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4AAAAAAAAAAAAAAAAAAH+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB4AAAAAAAAAAAAAAAAAAP+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAAAAAAAAAAAAAAAH/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP8AAAAAAAAAAAAAAAAAAAAAAMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP4BwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
  var bin = atob(MASK);
  var land = new Uint8Array(360 * 180);
  for (var i = 0; i < bin.length; i++) {
    var byte = bin.charCodeAt(i);
    for (var k = 0; k < 8; k++) land[i * 8 + k] = (byte >> (7 - k)) & 1;
  }
  function isLand(lat, lon) {
    var x = Math.floor(lon + 180) % 360; if (x < 0) x += 360;
    var y = Math.floor(90 - lat);
    return (y >= 0 && y < 180) ? land[y * 360 + x] : 0;
  }

  var D2R = Math.PI / 180;
  function vec(latDeg, lonDeg) {
    var la = latDeg * D2R, lo = lonDeg * D2R;
    return [Math.cos(la) * Math.cos(lo), Math.cos(la) * Math.sin(lo), Math.sin(la)];
  }

  /* Points : une rangée tous les 2° de latitude, espacement uniforme en longitude */
  var dots = [];
  for (var lat = -58; lat <= 84; lat += 2) {
    var n = Math.max(1, Math.round(180 * Math.cos(lat * D2R)));
    for (var j = 0; j < n; j++) {
      var lon = -180 + (360 * j) / n;
      if (isLand(lat, lon)) dots.push(vec(lat, lon));
    }
  }

  /* Origine et régions desservies (les quatre repères de la carte du site) */
  var ORIGIN = { fr: 'Fès', en: 'Fès', v: vec(34.03, -5.0) };
  var DEST = [
    { fr: 'Europe',       en: 'Europe',      v: vec(47, 8),   dx: 10,  dy: -8,  align: 'left'  },
    { fr: 'Amériques',    en: 'Americas',    v: vec(22, -78), dx: 12,  dy: -10, align: 'left'  },
    { fr: 'Moyen-Orient', en: 'Middle East', v: vec(26, 45),  dx: 10,  dy: -8,  align: 'left'  },
    { fr: 'Afrique',      en: 'Africa',      v: vec(6, 12),   dx: 10,  dy: 14,  align: 'left'  }
  ];

  /* Arc de grand cercle entre deux vecteurs, soulevé au milieu */
  function slerp(a, b, t) {
    var d = Math.max(-1, Math.min(1, a[0]*b[0] + a[1]*b[1] + a[2]*b[2]));
    var om = Math.acos(d), so = Math.sin(om);
    if (so < 1e-6) return a.slice();
    var s1 = Math.sin((1 - t) * om) / so, s2 = Math.sin(t * om) / so;
    return [a[0]*s1 + b[0]*s2, a[1]*s1 + b[1]*s2, a[2]*s1 + b[2]*s2];
  }
  function angle(a, b) { return Math.acos(Math.max(-1, Math.min(1, a[0]*b[0] + a[1]*b[1] + a[2]*b[2]))); }

  var STEPS = 48;
  DEST.forEach(function (d) {
    var ang = angle(ORIGIN.v, d.v);
    d.arc = [];
    for (var s = 0; s <= STEPS; s++) {
      var t = s / STEPS, p = slerp(ORIGIN.v, d.v, t);
      var rr = 1 + 0.32 * Math.sin(Math.PI * t) * Math.min(1, ang / 1.6);
      d.arc.push([p[0] * rr, p[1] * rr, p[2] * rr]);
    }
  });

  /* Taille (dpr) */
  var size = 0, R = 0, cx = 0, cy = 0, dpr = 1;
  function resize() {
    var box = canvas.parentNode.getBoundingClientRect();
    size = Math.max(280, Math.round(box.width));
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr; canvas.height = size * dpr;
    canvas.style.width = size + 'px'; canvas.style.height = size + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cx = cy = size / 2; R = size * 0.45;
  }

  /* Caméra : centrée sur (lam0, phi0) */
  var cam = { e: [0, 1, 0], n: [0, 0, 1], f: [1, 0, 0] };
  function setCamera(lamDeg, phiDeg) {
    var l = lamDeg * D2R, p = phiDeg * D2R;
    cam.f = [Math.cos(p) * Math.cos(l), Math.cos(p) * Math.sin(l), Math.sin(p)];
    cam.e = [-Math.sin(l), Math.cos(l), 0];
    cam.n = [-Math.sin(p) * Math.cos(l), -Math.sin(p) * Math.sin(l), Math.cos(p)];
  }
  function proj(p) {
    var xe = p[0]*cam.e[0] + p[1]*cam.e[1] + p[2]*cam.e[2];
    var yn = p[0]*cam.n[0] + p[1]*cam.n[1] + p[2]*cam.n[2];
    var z  = p[0]*cam.f[0] + p[1]*cam.f[1] + p[2]*cam.f[2];
    return { x: cx + R * xe, y: cy - R * yn, z: z, vis: !(z < 0 && xe*xe + yn*yn < 1) };
  }

  var GOLD = '#DDAA00';
  var lang = function () { return document.documentElement.lang === 'en' ? 'en' : 'fr'; };
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var drag = { on: false, x: 0, off: 0 };
  var PERIOD = 7.5;

  function draw(t) {
    ctx.clearRect(0, 0, size, size);

    /* Léger balancement autour de l'Afrique du Nord + glisser pour tourner */
    var lam0 = -8 + (reduced ? 0 : 42 * Math.sin(t * 0.14)) + drag.off;
    setCamera(lam0, 30);

    /* Sphère */
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.04)'; ctx.fill();
    ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(255,255,255,0.22)'; ctx.stroke();

    /* Terres */
    var r = Math.max(1.1, R * 0.0048);
    for (var i = 0; i < dots.length; i++) {
      var p = dots[i];
      var z = p[0]*cam.f[0] + p[1]*cam.f[1] + p[2]*cam.f[2];
      if (z <= 0) continue;
      var x = cx + R * (p[0]*cam.e[0] + p[1]*cam.e[1] + p[2]*cam.e[2]);
      var y = cy - R * (p[0]*cam.n[0] + p[1]*cam.n[1] + p[2]*cam.n[2]);
      ctx.fillStyle = 'rgba(255,255,255,' + (0.18 + 0.5 * z).toFixed(3) + ')';
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }

    var L = lang();

    /* Arcs animés depuis Fès */
    for (var d = 0; d < DEST.length; d++) {
      var D = DEST[d];
      var ph = reduced ? 0.6 : (((t - d * 1.4) % PERIOD) + PERIOD) % PERIOD / PERIOD; /* 0..1 */
      var grow = Math.min(1, ph / 0.42);
      var fade = ph > 0.82 ? Math.max(0, 1 - (ph - 0.82) / 0.18) : 1;
      var upto = Math.floor(grow * STEPS);

      ctx.lineWidth = Math.max(1.4, R * 0.0045);
      ctx.lineCap = 'round';
      ctx.strokeStyle = 'rgba(221,170,0,' + (0.95 * fade).toFixed(3) + ')';
      var pen = false;
      ctx.beginPath();
      for (var s = 0; s <= upto; s++) {
        var q = proj(D.arc[s]);
        if (!q.vis) { pen = false; continue; }
        if (!pen) { ctx.moveTo(q.x, q.y); pen = true; } else { ctx.lineTo(q.x, q.y); }
      }
      ctx.stroke();

      /* Tête de l'arc */
      if (grow < 1 && upto > 0) {
        var hd = proj(D.arc[upto]);
        if (hd.vis) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(hd.x, hd.y, r * 2, 0, Math.PI * 2); ctx.fill(); }
      }

      /* Point d'arrivée, anneau qui s'élargit */
      var dp = proj(D.v);
      if (dp.vis && dp.z > 0) {
        if (grow >= 1 && !reduced) {
          var rp = Math.min(1, (ph - 0.42) / 0.4);
          if (rp >= 0 && rp <= 1) {
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = 'rgba(221,170,0,' + (0.9 * (1 - rp)).toFixed(3) + ')';
            ctx.beginPath(); ctx.arc(dp.x, dp.y, R * 0.02 + rp * R * 0.07, 0, Math.PI * 2); ctx.stroke();
          }
        }
        ctx.fillStyle = GOLD;
        ctx.beginPath(); ctx.arc(dp.x, dp.y, Math.max(3.2, R * 0.012), 0, Math.PI * 2); ctx.fill();

        ctx.font = '400 ' + Math.max(13, Math.round(R * 0.04)) + 'px "Gill Sans","Gill Sans MT",Lato,sans-serif';
        ctx.textAlign = D.align; ctx.textBaseline = 'middle';
        ctx.fillStyle = 'rgba(255,255,255,' + (0.35 + 0.65 * dp.z).toFixed(3) + ')';
        ctx.fillText(D[L].toUpperCase(), dp.x + D.dx, dp.y + D.dy);
      }
    }

    /* Origine : Fès, pulsation continue */
    var op = proj(ORIGIN.v);
    if (op.vis && op.z > 0) {
      if (!reduced) {
        for (var w = 0; w < 2; w++) {
          var pr = (((t + w * 1.2) % 2.4) + 2.4) % 2.4 / 2.4;
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = 'rgba(221,170,0,' + (0.8 * (1 - pr)).toFixed(3) + ')';
          ctx.beginPath(); ctx.arc(op.x, op.y, R * 0.015 + pr * R * 0.06, 0, Math.PI * 2); ctx.stroke();
        }
      }
      ctx.fillStyle = GOLD;
      ctx.beginPath(); ctx.arc(op.x, op.y, Math.max(4.5, R * 0.017), 0, Math.PI * 2); ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = '#fff';
      ctx.beginPath(); ctx.arc(op.x, op.y, Math.max(4.5, R * 0.017), 0, Math.PI * 2); ctx.stroke();
      ctx.font = '700 ' + Math.max(14, Math.round(R * 0.045)) + 'px "Gill Sans","Gill Sans MT",Lato,sans-serif';
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      ctx.fillStyle = '#fff';
      ctx.fillText(ORIGIN[L].toUpperCase(), op.x - 12, op.y - 2);
    }
  }

  /* Boucle d'animation, uniquement quand le globe est visible */
  var running = false, t0 = performance.now(), raf = 0;
  function frame(now) {
    if (!running) return;
    if (!drag.on) drag.off *= 0.97;            /* revient doucement après un glisser */
    draw((now - t0) / 1000);
    raf = requestAnimationFrame(frame);
  }
  function start() { if (running || reduced) return; running = true; raf = requestAnimationFrame(frame); }
  function stop() { running = false; cancelAnimationFrame(raf); }

  resize();
  draw(0);
  window.addEventListener('resize', function () { resize(); draw((performance.now() - t0) / 1000); });

  if ('IntersectionObserver' in window && !reduced) {
    new IntersectionObserver(function (es) { es[0].isIntersecting ? start() : stop(); }, { threshold: 0.1 }).observe(canvas);
  } else if (!reduced) { start(); }

  /* Glisser pour faire tourner le globe */
  canvas.addEventListener('pointerdown', function (e) { drag.on = true; drag.x = e.clientX; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', function (e) {
    if (!drag.on) return;
    drag.off -= (e.clientX - drag.x) * 0.35; drag.x = e.clientX;
    drag.off = Math.max(-110, Math.min(110, drag.off));
    if (reduced) draw((performance.now() - t0) / 1000);
  });
  function release() { drag.on = false; }
  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', release);
})();
