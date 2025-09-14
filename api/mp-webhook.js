/* eslint-env node */

/** ---------- helpers ---------- */
async function readJson(req) {
  try {
    if (req.body && typeof req.body === "object") return req.body;
    const chunks = [];
    for await (const c of req) chunks.push(c);
    return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
  } catch {
    return {};
  }
}

/** ---------- env ---------- */
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL =
  process.env.FROM_EMAIL || "Belleza Glow <hola@bellezaglow.com>";
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || "";
const SITE = (process.env.PUBLIC_SITE_URL || "https://bellezaglow.com").replace(
  /\/$/,
  ""
);

// DOWNLOAD_URLS como "clave|label,clave|label,..."
const DOWNLOADS = (process.env.DOWNLOAD_URLS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean)
  .map((entry, i) => {
    const [key, label] = entry.split("|");
    return {
      // usa el rewrite /d/:u (o /api/go?u=:u si no añadiste el rewrite)
      href: `${SITE}/d/${encodeURIComponent(key)}`,
      label: label || `Descargar archivo ${i + 1}`,
    };
  });

const SHEET_WEBHOOK_URL = process.env.SHEET_WEBHOOK_URL; // URL del Web App de Apps Script
const SHEET_SECRET = process.env.SHEET_SECRET; // Debe coincidir con tu doPost en Apps Script

/** ---------- email (Resend) ---------- */
async function sendDownloadEmail({ to, name, payId }) {
  if (!RESEND_API_KEY) throw new Error("Falta RESEND_API_KEY");
  if (!to) throw new Error("Falta email del comprador");
  if (!DOWNLOADS.length) throw new Error("Faltan DOWNLOAD_URLS");

  const links = DOWNLOADS.map(
    (d) => `
    <p>
      <a href="${d.href}" target="_blank" rel="noopener"
         style="display:inline-block;background:#16a34a;color:#fff;
                text-decoration:none;padding:12px 18px;border-radius:10px">
        ${d.label} ⬇️
      </a>
    </p>
  `
  ).join("");

  const html = `
  <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;line-height:1.6">
    <h2>¡Gracias por tu compra${name ? ", " + name : ""}! ✨</h2>
    <p>Tu guía <b>Belleza Glow</b> está lista. Guardá estos enlaces:</p>
    <ul>${links}</ul>
    <p>¿Problemas con el acceso? Escribinos a ${
      SUPPORT_EMAIL
        ? `<a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>`
        : "nuestro soporte"
    }.</p>
    <p style="color:#666;font-size:12px">Pago #${payId}</p>
  </div>`;

  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `mp-${payId}`, // evita duplicados si MP reintenta
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to,
      reply_to: SUPPORT_EMAIL || undefined,
      subject: "Tu acceso a Belleza Glow",
      html,
    }),
  });

  if (!r.ok) {
    const txt = await r.text();
    throw new Error("Fallo envío email: " + txt);
  }
}

/** ---------- Google Sheets (Apps Script) ---------- */
async function postToSheet(pay) {
  if (!SHEET_WEBHOOK_URL) return;

  // email con fallback
  const email =
    pay.payer?.email ||
    pay.additional_info?.payer?.email ||
    '';

  // nombre con múltiples fuentes
  const first =
    pay.payer?.first_name ||
    pay.additional_info?.payer?.first_name ||
    '';
  const last =
    pay.payer?.last_name ||
    pay.additional_info?.payer?.last_name ||
    '';
  let name = `${first} ${last}`.trim();

  if (!name) {
    // si fue con tarjeta, a veces viene el titular
    name = pay.card?.cardholder?.name ||
           (email ? email.split('@')[0] : '');
  }

  const row = {
    payment_id: pay.id,
    status: pay.status,
    email,
    name,
    amount: pay.transaction_amount,
    preference_id: pay.preference_id || '',
    external_reference: pay.external_reference || '',
    // si guardaste UTM en metadata al crear la preferencia:
    utm_source:   pay.metadata?.utm_source   || '',
    utm_medium:   pay.metadata?.utm_medium   || '',
    utm_campaign: pay.metadata?.utm_campaign || '',
    utm_id:       pay.metadata?.utm_id       || '',
    utm_term:     pay.metadata?.utm_term     || '',
    utm_content:  pay.metadata?.utm_content  || '',
  };

  try {
    const r = await fetch(`${SHEET_WEBHOOK_URL}?key=${encodeURIComponent(SHEET_SECRET || '')}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(row)
    });
    if (!r.ok) console.error('sheet post non-2xx:', r.status, await r.text());
  } catch (e) {
    console.error('sheet post error:', e);
  }
}
/** ---------- webhook ---------- */
export default async function handler(req, res) {
  // MP reintenta si no respondés 200. Si algo falla, logueamos pero devolvemos 200.
  if (req.method !== "POST") {
    res.statusCode = 200;
    return res.end("ok");
  }

  try {
    const body = await readJson(req);

    // MP suele mandar { type:'payment', data:{ id } } o { topic:'payment', id }
    const topic = body?.type || body?.topic;
    const payId =
      body?.data?.id || body?.id || body?.resource?.split("/")?.pop();

    if (topic !== "payment" || !payId) {
      console.log("Webhook ignorado:", body);
      res.statusCode = 200;
      return res.end("ok");
    }

    // Consultar detalle del pago
    const rr = await fetch(`https://api.mercadopago.com/v1/payments/${payId}`, {
      headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` },
    });
    const pay = await rr.json();

    if (!rr.ok) {
      console.error("MP payment fetch error:", payId, pay);
      res.statusCode = 200;
      return res.end("ok");
    }

    console.log(
      "MP payment status:",
      pay.status,
      "id:",
      pay.id,
      "ext_ref:",
      pay.external_reference
    );

    if (pay.status === "approved") {
      // 1) Registrar en Sheets (postToSheet espera el objeto pay original)
      await postToSheet(pay);

      // 2) Email del comprador (payer o fallback en additional_info)
      const email = pay.payer?.email || pay.additional_info?.payer?.email || "";

      // 3) Nombre “bonito” (o user del email si no hay nombre)
      const name =
        [pay.payer?.first_name, pay.payer?.last_name]
          .filter(Boolean)
          .join(" ") || (email ? email.split("@")[0] : "");

      // 4) Enviar email si hay dirección
      if (email) {
        try {
          await sendDownloadEmail({ to: email, name, payId: pay.id });
          console.log("Email enviado a:", email);
        } catch (e) {
          console.error("Error enviando email:", e);
        }
      } else {
        console.warn("Pago aprobado sin email del comprador:", pay.id);
      }
    }

    res.statusCode = 200;
    res.end("ok");
  } catch (e) {
    console.error("Webhook error:", e);
    res.statusCode = 200;
    res.end("ok");
  }
}
