"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";

const STARS = [
  { id: "betelgeuse", astro: "Betelgeuse", x: 22, y: 18, label: "Innovation", hint: "Test, fail, and come back with a better idea.", popAnchor: "start" },
  { id: "bellatrix", astro: "Bellatrix", x: 62, y: 24, label: "Speed", hint: "Less wasted time, clearer decisions.", popAnchor: "end" },
  { id: "mintaka", astro: "Mintaka", x: 39, y: 46, label: "Precision", hint: "Measure twice, race once.", popAnchor: "start" },
  { id: "alnilam", astro: "Alnilam", x: 50, y: 50, label: "Communication", hint: "Make our work understandable to others.", popAnchor: "start" },
  { id: "alnitak", astro: "Alnitak", x: 61, y: 54, label: "Team", hint: "Same direction, different roles.", popAnchor: "end" },
  { id: "saiph", astro: "Saiph", x: 36, y: 78, label: "Responsibility", hint: "Deadlines, rules, and team commitment.", popAnchor: "start" },
  { id: "rigel", astro: "Rigel", x: 68, y: 72, label: "Identidad", hint: "Orion is visible in every detail.", popAnchor: "end" },
];

const LINES = [[0, 2], [1, 4], [2, 3], [3, 4], [3, 5], [3, 6]];

function starPointToStagePx(svg, stage, x, y) {
  const pt = svg.createSVGPoint();
  pt.x = x;
  pt.y = y;
  const ctm = svg.getScreenCTM();
  if (!ctm) return null;
  const screen = pt.matrixTransform(ctm);
  const r = stage.getBoundingClientRect();
  return {
    left: screen.x - r.left + stage.scrollLeft,
    top: screen.y - r.top + stage.scrollTop,
  };
}

const HOVER_LEAVE_MS = 160;

function isCoarseOrNoHover() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(hover: none)").matches;
}

export default function OrionConstellation() {
  const uid = useId();
  const gradId = `orionStarGlow-${uid}`;
  const filterId = `orionSoftGlow-${uid}`;
  const [selectedId, setSelectedId] = useState(null);
  const stageRef = useRef(null);
  const svgRef = useRef(null);
  const leaveTimerRef = useRef(null);
  const [popPos, setPopPos] = useState(null);

  const cancelScheduledHide = useCallback(() => {
    if (leaveTimerRef.current != null) {
      window.clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
  }, []);

  const scheduleHide = useCallback(() => {
    cancelScheduledHide();
    leaveTimerRef.current = window.setTimeout(() => {
      leaveTimerRef.current = null;
      setSelectedId(null);
    }, HOVER_LEAVE_MS);
  }, [cancelScheduledHide]);

  const selected = useMemo(
    () => (selectedId ? STARS.find((x) => x.id === selectedId) : null),
    [selectedId],
  );

  const updatePopoverPosition = useCallback(() => {
    const svg = svgRef.current;
    const stage = stageRef.current;
    if (!svg || !stage || !selected) {
      setPopPos(null);
      return;
    }
    const p = starPointToStagePx(svg, stage, selected.x, selected.y);
    setPopPos(p);
  }, [selected]);

  useLayoutEffect(() => {
    updatePopoverPosition();
  }, [updatePopoverPosition, selectedId]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;
    const ro = new ResizeObserver(() => updatePopoverPosition());
    ro.observe(stage);
    window.addEventListener("resize", updatePopoverPosition);
    window.addEventListener("scroll", updatePopoverPosition, true);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", updatePopoverPosition);
      window.removeEventListener("scroll", updatePopoverPosition, true);
    };
  }, [updatePopoverPosition]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        cancelScheduledHide();
        setSelectedId(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cancelScheduledHide]);

  useEffect(
    () => () => { cancelScheduledHide(); },
    [cancelScheduledHide],
  );

  return (
    <div
      className="rounded-[22px] border border-white/10 p-[clamp(18px,3vw,26px)] backdrop-blur-[20px] shadow-[0_12px_32px_rgba(0,0,0,0.25)] max-[640px]:rounded-[16px] max-[640px]:p-[14px]"
      style={{
        background: "linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01)), rgba(6,10,16,0.5)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 12px 32px rgba(0,0,0,0.25)",
      }}
    >
      <h3 className="m-0 mb-2 text-[1.05rem] font-semibold text-[rgba(255,255,255,0.95)]">
        Orion in the team sky
      </h3>
      <p className="m-0 mb-[14px] text-[0.82rem] leading-[1.45] text-[rgba(244,246,251,0.58)]">
        Hover a star to see its card. On touch screens, tap the star to open or close it.{" "}
        <span className="inline-block rounded-md bg-white/[0.08] px-[0.45em] py-[0.1em] font-mono text-[0.78em] text-[rgba(244,246,251,0.85)]">
          Esc
        </span>{" "}
        closes focus.
      </p>
      <div className="grid w-full grid-cols-1 items-start gap-4">
        <div className="relative w-full leading-none" ref={stageRef}>
          <svg
            ref={svgRef}
            className="block size-full max-h-[min(620px,72svh)]"
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-labelledby={`${uid}-title`}
          >
            <title id={`${uid}-title`}>
              Orion constellation: seven stars. Choose one to see its name and meaning.
            </title>
            <defs>
              <radialGradient id={gradId} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(255, 255, 255, 0.95)" />
                <stop offset="45%" stopColor="rgba(61, 140, 255, 0.55)" />
                <stop offset="100%" stopColor="rgba(61, 140, 255, 0)" />
              </radialGradient>
              <filter id={filterId} x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="0.5" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <rect
              width="100"
              height="100"
              fill="transparent"
              className="cursor-default"
              onClick={() => {
                cancelScheduledHide();
                setSelectedId(null);
              }}
            />

            {LINES.map(([a, b], i) => {
              const p1 = STARS[a];
              const p2 = STARS[b];
              return (
                <line
                  key={`ln-${i}`}
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke="rgba(61, 140, 255, 0.38)"
                  strokeWidth={0.55}
                  strokeLinecap="round"
                />
              );
            })}

            {STARS.map((s, i) => {
              const isSel = selectedId === s.id;
              return (
                <g key={s.id} className="cursor-default">
                  <circle
                    cx={s.x}
                    cy={s.y}
                    r={isSel ? 3.4 : 2.6}
                    fill={`url(#${gradId})`}
                    className="pointer-events-none"
                    style={{ opacity: isSel ? 1 : 0.85 }}
                  />
                  <circle
                    cx={s.x}
                    cy={s.y}
                    r="0.95"
                    fill="#f4f6fb"
                    filter={`url(#${filterId})`}
                    className="pointer-events-none"
                    style={{
                      animation: "orion-twinkle 4.5s ease-in-out infinite",
                      animationDelay: `${i * 0.22}s`,
                    }}
                  />
                  <circle
                    cx={s.x}
                    cy={s.y}
                    r="9.5"
                    fill="transparent"
                    className="pointer-events-auto cursor-pointer outline-none"
                    style={{ outline: "none" }}
                    role="button"
                    tabIndex={0}
                    aria-pressed={isSel}
                    aria-expanded={isSel}
                    aria-label={`${s.astro}: ${s.label}. Hover or focus to view the card.`}
                    onMouseEnter={() => {
                      cancelScheduledHide();
                      setSelectedId(s.id);
                    }}
                    onMouseLeave={scheduleHide}
                    onFocus={() => {
                      cancelScheduledHide();
                      setSelectedId(s.id);
                    }}
                    onBlur={scheduleHide}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isCoarseOrNoHover()) return;
                      cancelScheduledHide();
                      setSelectedId((prev) => (prev === s.id ? null : s.id));
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        cancelScheduledHide();
                        setSelectedId((prev) => (prev === s.id ? null : s.id));
                      }
                    }}
                    onBlur={(e) => {
                      scheduleHide(e);
                    }}
                  />
                </g>
              );
            })}
          </svg>

          {selected && popPos ? (
            <div
              className="absolute z-[2] max-w-[min(8.75rem,42vw)]"
              style={{
                left: popPos.left,
                top: popPos.top,
                transform: selected.popAnchor === "start"
                  ? "translate(0.35rem, -50%)"
                  : "translate(calc(-100% - 0.35rem), -50%)",
              }}
              role="tooltip"
              aria-label={`${selected.astro}: ${selected.label}`}
              onMouseEnter={cancelScheduledHide}
              onMouseLeave={() => {
                cancelScheduledHide();
                setSelectedId(null);
              }}
            >
              <div
                className="m-0 flex flex-col gap-0 rounded-md border border-white/11 p-[0.3rem_0.45rem_0.35rem] shadow-[0_0_0_1px_rgba(0,0,0,0.35),0_6px_18px_rgba(0,0,0,0.42),0_0_14px_rgba(61,140,255,0.1)]"
                style={{
                  background: "linear-gradient(155deg, rgba(22,28,40,0.98), rgba(14,18,28,0.97))",
                  backdropFilter: "blur(10px)",
                  animation: "orion-pop-fade 0.2s ease-out",
                }}
              >
                <p className="m-0 mb-[0.12rem] truncate font-sans text-[0.62rem] font-semibold uppercase leading-[1.15] tracking-[0.08em] text-[rgba(61,140,255,0.92)]">
                  {selected.astro}
                </p>
                <p className="m-0 mb-[0.2rem] break-words font-heading text-[0.78rem] font-semibold leading-[1.2] text-[rgba(255,255,255,0.96)]">
                  {selected.label}
                </p>
                <p className="m-0 overflow-wrap-anywhere hyphens-auto font-sans text-[0.68rem] font-normal leading-[1.35] text-[rgba(198,208,226,0.92)]">
                  {selected.hint}
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
