// src/components/AsiSeVe.jsx
// 👉 Si querés importarla desde /src/assets/ descomentá y cambia el path:
// import preview from '../assets/image/belleza-glow.webp';
import "./style/asiseve.css";
export default function AsiSeVe() {
  return (
    <section className="preview-section" aria-labelledby="preview-title">
      <div className="container preview">
        {/* deco brillos */}
        <svg className="preview-sparkles" viewBox="0 0 140 140" aria-hidden="true">
          <path d="M70 6l9 33 33 9-33 9-9 33-9-33-33-9 33-9z" fill="#e6b3a4" opacity=".45"/>
          <path d="M16 84l4 12 12 4-12 4-4 12-4-12-12-4 12-4z" fill="#e6b3a4" opacity=".45"/>
        </svg>

        <h2 id="preview-title" className="preview__title">ASÍ SE VE NUESTRO LIBRO</h2>

        {/* imagen del libro */}
        <div className="preview__image-wrap">
          <img
            className="preview__image"
            src="/image/libro.webp"
            alt="Vista previa del libro Belleza Glow"
          />
        </div>

        {/* bullets */}
        <ul className="preview__list">
          <li><span>💄</span> La guía práctica para diseñar tu propia línea de belleza artesanal en 7 días.</li>
          <li><span>💄</span> Aprendé a formular con seguridad y vender desde casa.</li>
          <li><span>💄</span> De cero a catálogo en una semana.</li>
          <li><span>💄</span> Tu atajo a la cosmética natural que enamora.</li>
        </ul>

        {/* deco pote */}
        <svg className="preview-jar" viewBox="0 0 200 130" aria-hidden="true">
          <rect x="40" y="56" width="120" height="54" rx="10" fill="#d2b49a"/>
          <rect x="36" y="46" width="128" height="14" rx="7" fill="#9b7a63"/>
          <path d="M50 46c22-22 78-22 100 0" fill="none" stroke="#9b7a63" strokeWidth="4" opacity=".7"/>
          <path d="M56 46c16-18 68-18 88 0" fill="#f4e9e2" opacity=".95"/>
          <rect x="68" y="70" width="72" height="30" rx="6" fill="#e9d5c7" opacity=".9"/>
        </svg>
      </div>
    </section>
  );
}
// Nota: los SVG son decorativos, no tienen contenido relevante.
// El prop imgSrc es opcional, si no se pasa usa la imagen por defecto.