/* eslint-env node */
/* global Buffer */

function setCORS(req, res) {
  const origin = req.headers.origin || '';
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Origin', origin || '*');
}

async function readJson(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'); }
  catch { return {}; }
}

export default async function handler(req, res) {
  setCORS(req, res);
  if (req.method === 'OPTIONS') { res.statusCode = 204; return res.end(); }
  if (req.method !== 'POST') { res.statusCode = 405; return res.end('Method Not Allowed'); }

  // Base según entorno
  const proto = req.headers['x-forwarded-proto'] || 'http';
  const host  = req.headers['x-forwarded-host'] || req.headers.host || '';
  const isLocal = /localhost|127\.0\.0\.1/.test(host);

  // Dominio público (https) para redirecciones
  const PUBLIC_BASE = (process.env.PUBLIC_SITE_URL || 'https://belleza-glow.vercel.app').replace(/\/$/, '');
  const RUNTIME_BASE = `${proto}://${host}`;
  const BASE = isLocal ? PUBLIC_BASE : RUNTIME_BASE;

  try {
    const { utm = {} } = await readJson(req);

    const PRICE = Number(process.env.PRICE_AR || 0);
    const TOKEN = process.env.MP_ACCESS_TOKEN;

    if (!TOKEN || !PRICE) {
      res.statusCode = 400;
      res.setHeader('Content-Type','application/json');
      return res.end(JSON.stringify({ error: 'Faltan MP_ACCESS_TOKEN o PRICE_AR' }));
    }

    const pref = {
      items: [{ title: 'Belleza Glow – eBook', quantity: 1, currency_id: 'ARS', unit_price: PRICE }],
      back_urls: {
        success: `${BASE}/thanks`,
        pending: `${BASE}/pending`,
        failure: `${BASE}/`
      },
      // En local NO mandamos auto_return para que MP no lo invalide
      ...( !isLocal ? { auto_return: 'approved' } : {} ),
      metadata: { ...utm, product_id: 'ebook-bg' }
    };

    const resp = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${TOKEN}` },
      body: JSON.stringify(pref),
    });

    const data = await resp.json();
    if (!resp.ok) {
      res.statusCode = 400;
      res.setHeader('Content-Type','application/json');
      return res.end(JSON.stringify({ error: data?.message || 'Error creando preferencia', raw: data }));
    }

    res.statusCode = 200;
    res.setHeader('Content-Type','application/json');
    return res.end(JSON.stringify({ init_point: data.init_point || data.sandbox_init_point }));
  } catch (e) {
    res.statusCode = 500;
    res.setHeader('Content-Type','application/json');
    return res.end(JSON.stringify({ error: 'server_error', message: String(e?.message || e) }));
  }
}
