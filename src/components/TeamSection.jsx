"use client";

import { useState } from "react";
import SafeImage from "./SafeImage";
import { teamMembers } from "../data/team";

const defaultPhoto = {
  rotateDeg: 0,
  objectPosition: "50% 28%",
  thumbPosition: "50% 30%",
  scale: 1.18,
};

function needsPhotoTransform(p) {
  return (p.rotateDeg ?? 0) !== 0 || Boolean(p.flipX);
}

function photoTransform(p, scaleOverride) {
  const rot = p.rotateDeg ?? 0;
  const sc = scaleOverride ?? p.scale ?? 1;
  const parts = [`rotate(${rot}deg)`, `scale(${sc})`];
  if (p.flipX) parts.push("scaleX(-1)");
  return parts.join(" ");
}

export default function TeamSection() {
  const [selected, setSelected] = useState(teamMembers[0]);

  const ph = { ...defaultPhoto, ...selected.photo };

  return (
    <section id="team" className="relative py-[clamp(72px,10vw,96px)]">
      <div className="mx-auto w-[min(1120px,calc(100%-clamp(32px,7vw,56px)))]">
        <div className="mb-7 max-w-[640px]">
          <p className="mb-3 font-sans text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[rgba(61,140,255,0.88)]">
            Team
          </p>
          <h2>Orion Team</h2>
          <p className="m-0 max-w-[42rem] text-[0.95rem] leading-[1.55] text-[rgba(244,246,251,0.58)]">
            Face, role, and context in one view. Select someone from the list.
          </p>
        </div>

        <div className="grid grid-cols-[minmax(220px,0.82fr)_minmax(0,1.18fr)] items-stretch gap-7 max-[980px]:grid-cols-1">
          <div
            className="grid content-start gap-2 rounded-[20px] border border-white/10 p-3 backdrop-blur-[20px] shadow-[0_12px_32px_rgba(0,0,0,0.25)] max-[760px]:grid-cols-2 max-[640px]:grid-cols-1"
            style={{
              background: "linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01)), rgba(6,10,16,0.5)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 12px 32px rgba(0,0,0,0.25)",
            }}
          >
            {teamMembers.map((member) => {
              const p = { ...defaultPhoto, ...member.photo };
              const tScale =
                p.thumbScale ?? Math.min(typeof p.scale === "number" ? p.scale : 1.18, 1.42);
              const thumbNeeds = needsPhotoTransform(p);
              return (
                <button
                  key={member.name}
                  type="button"
                  className={`flex w-full cursor-pointer items-center gap-3 rounded-[14px] border border-transparent bg-transparent px-3 py-[10px] text-left text-white transition-colors duration-200 hover:bg-white/[0.03] hover:border-white/[0.06] max-[760px]:items-start ${selected.name === member.name ? "!border-[rgba(61,140,255,0.35)] !bg-[rgba(61,140,255,0.08)]" : ""}`}
                  onClick={() => setSelected(member)}
                >
                  <span
                    className={`shrink-0 overflow-hidden rounded-[14px] border border-white/45 max-[640px]:size-[52px]`}
                    style={{
                      width: 56,
                      height: 56,
                      background: "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
                    }}
                  >
                    {thumbNeeds ? (
                      <div
                        className="flex size-full items-center justify-center"
                        style={{
                          transform: photoTransform(p, tScale),
                        }}
                      >
                        <SafeImage
                          src={member.image}
                          alt={member.name}
                          className="size-full object-cover"
                          loading="lazy"
                          style={{ objectPosition: p.thumbPosition }}
                        />
                      </div>
                    ) : (
                      <SafeImage
                        src={member.image}
                        alt={member.name}
                        className="size-full object-cover"
                        loading="lazy"
                        style={{ objectPosition: p.thumbPosition }}
                      />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <strong className="block overflow-hidden text-ellipsis whitespace-nowrap text-[0.9rem] font-semibold">
                      {member.name}
                    </strong>
                    <span
                      className="mt-[2px] overflow-hidden text-[0.8rem] leading-[1.35] text-[rgba(244,246,251,0.58)]"
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {member.role}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] items-center gap-6 rounded-[20px] border border-white/10 p-5 backdrop-blur-[20px] shadow-[0_12px_32px_rgba(0,0,0,0.25)] max-[980px]:grid-cols-1 max-[760px]:gap-[18px]"
            style={{
              background: "linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01)), rgba(6,10,16,0.5)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 12px 32px rgba(0,0,0,0.25)",
            }}
          >
            <figure
              className={`m-0 overflow-hidden rounded-[18px] max-h-[min(480px,58svh)] max-[640px]:max-h-[360px]`}
              style={{
                aspectRatio: 3 / 4,
                background: "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
                border: "1px solid var(--line)",
                boxShadow: "0 24px 56px rgba(0,0,0,0.5)",
                maxHeight: "min(480px, 58svh)",
              }}
            >
              {needsPhotoTransform(ph) ? (
                <div
                  className="flex size-full items-center justify-center overflow-hidden"
                  style={{
                    transform: photoTransform(ph, ph.scale),
                  }}
                >
                  <SafeImage
                    src={selected.image}
                    alt={selected.name}
                    className="size-full object-cover"
                    loading="eager"
                    style={{ objectPosition: ph.objectPosition }}
                  />
                </div>
              ) : (
                <SafeImage
                  src={selected.image}
                  alt={selected.name}
                  className="size-full object-cover"
                  loading="eager"
                  style={{ objectPosition: ph.objectPosition }}
                />
              )}
            </figure>
            <div className="min-w-0 flex flex-col gap-1">
              <p className="mb-3 font-sans text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[rgba(61,140,255,0.88)]">
                {selected.area}
              </p>
              <h3 className="m-0 mb-1 text-balance">{selected.name}</h3>
              <p className="m-0 mb-3 text-[0.88rem] text-[rgba(244,246,251,0.58)]">
                {selected.role}
              </p>
              <p className="m-0 max-w-[36rem] text-[0.92rem] leading-[1.65] text-[rgba(244,246,251,0.8)]">
                {selected.bio}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
