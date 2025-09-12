import { useEffect, useRef, useState } from "react";
import "./style/reviews.css";
import data from "../../data/reviews.json";

export default function Reviews() {
  const REVIEWS = Array.isArray(data) ? data : data.items || [];
  const track = useRef(null);
  const [idx, setIdx] = useState(0);

   const go = (i) => {
    const el = track.current; if(!el || REVIEWS.length === 0) return;
    const next = (i + REVIEWS.length) % REVIEWS.length;
    setIdx(next);
    el.scrollTo({ left: el.getBoundingClientRect().width * next, behavior: "smooth" });
  };


 useEffect(()=>{
    if (REVIEWS.length <= 1) return;     

    const id = setInterval(()=>go(idx+1), 6000);
    return ()=>clearInterval(id);
    
  }, [idx, REVIEWS.length]);

 if (REVIEWS.length === 0) return null;

  return (
    <section className="reviews round-xl shadow ring">
      <div
        ref={track}
        className="track"
        role="region"
        aria-roledescription="carrusel"
        aria-label="Opiniones de clientes"
      >
        {REVIEWS.map((i) => (
          <article
            key={i.b}
            className="card"
            role="group"
            aria-label={`${i.b} de ${REVIEWS.length}`}
          >
            <header className="card-head">
              <div className="avatar" aria-hidden="true">
                {i.n[0].toUpperCase()}
              </div>
              <div>
                <div className="name">
                  {i.n} <span title="Compra verificada">✅</span>
                </div>
                <div className="meta">{i.meta}</div>
              </div>
            </header>
            <div className="stars" aria-label="5 de 5">
              ★★★★★
            </div>
            <h4>“{i.t}”</h4>
            <p>{i.b}</p>
          </article>
        ))}
      </div>

      <div className="controls">
        <button
          className="btn-ghost"
          aria-label="Anterior"
          onClick={() => go(idx - 1)}
        >
          ‹
        </button>
        <button
          className="btn-ghost"
          aria-label="Siguiente"
          onClick={() => go(idx + 1)}
        >
          ›
        </button>
      </div>
    </section>
  );
}
// Nota: este componente es solo ilustrativo, no bloquea nada al expirar.
