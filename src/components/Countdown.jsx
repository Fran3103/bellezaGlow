import { useEffect, useState } from "react";
import "./style/countdown.css";

const DIAS = ['DOMINGO','LUNES','MARTES','MIÉRCOLES','JUEVES','VIERNES','SÁBADO'];

export default function Countdown({ minutes=15 }){
  const [left, setLeft] = useState(minutes*60);

  useEffect(()=>{
    const id = setInterval(()=> setLeft(s => s <= 0 ? minutes*60 : s-1), 1000);
    return () => clearInterval(id);
  }, [minutes]);

  const m = String(Math.floor(left/60)).padStart(2,'0');
  const s = String(left%60).padStart(2,'0');

  return (
    <section className="timer" aria-live="polite" role="status">
      <h3>¡OFERTA HOY {DIAS[new Date().getDay()]}!</h3>
      <p>Tu lugar estará <b>DISPONIBLE</b> durante <u>{minutes}</u> minutos.</p>
      <div className="clock">
        <span className="mm">{m}</span><span>:</span><span className="ss">{s}</span>
      </div>
      <div className="labels"><span>Minutos</span><span>Segundos</span></div>
    </section>
  );
}
// Nota: este componente es solo ilustrativo, no bloquea nada al expirar.