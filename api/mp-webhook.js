export default async function handler(req, res) {
  if (req.method !== 'POST') { res.statusCode = 200; return res.end('ok'); }
  try {
    // MP envía topic/type y data.id (payment id). Podés guardar en DB o consultar detalles.
    console.log('MP webhook:', req.body);
    res.statusCode = 200; res.end('ok');
  } catch (e) {
    res.statusCode = 500; res.end('error',e);
  }
}