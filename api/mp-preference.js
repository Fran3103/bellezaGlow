/* eslint-env node */
/* global Buffer */
import crypto from "node:crypto";

const ALLOWED = [
  "https://bellezaglow.com",
  "http://localhost:5173", "http://localhost:3000", "http://localhost:3002"
];

function setCORS(req, res) {
  const origin = req.headers.origin || "";
  if (ALLOWED.includes(origin)) res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

async function readJson(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}"); }
  catch { return {}; }
}

export default async function handler(req, res) {
  setCORS(req, res);
  if (req.method === "OPTIONS") { res.statusCode = 204; return res.end(); }
  if (req.method !== "POST")   { res.statusCode = 405; return res.end("Method Not Allowed"); }

  // Prefiere PUBLIC_SITE_URL si existe

  const BASE  = (process.env.PUBLIC_SITE_URL?.trim() || 'https://bellezaglow.com').replace(/\/$/, "");

  try {
    const { utm = {} } = await readJson(req);
    const PRICE = Number(process.env.PRICE_AR || 0);
    const TOKEN = process.env.MP_ACCESS_TOKEN;

    if (!TOKEN || !PRICE) {
      res.statusCode = 400;
      res.setHeader("Content-Type","application/json");
      return res.end(JSON.stringify({ error: "Faltan MP_ACCESS_TOKEN o PRICE_AR" }));
    }

    const externalRef = crypto.randomUUID();

    const pref = {
      items: [{ title: "Belleza Glow – eBook", quantity: 1, currency_id: "ARS", unit_price: PRICE }],
      back_urls: {
        success: `${BASE}/#thanks`,
        pending: `${BASE}/#pending`,
        failure: `${BASE}/#cancelled`
      },
      auto_return: "approved", 
      notification_url: `${BASE}/api/mp-webhook`,            
      metadata: { ...utm, product_id: "ebook-bg" },
      external_reference: externalRef
    };

    const resp = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${TOKEN}` },
      body: JSON.stringify(pref),
    });

    const data = await resp.json();

    // DEBUG útil (miralo en logs de Vercel)
    console.log("MP pref ->", {
      tokenType: TOKEN.startsWith("APP_USR-") ? "prod" : "test",
      id: data?.id,
       collector_id: data?.collector_id,
      init_point: data?.init_point,
      sandbox_init_point: data?.sandbox_init_point
    });

    if (!resp.ok) {
      res.statusCode = 400;
      res.setHeader("Content-Type","application/json");
      return res.end(JSON.stringify({ error: data?.message || "Error creando preferencia", raw: data }));
    }

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "no-store");
    return res.end(JSON.stringify({ init_point: data.init_point }));
  } catch (e) {
    res.statusCode = 500;
    res.setHeader("Content-Type","application/json");
    return res.end(JSON.stringify({ error: "server_error", message: String(e?.message || e) }));
  }
}
