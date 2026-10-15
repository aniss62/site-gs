/**
 * /api/contact : traite le formulaire de contact (remplace site/contact.php).
 * Variables d'environnement Vercel : SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, SMTP_TO
 * Répond en JSON : {"success": true} ou {"success": false, "error": "..."}
 */
const nodemailer = require('nodemailer');

// Limitation best-effort en mémoire (par instance, rien n'est stocké durablement).
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const COOLDOWN_MS = 30 * 1000;
const hits = new Map();

function rateLimit(key, now) {
  const list = (hits.get(key) || []).filter((t) => now - t < WINDOW_MS);
  if (list.length >= MAX_PER_WINDOW) return { error: 'Too many requests. Please try again later.', retry: 3600 };
  if (list.length && now - list[list.length - 1] < COOLDOWN_MS) return { error: 'Please wait a moment before submitting again.', retry: 30 };
  hits.set(key, list);
  return null;
}

function record(key, now) {
  const list = hits.get(key) || [];
  list.push(now);
  hits.set(key, list);
}

// Retire balises et retours chariot (anti-injection d'en-têtes), limite la longueur.
function clean(val, max) {
  return String(val || '').replace(/<[^>]*>/g, '').replace(/[\r\n]+/g, ' ').trim().slice(0, max);
}

function cleanMessage(val) {
  return String(val || '').replace(/<[^>]*>/g, '').replace(/\r/g, '').trim().slice(0, 5000);
}

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const body = req.body && typeof req.body === 'object' ? req.body : {};

  // Honeypot : on répond "succès" sans rien envoyer
  if (body.website) return res.status(200).json({ success: true });

  const now = Date.now();
  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  const limited = rateLimit(ip, now);
  if (limited) {
    res.setHeader('Retry-After', String(limited.retry));
    return res.status(429).json({ success: false, error: limited.error });
  }

  const name = clean(body.name, 120);
  const company = clean(body.company, 120);
  const country = clean(body.country, 80);
  const email = clean(body.email, 160);
  const phone = clean(body.phone, 40);
  const product = clean(body.product, 80);
  const message = cleanMessage(body.message);

  if (!name || !email || !message) {
    return res.status(422).json({ success: false, error: 'Missing required fields' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(422).json({ success: false, error: 'Invalid email' });
  }

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const from = process.env.SMTP_FROM || 'Office@lesgreniersdusaiss.ma';
  const to = process.env.SMTP_TO || 'Office@lesgreniersdusaiss.ma';

  if (!host) {
    console.error('[api/contact] SMTP_HOST manquant');
    return res.status(500).json({ success: false, error: 'Mail not configured' });
  }

  const lines = [
    'Nouveau message depuis le site Les Greniers du Saïss',
    '─'.repeat(50),
    '',
    `Nom       : ${name}`,
    company ? `Société   : ${company}` : null,
    country ? `Pays      : ${country}` : null,
    `Email     : ${email}`,
    phone ? `Téléphone : ${phone}` : null,
    product ? `Produit   : ${product}` : null,
    '',
    'Message :',
    message,
    '',
    '─'.repeat(50),
    `Envoyé le : ${new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Casablanca' })}`,
  ].filter((l) => l !== null);

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS || '' } : undefined,
    });
    await transporter.sendMail({
      from: `"Les Greniers du Saïss" <${from}>`,
      to,
      replyTo: `"${name.replace(/"/g, '')}" <${email}>`,
      subject: `Demande de contact : ${name}${company ? ` (${company})` : ''}`,
      text: lines.join('\n'),
    });
    record(ip, now);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('[api/contact] envoi échoué :', err && err.message);
    return res.status(500).json({ success: false, error: 'Mail send failed' });
  }
};
