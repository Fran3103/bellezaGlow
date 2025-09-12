// /api/checkout.js (CommonJS para Vercel Node.js)
const Stripe = require('stripe');

async function parseJson(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', c => data += c);
    req.on('end', () => {
      try { resolve(data ? JSON.parse(data) : {}); }
      catch (e) { reject(e); }
    });
    req.on('error', reject);
  });
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') { res.statusCode = 405; return res.end('Method Not Allowed'); }

  const body = await parseJson(req).catch(() => ({}));
  const stripe = new Stripe(process.env.STRIPE_KEY);

  const price = Number(process.env.PRICE_CENTS || 9900); // $99,00 ARS (ejemplo)
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{
      price_data: {
        currency: 'ars',
        product_data: { name: 'Belleza Glow — e-book' },
        unit_amount: price
      },
      quantity: 1
    }],
    success_url: 'https://TU-DOMINIO/thanks?ok=1',   // 🔁 reemplazá TU-DOMINIO
    cancel_url:  'https://TU-DOMINIO',               // 🔁 reemplazá TU-DOMINIO
    metadata: { product_id: 'ebook-bg', ...(body.utm || {}) }
  });

  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ url: session.url }));
};
// Nota: en Vercel (función Node.js) no hay body-parser automático; usamos parseJson arriba.    