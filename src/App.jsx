import { useEffect } from "react";
import Countdown from "./components/Countdown.jsx";
import Reviews from "./components/Reviews.jsx";
import { saveFirstUtm } from "./lib/utm.js";
import ParaVos from "./components/ParaVos.jsx";
import Aprenderas from "./components/Aprenderas.jsx";
import AsiSeVe from "./components/AsiSeVe.jsx";
import FAQ from "./components/FAQ.jsx";
import Hero from "./components/Hero.jsx";
import Presentacion from "./components/Presentacion.jsx";
import Bonuses from "./components/Bonuses.jsx";

export default function App() {
  useEffect(() => {
    // guarda UTM solo una vez
    try {
      saveFirstUtm();
    } catch (e) {
      /* ignorar */
      console.error("error al guardar", e);
    }
  }, []);

  async function comprar() {
    let utm = {};
    try {
      utm = JSON.parse(localStorage.getItem("first_utm") || "{}");
    } catch {}

    const r = await fetch("/api/mp-preference", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ utm }),
    });

    const { init_point, sandbox_init_point, error } = await r.json();
    console.log("MP pref ->", { init_point, sandbox_init_point, error });

    if (error || !init_point) {
      alert(error || "No pudimos iniciar el pago.");
      return;
    }

    // redirigir al checkout productivo:
    window.location.replace(init_point); // o window.location.href = init_point
  }
  return (
    <main>
      <section className="top-bar">
        <h2>50% OFF + Bono de regalo por tiempo limitado</h2>
      </section>

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
