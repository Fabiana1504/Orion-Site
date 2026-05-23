"use client";

const values = [
  {
    title: "Discipline",
    text: "Discipline is the foundation of consistent and organized work that ensures quality, responsibility, and sustainable growth.",
  },
  {
    title: "Resilience",
    text: "Resilience is the ability to adapt and stay strong through challenges, turning difficulties into opportunities for growth and learning.",
  },
  {
    title: "Innovation",
    text: "Innovation is the constant pursuit of new ideas and solutions that drive meaningful impact, growth, and authentic connections.",
  },
  {
    title: "Creativity",
    text: "Creativity is the power to transform ideas into unique and inspiring experiences that build authentic connections and lasting impact.",
  },
];

export default function ValuesSection() {
  return (
    <section id="values" className="relative py-[clamp(72px,10vw,96px)]">
      <div
        className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2"
        style={{
          width: "min(900px, 90vw)",
          height: 1,
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.14), transparent)",
        }}
      />
      <div className="mx-auto w-[min(1120px,calc(100%-clamp(32px,7vw,56px)))]">
        <div className="mx-auto mb-10 max-w-[48rem] text-center">
          <p className="mb-3 font-sans text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[rgba(61,140,255,0.88)]">
            Identity
          </p>
          <h2>Our values</h2>
          <p className="m-0 mx-auto max-w-[42rem] text-[0.95rem] leading-[1.55] text-[rgba(244,246,251,0.58)]">
            What we share as a team before roles: our filter for decisions and for how we present ourselves.
          </p>
        </div>

        <div
          className="mb-12 grid gap-[clamp(18px,2.5vw,28px)]"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))" }}
        >
          <article
            className="rounded-[24px] border border-white/10 p-8 backdrop-blur-[20px] shadow-[0_12px_32px_rgba(0,0,0,0.25)]"
            style={{
              background: "linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01)), rgba(6,10,16,0.5)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 12px 32px rgba(0,0,0,0.25)",
            }}
          >
            <p className="mb-4 font-sans text-[0.8rem] font-bold uppercase tracking-[0.22em] text-[rgba(61,140,255,0.92)]">
              Mission
            </p>
            <p className="m-0 text-[1.15rem] leading-[1.65] text-[rgba(244,246,251,0.88)]">
              Represent our school in STEM Racing with a car and a story that show technical discipline,
              creativity, and team pride.
            </p>
          </article>
          <article
            className="rounded-[24px] border border-white/10 p-8 backdrop-blur-[20px] shadow-[0_12px_32px_rgba(0,0,0,0.25)]"
            style={{
              background: "linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01)), rgba(6,10,16,0.5)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 12px 32px rgba(0,0,0,0.25)",
            }}
          >
            <p className="mb-4 font-sans text-[0.8rem] font-bold uppercase tracking-[0.22em] text-[rgba(61,140,255,0.92)]">
              Vision
            </p>
            <p className="m-0 text-[1.15rem] leading-[1.65] text-[rgba(244,246,251,0.88)]">
              Be a team people remember for how we compete and how we present ourselves: organized,
              ambitious, and human.
            </p>
          </article>
        </div>

        <ul
          className="m-0 grid list-none gap-[clamp(14px,2.2vw,20px)] p-0"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))" }}
        >
          {values.map((item) => (
            <li
              key={item.title}
              className="m-0 rounded-[20px] border border-white/10 p-6 backdrop-blur-[20px] shadow-[0_12px_32px_rgba(0,0,0,0.25)]"
              style={{
                background: "linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01)), rgba(6,10,16,0.5)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 12px 32px rgba(0,0,0,0.25)",
              }}
            >
              <h3 className="mb-[10px] text-[rgba(255,255,255,0.96)]">{item.title}</h3>
              <p className="m-0 text-[0.92rem] leading-[1.6] text-[rgba(244,246,251,0.8)]">
                {item.text}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
