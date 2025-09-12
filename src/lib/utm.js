export function saveFirstUtm(){
  const p = new URLSearchParams(location.search);
  const has = ['utm_source','utm_medium','utm_campaign','utm_content','utm_term'].some(k=>p.get(k));
  if (has && !localStorage.getItem('utm_first')){
    const o = {};
    p.forEach((v,k)=>{ if(k.startsWith('utm_')) o[k]=v; });
    o.ts = Date.now();
    localStorage.setItem('utm_first', JSON.stringify(o));
  }
}
export function getFirstUtm(){
  try { return JSON.parse(localStorage.getItem('utm_first')||'null'); } catch { return null; }
}
// Nota: no uses URLSearchParams directamente en IE11 (no soporta iteradores)
// Ejemplo de uso en App.jsx:
// useEffect(() => { saveFirstUtm(); }, []);
// Y al enviar el checkout, adjuntar getFirstUtm() en el body (fetch / axios / etc)