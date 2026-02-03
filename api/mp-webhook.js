/* eslint-env node */
/* global Buffer */

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
    ${links}
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

    console.log("MP payment:", {
      id: pay.id,
      status: pay.status,
      external_reference: pay.external_reference,
      preference_id: pay.preference_id,
    });

    // Solo actuamos cuando el pago está aprobado
    if (pay.status === "approved") {
      // Email del comprador (payer o fallback en additional_info)
      const email = pay.payer?.email || pay.additional_info?.payer?.email || "";

      // Nombre “bonito” (o user del email si no hay nombre)
      const name =
        [pay.payer?.first_name, pay.payer?.last_name].filter(Boolean).join(" ") ||
        (email ? email.split("@")[0] : "");

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
    return res.end("ok");
  } catch (e) {
    console.error("Webhook error:", e);
    res.statusCode = 200;
    return res.end("ok");
  }
}
