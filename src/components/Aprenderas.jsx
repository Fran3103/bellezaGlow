// src/components/Aprenderas.jsx
import "./style/aprenderas.css";
export default function Aprenderas() {
  return (
    <section className="learn-section" aria-labelledby="learn-title">
      <div className="container learn">
        {/* deco arriba (corazón/trazo) */}
        <svg className="learn-heart" viewBox="0 0 160 120" aria-hidden="true">
          <path
            d="M80 96C60 78 24 64 24 40a24 24 0 0 1 44-12A24 24 0 0 1 152 40c0 24-36 38-56 56Z"
            fill="none"
            stroke="#e6b3a4"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity=".55"
          />
          <path
            d="M20 22h24M116 22h24"
            stroke="#e6b3a4"
            strokeWidth="6"
            strokeLinecap="round"
            opacity=".35"
          />
        </svg>

        <h2 id="learn-title" className="learn__title">
          CON ESTE LIBRO APRENDERÁS A
        </h2>

        <ul className="learn__list">
          <li>
            <span>✅</span>
            <b> Aprenderás</b> a formular mantequillas corporales con textura
            sedosa y estable.
          </li>
          <li>
            <span>✅</span>
            <b> Podrás</b> elegir y combinar mantecas/aceites (karité, cacao,
            mango, jojoba, argán, etc.) según tu objetivo.
          </li>
          <li>
            <span>✅</span>
            <b> Aprenderás</b> a formular cremas desde base o desde cero (O/W y
            W/O) y cuándo conviene cada enfoque.
          </li>
          <li>
            <span>✅</span>
            <b> Sabrás</b> personalizar recetas para piel sensible, grasa o con
            eczema/dermatitis con elecciones de ingredientes más amables.
          </li>
          <li>
            <span>✅</span>
            <b> Podrás</b> lanzar una mini-línea coherente en 7 días con 3 SKUs y
            materiales listos.
          </li>
        </ul>

        {/* deco abajo (mano + frasco simple) */}
        <svg className="learn-hand" viewBox="0 0 220 120" aria-hidden="true">
          <path
            d="M30 90c22 6 46 4 66-8 10-6 18-4 24 0"
            fill="none"
            stroke="#9b7a63"
            strokeWidth="4"
            opacity=".45"
          />
          <rect
            x="140"
            y="48"
            width="44"
            height="28"
            rx="6"
            fill="#e9d5c7"
            stroke="#9b7a63"
            strokeWidth="3"
          />
          <rect x="136" y="40" width="52" height="10" rx="5" fill="#9b7a63" />
        </svg>
      </div>
    </section>
  );
}
// Nota: los SVG son decorativos, no tienen contenido relevante.
