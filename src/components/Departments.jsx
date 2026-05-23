"use client";

import Image from "next/image";

export default function Departments() {
  return (
    <section id="departments" className="relative py-[clamp(72px,10vw,96px)]">
      <div
        className="pointer-events-none absolute left-1/2 top-0 z-[1] -translate-x-1/2"
        style={{
          width: "min(900px, 90vw)",
          height: 1,
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.14), transparent)",
        }}
      />
      <div className="mx-auto w-[min(1120px,calc(100%-clamp(32px,7vw,56px)))]">
        <div className="mb-7 max-w-[640px]">
          <p className="mb-3 font-sans text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[rgba(61,140,255,0.88)]">
            Departments
          </p>
          <h2>Every area pushes Orion forward.</h2>
          <p className="m-0 max-w-[42rem] text-[0.95rem] leading-[1.55] text-[rgba(244,246,251,0.58)]">
            Two pillars: engineering and communication. Images are carefully
            framed to keep proper proportions on any screen.
          </p>
        </div>

        <div className="department-list clean-list">
          {/* Engineering Department */}
          <article className="department-card clean">
            <div className="department-copy">
              <h3 className="mb-[10px] text-balance">Engineering</h3>
              <p className="m-0 max-w-[36rem] text-[0.93rem] leading-[1.65] text-[rgba(244,246,251,0.8)]">
                Research, testing, technical development, and design decisions
                focused on performance and precision.
              </p>
              {/* Long Arrow pointing to image (Right) */}
              <div className="mt-6 flex items-center text-[#3d8cff] opacity-85 max-[980px]:hidden">
                <svg className="h-6 w-40" fill="none" viewBox="0 0 160 24">
                  {/* The main wavy line of the arrow shaft */}
                  <path
                    d="M 4,13 C 50,8 100,17 154,11"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* The arrow head, slightly organic/loose barbs */}
                  <path
                    d="M 141,4 C 145,6 151,8 154,11 C 150,13 145,17 141,20"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            <figure className="m-0 overflow-hidden rounded-[18px] border border-white/12 bg-[#050508] shadow-[0_24px_48px_rgba(0,0,0,0.45)] aspect-[3/4] min-h-0 relative">
              <div className="relative size-full">
                <Image
                  src="/departments/engineering-1.jpg"
                  alt="Engineering"
                  fill
                  className="object-cover object-center"
                  loading="lazy"
                  sizes="(max-width: 980px) 100vw, 50vw"
                />
              </div>
            </figure>
          </article>

          {/* Social Media Department */}
          <article className="department-card clean">
            <div className="department-copy">
              <h3 className="mb-[10px] text-balance">Social Media</h3>
              <p className="m-0 max-w-[36rem] text-[0.93rem] leading-[1.65] text-[rgba(244,246,251,0.8)]">
                Brand identity, digital storytelling, visual communication, and
                audience presence for Orion.
              </p>
              {/* Long Arrow pointing to image (Left) */}
              <div className="mt-6 flex items-center text-[#3d8cff] opacity-85 max-[980px]:hidden">
                <svg className="h-6 w-40" fill="none" viewBox="0 0 160 24">
                  {/* The main wavy line of the arrow shaft */}
                  <path
                    d="M 154,13 C 108,8 58,17 4,11"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* The arrow head, slightly organic/loose barbs */}
                  <path
                    d="M 17,4 C 13,6 7,8 4,11 C 8,13 13,17 17,20"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            <figure className="m-0 overflow-hidden rounded-[18px] border border-white/12 bg-[#050508] shadow-[0_24px_48px_rgba(0,0,0,0.45)] aspect-[3/4] min-h-0 relative">
              <div className="relative size-full">
                <Image
                  src="/departments/social-1.jpg"
                  alt="Social Media"
                  fill
                  className="object-cover object-center"
                  loading="lazy"
                  sizes="(max-width: 980px) 100vw, 50vw"
                />
              </div>
            </figure>
          </article>
        </div>
      </div>
    </section>
  );
}
