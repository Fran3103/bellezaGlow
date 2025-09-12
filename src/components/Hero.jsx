import "./style/hero.css";
import hero from "../../data/hero.json";

export default function Hero({ onCta }) {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="container ">
        <h1 id="hero-title">{hero.title}</h1>
        {/*<p className="lead">{hero.lead}</p>*/}
        <div className="hero-grid">
          {/* Columna imagen */}
          <div className="center">
            <img src={hero.imgSrc} alt={hero.imgAlt} className="mockup" />
          </div>
          {/* Columna texto */}
          <div className="hero-text">
            <span>{hero.download}</span>
            <h2>{hero.lead}</h2>
            <span className="star">{hero.reviews}</span>
            <div className="price">
              <p>{hero.oldPrice}</p>
              <p>{hero.price}</p>
            </div>
            <p className="cupos">{hero.cupos}</p>
            <div className="container-btn">
              <button className="btn-compra" onClick={onCta}>
                {hero.ctaText} <span>→</span>
              </button>
            </div>
            <details className="guarantee  guarantee--overlay">
              <summary className="guarantee__sum">
                <span className="guarantee__pill">
                  {hero.note}
                </span>
               
                <span className="guarantee__chev" aria-hidden="true"></span>
              </summary>

              <div className="guarantee__body">
                <ul className="guarantee__list">
                  <li>Vigente durante 7 días desde la compra.</li>
                  <li>Reintegramos al mismo medio de pago.</li>
                  <li>
                    Solo escribinos al mail que te llega con tu número de
                    pedido.
                  </li>
                </ul>
              </div>
            </details>
          </div>
        </div>
      </div>
    </section>
  );
}
