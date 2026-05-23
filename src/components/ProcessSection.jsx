"use client";

export default function ProcessSection() {
  return (
    <section
      id="proceso"
      className="relative py-[clamp(72px,10vw,96px)]"
    >
      <div
        className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2"
        style={{
          width: "min(900px, 90vw)",
          height: 1,
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.14), transparent)",
        }}
      />
      <div className="mx-auto w-[min(1120px,calc(100%-clamp(32px,7vw,56px)))]">
        <div className="mb-10 max-w-[640px]">
          <p className="mb-3 font-sans text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[rgba(61,140,255,0.88)]">
            Methodology
          </p>
          <h2>How we work</h2>
          <p className="m-0 max-w-[42rem] text-[0.95rem] leading-[1.55] text-[rgba(244,246,251,0.58)]">
            A simple workflow so technical work and public communication move forward together.
          </p>
        </div>

        {/* Methodology Cards Grid (Unified for both Mobile & Desktop) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {/* Card 1 */}
          <div
            className="relative overflow-hidden rounded-[20px] border border-white/10 p-[clamp(22px,4vw,32px)] backdrop-blur-[20px] transition-all duration-300 hover:border-[#3d8cff]/35 hover:-translate-y-1.5"
            style={{
              background: "linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01)), rgba(6,10,16,0.5)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 12px 32px rgba(0,0,0,0.25)",
            }}
          >
            {/* Watermark Step Number */}
            <div className="absolute right-6 bottom-0 font-sans text-[6rem] font-black text-white/[0.02] select-none pointer-events-none leading-none">
              01
            </div>
            <div className="relative z-10 flex flex-col gap-2">
              <h3 className="m-0 mb-2 text-white text-md font-bold uppercase tracking-wider">
                Design and simulation
              </h3>
              <p className="m-0 text-[0.92rem] leading-[1.65] text-[rgba(244,246,251,0.68)]">
                Sketches, CAD, and testing: we define form and function before manufacturing.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div
            className="relative overflow-hidden rounded-[20px] border border-white/10 p-[clamp(22px,4vw,32px)] backdrop-blur-[20px] transition-all duration-300 hover:border-[#3d8cff]/35 hover:-translate-y-1.5"
            style={{
              background: "linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01)), rgba(6,10,16,0.5)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 12px 32px rgba(0,0,0,0.25)",
            }}
          >
            {/* Watermark Step Number */}
            <div className="absolute right-6 bottom-0 font-sans text-[6rem] font-black text-white/[0.02] select-none pointer-events-none leading-none">
              02
            </div>
            <div className="relative z-10 flex flex-col gap-2">
              <h3 className="m-0 mb-2 text-white text-md font-bold uppercase tracking-wider">
                Manufacturing and testing
              </h3>
              <p className="m-0 text-[0.92rem] leading-[1.65] text-[rgba(244,246,251,0.68)]">
                Workshop, iterations, and testing: we tune until the full package performs as expected.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div
            className="relative overflow-hidden rounded-[20px] border border-white/10 p-[clamp(22px,4vw,32px)] backdrop-blur-[20px] transition-all duration-300 hover:border-[#3d8cff]/35 hover:-translate-y-1.5"
            style={{
              background: "linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01)), rgba(6,10,16,0.5)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 12px 32px rgba(0,0,0,0.25)",
            }}
          >
            {/* Watermark Step Number */}
            <div className="absolute right-6 bottom-0 font-sans text-[6rem] font-black text-white/[0.02] select-none pointer-events-none leading-none">
              03
            </div>
            <div className="relative z-10 flex flex-col gap-2">
              <h3 className="m-0 mb-2 text-white text-md font-bold uppercase tracking-wider">
                Story and presentation
              </h3>
              <p className="m-0 text-[0.92rem] leading-[1.65] text-[rgba(244,246,251,0.68)]">
                We communicate the project: brand, social channels, and sponsor outreach with a consistent message.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
