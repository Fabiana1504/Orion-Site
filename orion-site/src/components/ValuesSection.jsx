const values = [
  {
    title: "Precision",
    text: "We measure, test, and refine. Every detail matters when you race against the clock and yourself.",
  },
  {
    title: "Teamwork",
    text: "Engineering, design, and communication at the same table. What we build belongs to all of us.",
  },
  {
    title: "Innovation",
    text: "Test ideas, fail fast, and come back with a better version. That is how Orion evolves.",
  },
  {
    title: "Responsibility",
    text: "Deadlines, sponsors, and the Orion brand: we take it seriously and communicate it clearly.",
  },
];

export default function ValuesSection() {
  return (
    <section id="values" className="section section-values">
      <div className="container">
        <div className="section-head section-head--center">
          <p className="eyebrow">Identity</p>
          <h2>Our values</h2>
          <p className="section-lead section-lead--center">
            What we share as a team before roles: our filter for decisions and for how we present ourselves.
          </p>
        </div>

        <ul className="values-grid">
          {values.map((item) => (
            <li key={item.title} className="values-card clean-panel">
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </li>
          ))}
        </ul>

        <div className="purpose-split">
          <article className="purpose-block clean-panel">
            <p className="eyebrow">Mission</p>
            <p className="purpose-text">
              Represent our school in STEM Racing with a car and a story that show technical discipline,
              creativity, and team pride.
            </p>
          </article>
          <article className="purpose-block clean-panel">
            <p className="eyebrow">Vision</p>
            <p className="purpose-text">
              Be a team people remember for how we compete and how we present ourselves: organized,
              ambitious, and human.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
