// src/components/FAQ.jsx
import "./style/faq.css";
import data from "../../data/faq.json";



export default function FAQ() {

 const faqs = Array.isArray(data) ? data : (data.faqs || []); // ← saca el array

  if (faqs.length === 0) return null;
    
  return (
    <section className="faq-section" aria-labelledby="faq-title">
      <div className="container">
        <h2 id="faq-title" className="faq__title">Preguntas Frecuentes</h2>

        <div className="faq">
          {faqs.map((f, i) => (
            <details key={i} className="faq__item" {...(i === 0 ? { open: false } : {})}>
              <summary className="faq__sum">
                <span className="faq__check" aria-hidden="true"></span>
                <span className="faq__q">{f.q}</span>
                <span className="faq__chev" aria-hidden="true"></span>
              </summary>
              <div
                className="faq__a"
                dangerouslySetInnerHTML={{ __html: f.a }}
              />
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
