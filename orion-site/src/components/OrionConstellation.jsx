import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";

/**
 * Archivo: OrionConstellation.jsx
 * Responsabilidad: visual interactivo de la constelación de Orión con tarjetas
 * contextuales por estrella (hover/focus/touch, accesible por teclado).
 *
 * Coordenadas del asterismo (espacio 0–100).
 * popAnchor: tarjeta HTML a la derecha (start) o izquierda (end) de la estrella.
 */
const STARS = [
  {
    id: "betelgeuse",
    astro: "Betelgeuse",
    x: 22,
    y: 18,
    label: "Innovation",
    hint: "Test, fail, and come back with a better idea.",
    popAnchor: "start",
  },
  {
    id: "bellatrix",
    astro: "Bellatrix",
    x: 62,
    y: 24,
    label: "Speed",
    hint: "Less wasted time, clearer decisions.",
    popAnchor: "end",
  },
  {
    id: "mintaka",
    astro: "Mintaka",
    x: 39,
    y: 46,
    label: "Precision",
    hint: "Measure twice, race once.",
    popAnchor: "start",
  },
  {
    id: "alnilam",
    astro: "Alnilam",
    x: 50,
    y: 50,
    label: "Communication",
    hint: "Make our work understandable to others.",
    popAnchor: "start",
  },
  {
    id: "alnitak",
    astro: "Alnitak",
    x: 61,
    y: 54,
    label: "Team",
    hint: "Same direction, different roles.",
    popAnchor: "end",
  },
  {
    id: "saiph",
    astro: "Saiph",
    x: 36,
    y: 78,
    label: "Responsibility",
    hint: "Deadlines, rules, and team commitment.",
    popAnchor: "start",
  },
  {
    id: "rigel",
    astro: "Rigel",
    x: 68,
    y: 72,
    label: "Identidad",
    hint: "Orion is visible in every detail.",
    popAnchor: "end",
  },
];

const LINES = [
  [0, 2],
  [1, 4],
  [2, 3],
  [3, 4],
  [3, 5],
  [3, 6],
];

function starPointToStagePx(svg, stage, x, y) {
  // Convierte coordenadas del SVG (viewBox) a píxeles del contenedor para posicionar el popover.
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
    // Delay corto para evitar que el tooltip "parpadee" al mover el mouse entre estrella y tarjeta.
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
    // Recalcula posición cuando cambia layout (resize/scroll) para mantener tooltip pegado a estrella.
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
    () => () => {
      cancelScheduledHide();
    },
    [cancelScheduledHide],
  );

  return (
    <div className="orion-constellation clean-panel">
      <h3 className="mission-chart-title">Orion in the team sky</h3>
      <p className="mission-chart-caption">
        Hover a star to see its card. On touch screens, tap the star to open or close it.{" "}
        <span className="orion-caption-key">Esc</span> closes focus.
      </p>
      <div className="orion-svg-wrap orion-svg-wrap--map-only">
        <div className="orion-chart-stage" ref={stageRef}>
          <svg
            ref={svgRef}
            className="orion-svg"
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
              className="orion-sky-hit"
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
                  className="orion-line"
                />
              );
            })}

            {STARS.map((s, i) => {
              const isSel = selectedId === s.id;
              return (
                <g key={s.id} className={`orion-star-group ${isSel ? "is-selected" : ""}`}>
                  <circle
                    cx={s.x}
                    cy={s.y}
                    r={isSel ? 3.4 : 2.6}
                    fill={`url(#${gradId})`}
                    className="orion-star-halo"
                  />
                  <circle
                    cx={s.x}
                    cy={s.y}
                    r="0.95"
                    fill="#f4f6fb"
                    filter={`url(#${filterId})`}
                    className="orion-star-core"
                    style={{ animationDelay: `${i * 0.22}s` }}
                  />
                  <circle
                    cx={s.x}
                    cy={s.y}
                    r="9.5"
                    fill="transparent"
                    className="orion-star-hit"
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
                      // En touch/coarse pointer funciona como toggle (abrir/cerrar) por toque.
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
                  />
                </g>
              );
            })}
          </svg>

          {selected && popPos ? (
            <div
              className={`orion-pop-floating orion-pop-floating--${selected.popAnchor}`}
              style={{ left: popPos.left, top: popPos.top }}
              role="tooltip"
              aria-label={`${selected.astro}: ${selected.label}`}
              onMouseEnter={cancelScheduledHide}
              onMouseLeave={() => {
                cancelScheduledHide();
                setSelectedId(null);
              }}
            >
              <div className="orion-pop-card">
                <p className="orion-pop-astro">{selected.astro}</p>
                <p className="orion-pop-label">{selected.label}</p>
                <p className="orion-pop-hint">{selected.hint}</p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
