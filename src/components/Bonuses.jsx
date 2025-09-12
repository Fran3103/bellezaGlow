// src/components/Bonuses.jsx
import data from "../../data/bonus.json";
import './style/bonuses.css'

const fmtARS = new Intl.NumberFormat("es-AR", {
  style: "currency", currency: "ARS", maximumFractionDigits: 0
});

export default function Bonuses() {
  const bonuses = Array.isArray(data) ? data : (data.bonuses || []);
  if (!bonuses.length) return null;

  return (
    <section className="bonuses-section" aria-labelledby="bonuses-title">
      <div className="container">
        <h2 id="bonuses-title" className="bonuses__title">
          Bonos de regalo incluidos
        </h2>

        <div className="bonuses-grid">
          {bonuses.map((b, i) => (
            <article key={`${b.title}-${i}`} className="bonus-card" role="group" aria-label={b.title}>
              <div className="bonus-thumb-wrap">
                <img className="bonus-thumb" src={b.image} alt={b.title} />
                <span className="bonus-pill">GRATIS</span>
              </div>

              <h3 className="bonus-title">{b.title}</h3>

              <div className="bonus-price">
                <span className="bonus-price-label">Valor</span>
                <span className="bonus-price-old">{fmtARS.format(b.value)}</span>
                <span className="bonus-price-free">Gratis con tu compra</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
