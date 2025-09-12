// /api/stripe-webhook.js
const Stripe = require('stripe');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js'); // opcional
const { Resend } = require('resend'); // opcional

function buffer(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') { res.statusCode = 405; return res.end('Method Not Allowed'); }

  const stripe = new Stripe(process.env.STRIPE_KEY);
  const sig = req.headers['stripe-signature'];
  const raw = await buffer(req);

  let event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, process.env.STRIPE_WH_SECRET);
  } catch (e) {
    res.statusCode = 400; return res.end(`Webhook error: ${e.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const s = event.data.object;
    const email = s.customer_details?.email;
    const value = (s.amount_total || 0) / 100;
    const currency = (s.currency || 'ARS').toUpperCase();
    const eventId = s.id;

    // 1) Link presignado (Supabase Storage) — opcional
    let downloadUrl = '#';
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
      try {
        const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
        const { data, error } = await supabase
          .storage.from('ebooks')
          .createSignedUrl('belleza-glow.pdf', 60 * 60 * 48); // 48h
        if (!error && data?.signedUrl) downloadUrl = data.signedUrl;
        else console.error('Supabase error:', error);
      } catch (e) { console.error('Supabase exception:', e); }
    }

    // 2) Email (Resend) — opcional
    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: 'Belleza Glow <ventas@TU-DOMINIO>', // 🔁 remitente verificado
          to: email,
          subject: 'Tu e-book Belleza Glow',
          html: `<p>¡Gracias por tu compra!</p><p>Descargá tu e-book: <a href="${downloadUrl}">clic aquí</a> (vigente 48 h).</p>`
        });
      } catch (e) { console.error('Resend error:', e); }
    }

    // 3) GA4 — Measurement Protocol (server-side)
    if (process.env.GA4_MEAS_ID && process.env.GA4_API_SECRET) {
      try {
        await fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${process.env.GA4_MEAS_ID}&api_secret=${process.env.GA4_API_SECRET}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client_id: `${email}.${Date.now()}`,
            events: [{
              name: 'purchase',
              params: {
                currency, value,
                transaction_id: s.payment_intent,
                items: [{ item_id: 'ebook-bg', item_name: 'Belleza Glow', price: value, quantity: 1 }],
                ...s.metadata
              }
            }]
          })
        });
      } catch (e) { console.error('GA4 MP error:', e); }
    }

    // 4) Meta CAPI (server-side)
    if (process.env.META_PIXEL_ID && process.env.META_ACCESS_TOKEN) {
      try {
        const hashedEmail = email
          ? crypto.createHash('sha256').update(email.trim().toLowerCase()).digest('hex')
          : undefined;

        await fetch(`https://graph.facebook.com/v18.0/${process.env.META_PIXEL_ID}/events?access_token=${process.env.META_ACCESS_TOKEN}`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            data: [{
              event_name: 'Purchase',
              event_time: Math.floor(Date.now() / 1000),
              event_id: eventId, // dedupe si también disparás cliente
              user_data: { em: hashedEmail ? [hashedEmail] : [] },
              custom_data: { currency, value, content_ids: ['ebook-bg'], content_type: 'product' }
            }]
          })
        });
      } catch (e) { console.error('Meta CAPI error:', e); }
    }
  }

  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ received: true }));
};
// Nota: en Vercel (función Node.js) no hay body-parser automático; usamos buffer arriba.