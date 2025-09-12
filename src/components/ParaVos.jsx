// src/components/ParaVos.jsx
import "./style/paravos.css";
export default function ParaVos() {
  return (
    <section className="for-you-section" aria-labelledby="for-you-title">
      <div className="container for-you">
        {/* Decoración brillos */}
        <svg className="sparkles" viewBox="0 0 120 120" aria-hidden="true">
          <path
            d="M60 5 L68 36 L100 44 L68 52 L60 83 L52 52 L20 44 L52 36 Z"
            fill="#e6b3a4"
            opacity="0.45"
          />
          <path
            d="M18 78 L22 92 L36 96 L22 100 L18 114 L14 100 L0 96 L14 92 Z"
            fill="#e6b3a4"
            opacity="0.45"
          />
        </svg>

        <h2 id="for-you-title" className="for-you__title">
          ESTE LIBRO ES PARA VOS SI…
        </h2>

        <ul className="for-you__list">
          <li>
           <span>❗</span> te abruma tanta información suelta y no sabés por dónde empezar.
          </li>
          <li>
            <span>❗</span>te cansaste de tutoriales de internet que no explican el porqué de
            las cosas.
          </li>
          <li>
            <span>❗</span>querés producir con calma y seguridad, sin miedo a “hacerlo mal”.
          </li>
          <li>
            <span>❗</span>no sabés por dónde empezar y posponés el lanzamiento una y otra vez.
          </li>
          <li>
            <span>❗</span>intentaste emprender y te cansaste de “humo”: buscás resultados
            medibles y reales.
          </li>
        </ul>

        {/* Decoración pote */}
        <svg className="jar" viewBox="0 0 180 120" aria-hidden="true">
          <rect x="30" y="50" width="120" height="50" rx="10" fill="#d2b49a" />
          <rect x="25" y="40" width="130" height="16" rx="8" fill="#9b7a63" />
          <path d="M40 40 C60 15, 120 15, 140 40 Z" fill="#f4e9e2" />
          <rect
            x="55"
            y="62"
            width="70"
            height="28"
            rx="6"
            fill="#e9d5c7"
            opacity=".9"
          />
        </svg>
      </div>
    </section>
  );
}
// Nota: los SVG son decorativos, no tienen contenido relevante.
