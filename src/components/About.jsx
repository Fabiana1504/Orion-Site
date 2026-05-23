"use client";

export default function About() {
  return (
    <section
      id="about"
      className="relative pt-[clamp(110px,14vw,160px)] pb-[clamp(72px,10vw,96px)]"
    >
      {/* Decorative background grid/ambient line */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 z-[1] -translate-x-1/2"
        style={{
          width: "min(1120px, 90vw)",
          height: 1,
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
        }}
      />
      
      <div className="mx-auto w-[min(1120px,calc(100%-clamp(32px,7vw,56px)))]">
        <div className="grid grid-cols-[1.1fr_0.9fr] gap-[clamp(32px,5vw,64px)] items-center max-[980px]:grid-cols-1">
          
          {/* Left Column - Intro */}
          <div className="flex flex-col justify-center">
            <p className="mb-3 font-sans text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[rgba(61,140,255,0.88)]">
              About us
            </p>
            <h2 className="mb-5 text-[clamp(2rem,4.5vw,3rem)] font-bold leading-tight tracking-tight text-white">
              Who we are
            </h2>
            <p className="m-0 max-w-[38rem] text-[clamp(0.92rem,1.5vw,1.05rem)] leading-[1.6] text-[rgba(244,246,251,0.68)]">
              Orion is our school STEM Racing team: we bring together engineering, design, and
              communication to compete and to tell our story clearly.
            </p>
          </div>

          {/* Right Column - Box with Header Blur Style */}
          <div
            className="relative overflow-hidden rounded-[28px] border border-white/10 p-[clamp(22px,4vw,32px)] backdrop-blur-[20px] shadow-[0_12px_32px_rgba(0,0,0,0.25)]"
            style={{
              background: "linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01)), rgba(6,10,16,0.5)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 12px 32px rgba(0,0,0,0.25)",
            }}
          >
            <div className="relative z-10 flex flex-col gap-6">
              <p className="m-0 text-[1.02rem] leading-[1.65] font-medium text-[rgba(244,246,251,0.95)]">
                "More than a group with different tasks, we are one identity: precision, teamwork,
                and ambition. Every decision is part of the same vision."
              </p>

              <hr className="border-white/10 my-1" />

              {/* Three Pillars */}
              <div className="flex flex-col gap-4">
                {/* Pillar 1 */}
                <div className="flex gap-3">
                  <div className="mt-1.5 flex size-2 shrink-0 rounded-full bg-[#3d8cff] shadow-[0_0_8px_#3d8cff]" />
                  <div>
                    <strong className="text-white text-[0.92rem] font-bold">Precision</strong>
                    <p className="m-0 text-[0.8rem] text-[rgba(244,246,251,0.58)] mt-0.5">
                      Analytical thinking and engineering accuracy in every step.
                    </p>
                  </div>
                </div>

                {/* Pillar 2 */}
                <div className="flex gap-3">
                  <div className="mt-1.5 flex size-2 shrink-0 rounded-full bg-[#3d8cff] shadow-[0_0_8px_#3d8cff]" />
                  <div>
                    <strong className="text-white text-[0.92rem] font-bold">Teamwork</strong>
                    <p className="m-0 text-[0.8rem] text-[rgba(244,246,251,0.58)] mt-0.5">
                      Synergy across design, manufacturing, and public relations.
                    </p>
                  </div>
                </div>

                {/* Pillar 3 */}
                <div className="flex gap-3">
                  <div className="mt-1.5 flex size-2 shrink-0 rounded-full bg-[#3d8cff] shadow-[0_0_8px_#3d8cff]" />
                  <div>
                    <strong className="text-white text-[0.92rem] font-bold">Ambition</strong>
                    <p className="m-0 text-[0.8rem] text-[rgba(244,246,251,0.58)] mt-0.5">
                      Striving for racing excellence and innovative storytelling.
                    </p>
                  </div>
                </div>
              </div>

              {/* Quote Author */}
              <div className="mt-2 text-right">
                <p className="m-0 text-[0.7rem] font-bold uppercase tracking-widest text-[rgba(255,255,255,0.4)]">
                  Orion Identity Vision
                </p>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
