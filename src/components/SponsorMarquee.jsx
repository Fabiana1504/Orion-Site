"use client";

const SPONSORS = [
  { name: "Monge", src: "/logos-marca/Monge.png" },
  { name: "La Guaca", src: "/logos-marca/Logo-La-Guaca.png" },
  { name: "La Manada", src: "/logos-marca/La Manada.webp" },
  { name: "Smart Rabbit", src: "/logos-marca/smart-rabbit.png" },
  { name: "Garaje", src: "/logos-marca/garaje.webp" },
  { name: "Guipi", src: "/logos-marca/guipi.png" },
  { name: "Kadec", src: "/logos-marca/kadec.png" },
  { name: "Karima", src: "/logos-marca/karima.jpeg" },
  { name: "Repuestos", src: "/logos-marca/respuestos.png" },
  { name: "Hair Studio", src: "/logos-marca/hair.jpg" },
];

export default function SponsorMarquee() {
  return (
    <section className="relative w-full mt-[clamp(40px,7vw,80px)] py-16 overflow-hidden border-t border-white/5 bg-white/[0.005]">
      {/* Self-contained CSS injection to guarantee instant, cache-proof scrolling animation */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes marquee-scroll {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .animate-marquee-custom {
              display: flex;
              width: max-content;
              animation: marquee-scroll 35s linear infinite !important;
            }
            .animate-marquee-custom:hover {
              animation-play-state: paused !important;
            }
          `,
        }}
      />

      {/* Subtle Background Glow behind the marquee */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[150px] bg-blue-500/[0.015] rounded-full blur-[100px] pointer-events-none z-0" />

      <div className="relative z-10 mx-auto w-[min(1120px,calc(100%-clamp(32px,7vw,56px)))] flex flex-col items-center mb-6">
        <p className="font-sans text-[0.62rem] font-black uppercase tracking-[0.3em] text-white/25 m-0">
          Supported by our partners
        </p>
      </div>

      {/* Marquee scrolling container with transparent fade edges using CSS mask */}
      <div
        className="relative w-full overflow-hidden py-4 z-10"
        style={{
          maskImage: "linear-gradient(to right, transparent, rgba(0,0,0,1) 15%, rgba(0,0,0,1) 85%, transparent)",
          WebkitMaskImage: "linear-gradient(to right, transparent, rgba(0,0,0,1) 15%, rgba(0,0,0,1) 85%, transparent)",
        }}
      >
        <div className="animate-marquee-custom flex gap-2 md:gap-4 items-center">
          {/* First set of logos in borderless cells with very tight padding and width */}
          {SPONSORS.map((sponsor, idx) => (
            <div
              key={`s1-${idx}`}
              className="shrink-0 flex items-center justify-center w-28 md:w-36 h-24 md:h-32 px-1 py-4 select-none cursor-pointer group"
            >
              <img
                src={sponsor.src}
                alt={`${sponsor.name} Logo`}
                className="max-h-full max-w-full object-contain brightness-[0.75] contrast-[1.25] grayscale opacity-45 transition-all duration-300 group-hover:brightness-100 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105"
                loading="lazy"
              />
            </div>
          ))}

          {/* Second identical set of logos for infinite loop */}
          {SPONSORS.map((sponsor, idx) => (
            <div
              key={`s2-${idx}`}
              className="shrink-0 flex items-center justify-center w-28 md:w-36 h-24 md:h-32 px-1 py-4 select-none cursor-pointer group"
            >
              <img
                src={sponsor.src}
                alt={`${sponsor.name} Logo`}
                className="max-h-full max-w-full object-contain brightness-[0.75] contrast-[1.25] grayscale opacity-45 transition-all duration-300 group-hover:brightness-100 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
