// api/go.js
export default async function handler(req, res) {
  // Solo GET/HEAD
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET, HEAD');
    return res.end('Method Not Allowed');
  }

  // Clave corta tipo "ebook1"
  const key = (req.query?.u || '').toString().trim().toLowerCase();

  // Valida que sea una clave simple (evita intentos raros)
  if (!/^[a-z0-9_-]{1,32}$/.test(key)) {
    res.statusCode = 400;
    return res.end('Bad Request');
  }

  // Mapa de enlaces *whitelist* (no pasar URL directa por query)
  const MAP = Object.freeze({
    ebook1: process.env.EBOOK1_URL
  });

  const url = MAP[key];
  if (!url) {
    res.statusCode = 404;
    return res.end('Not found');
  }

  // No caché + no revelar referrer
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Referrer-Policy', 'no-referrer');

  // Redirección 302
  res.statusCode = 302;
  res.setHeader('Location', url);
  return res.end('Redirecting…');
}
