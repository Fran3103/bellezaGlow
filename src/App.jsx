import { useEffect } from "react";
import Countdown from "./components/Countdown.jsx";
import Reviews from "./components/Reviews.jsx";
import { getFirstUtm, saveFirstUtm } from "./lib/utm.js";
import ParaVos from "./components/ParaVos.jsx";
import Aprenderas from "./components/Aprenderas.jsx";
import AsiSeVe from "./components/AsiSeVe.jsx";
import FAQ from "./components/FAQ.jsx";
import Hero from "./components/Hero.jsx";
import Presentacion from "./components/Presentacion.jsx";
import Bonuses from "./components/Bonuses.jsx";

export default function App() {
  useEffect(() => {
    saveFirstUtm();
  }, []);

  async function comprar() {
    const utm = getFirstUtm();
    const r = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ utm }),
    });
    const { url } = await r.json();
    // (Opcional) tracking en cliente
    window.gtag?.("event", "begin_checkout", {
      items: [{ item_id: "ebook-bg" }],
    });
    window.fbq?.("track", "InitiateCheckout", {
      content_ids: ["ebook-bg"],
      value: 99.0,
      currency: "ARS",
    });
    location.href = url;
  }

  return (
    <main>
      <section className="top-bar">
        <h2>50% OFF + Bono de regalo por tiempo limitado</h2>
      </section>
      {/*<div className="glow" aria-hidden="true"></div>
      <div className="glow-2" aria-hidden="true"></div>*/}

      <section>
        <Presentacion />
      </section>
      <section>
        <ParaVos />
      </section>
      <section>
        <Aprenderas />
      </section>
      <section>
        <AsiSeVe />
      </section>
      <section className="hero">
        <Hero onCta={comprar} />
      </section>

      <section className="container mt-10">
        <Countdown minutes={15} />
      </section>
      <section>
        <Bonuses />
      </section>
      <section className="container mt-10">
        <Reviews />
      </section>
      <section>
        <FAQ />
      </section>
    </main>
  );
}
// Nota: este componente es solo ilustrativo, no bloquea nada al expirar.
