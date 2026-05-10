/**
 * Archivo: ProcessSection.jsx
 * Responsabilidad: mostrar la metodología de trabajo del equipo en 3 etapas.
 */
const steps = [
  {
    step: "01",
    title: "Design and simulation",
    text: "Sketches, CAD, and testing: we define form and function before manufacturing.",
  },
  {
    step: "02",
    title: "Manufacturing and testing",
    text: "Workshop, iterations, and testing: we tune until the full package performs as expected.",
  },
  {
    step: "03",
    title: "Story and presentation",
    text: "We communicate the project: brand, social channels, and sponsor outreach with a consistent message.",
  },
];

export default function ProcessSection() {
  return (
    <section id="proceso" className="section section-process">
      <div className="container">
        <div className="section-head">
          <p className="eyebrow">Methodology</p>
          <h2>How we work</h2>
          <p className="section-lead">
            A simple workflow so technical work and public communication move forward together.
          </p>
        </div>

        {/* Render dinámico para mantener contenido consistente/expandible por pasos */}
        <ol className="process-steps">
          {steps.map((item) => (
            <li key={item.step} className="process-step clean-panel">
              <span className="process-step-num" aria-hidden>
                {item.step}
              </span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
