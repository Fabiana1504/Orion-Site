"use client";

export default function CarShowcaseSkeleton({ busy = false }) {
  return (
    <>
      <div className="mb-7 max-w-[36rem]">
        <p className="mb-3 font-sans text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[rgba(61,140,255,0.88)]">
          Vehicle
        </p>
        <h2>The car in 360°.</h2>
      </div>

      <div
        className="relative flex h-[clamp(420px,68svh,760px)] flex-col items-center justify-center gap-4 overflow-hidden rounded-[24px] border border-white/10 backdrop-blur-[20px] shadow-[0_12px_32px_rgba(0,0,0,0.25)]"
        aria-busy={busy ? "true" : undefined}
        aria-label={busy ? "Loading car viewer" : undefined}
        style={{
          background: "linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01)), rgba(6,10,16,0.5)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 12px 32px rgba(0,0,0,0.25)",
        }}
      >
        {busy && (
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden
            style={{
              background:
                "linear-gradient(105deg, transparent 0%, rgba(255,255,255,0.04) 45%, rgba(61,140,255,0.06) 50%, rgba(255,255,255,0.04) 55%, transparent 100%)",
              backgroundSize: "200% 100%",
              animation: "car-skeleton-sweep 2.2s ease-in-out infinite",
            }}
          />
        )}
        <p className="relative z-[2] m-0 text-[0.9rem] tracking-[0.02em] text-[rgba(255,255,255,0.45)]">
          {busy
            ? "Loading car viewer..."
            : "The viewer will load as you approach"}
        </p>
      </div>

      <div className="mt-[22px] flex max-w-[36rem] flex-col gap-[6px] text-[0.88rem] leading-[1.5] text-[rgba(244,246,251,0.58)]">
        <span className="font-sans text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-white/55">
          Drag to rotate · wheel or pinch to zoom
        </span>
      </div>
    </>
  );
}
