import { useCallback, useEffect, useRef, useState } from "react";

const BULBS = 5;
/** Tiempo entre que se enciende una luz y la siguiente (más lento = más fácil de seguir). */
const STEP_MS = 700;
const PREP_MIN_MS = 450;
const PREP_EXTRA_MS = 900;
/** Espera con las 5 luces encendidas: entre 2 y 10 s (inclusive aprox.). */
function randomArmedWaitMs() {
  return (2 + Math.random() * 8) * 1000;
}

function bulbsAllOn() {
  return Array.from({ length: BULBS }, () => true);
}

function bulbsOff() {
  return Array.from({ length: BULBS }, () => false);
}

/**
 * 5 luces rojas en fila: se encienden en orden; tras 2–10 s aleatorios se apagan todas a la vez → medir reacción (Espacio / botón).
 * @param {{
 *   onSave: (payload: { inputJson: Record<string, unknown>, resultJson: Record<string, unknown> }) => void,
 *   saveBusy: boolean,
 * }} props
 */
export default function ReactionSemaforo({ onSave, saveBusy }) {
  /** idle | prep | arming | armed | stimulus | done | false_start */
  const [runState, setRunState] = useState("idle");
  const [bulbs, setBulbs] = useState(bulbsOff);
  const [lastMs, setLastMs] = useState(null);
  const [hint, setHint] = useState(null);

  const goTimeRef = useRef(0);
  const timersRef = useRef([]);

  const clearTimers = useCallback(() => {
    for (const id of timersRef.current) {
      clearTimeout(id);
    }
    timersRef.current = [];
  }, []);

  const resetIdle = useCallback(() => {
    clearTimers();
    setRunState("idle");
    setBulbs(bulbsOff());
    setLastMs(null);
  }, [clearTimers]);

  const schedule = useCallback((fn, ms) => {
    const id = setTimeout(fn, ms);
    timersRef.current.push(id);
    return id;
  }, []);

  const startRun = useCallback(() => {
    setHint(null);
    setLastMs(null);
    clearTimers();
    setBulbs(bulbsOff());
    setRunState("prep");

    const prepMs = PREP_MIN_MS + Math.random() * PREP_EXTRA_MS;
    let t = prepMs;

    schedule(() => {
      setRunState("arming");
      setBulbs([true, false, false, false, false]);
    }, t);
    t += STEP_MS;

    for (let i = 1; i < BULBS; i += 1) {
      const k = i;
      schedule(() => {
        setBulbs((prev) => {
          const next = [...prev];
          next[k] = true;
          return next;
        });
      }, t);
      t += STEP_MS;
    }

    schedule(() => {
      setBulbs(bulbsAllOn());
      setRunState("armed");
    }, t);

    const armedWait = randomArmedWaitMs();
    t += armedWait;

    schedule(() => {
      setBulbs(bulbsOff());
      goTimeRef.current = performance.now();
      setRunState("stimulus");
    }, t);
  }, [clearTimers, schedule]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const onEarlyOrHit = useCallback(
    (e) => {
      if (e.type === "keydown") {
        if (e.code !== "Space" && e.key !== " ") return;
        const el = e.target;
        if (
          el instanceof HTMLElement &&
          (el.tagName === "TEXTAREA" ||
            (el.tagName === "INPUT" &&
              el.type !== "button" &&
              el.type !== "submit" &&
              el.type !== "checkbox"))
        ) {
          return;
        }
        e.preventDefault();
      }

      if (runState === "prep" || runState === "arming" || runState === "armed") {
        clearTimers();
        setRunState("false_start");
        setBulbs(bulbsOff());
        setHint("Too soon: wait until all lights turn off at once, then press Space or the button.");
        schedule(() => {
          setHint(null);
          resetIdle();
        }, 3400);
        return;
      }

      if (runState === "stimulus") {
        const ms = performance.now() - goTimeRef.current;
        const rounded = Math.max(0, Math.round(ms));
        setLastMs(rounded);
        setRunState("done");
        setBulbs(bulbsOff());
        clearTimers();
      }
    },
    [runState, clearTimers, resetIdle, schedule],
  );

  useEffect(() => {
    if (runState !== "prep" && runState !== "arming" && runState !== "armed" && runState !== "stimulus") {
      return undefined;
    }
    const fn = (e) => onEarlyOrHit(e);
    window.addEventListener("keydown", fn, true);
    return () => window.removeEventListener("keydown", fn, true);
  }, [runState, onEarlyOrHit]);

  return (
    <section className="team-lab-card clean-panel public-tools-card traffic-semaforo-card">
      <div className="team-lab-card-head">
        <h2>Traffic light — reaction time</h2>
        <p className="team-lab-card-desc">
          Five <strong>red lights in a row</strong>. They turn on from left to right with a visible pause
          between each one; once all five are on, after a random <strong>2 to 10 seconds</strong> they{" "}
          <strong>all turn off at once</strong>. At that moment, press{" "}
          <kbd className="inline-code">Space</kbd> or the button as fast as possible.
        </p>
      </div>

      <div className="traffic-light-row" aria-live="polite">
        {bulbs.map((on, i) => (
          <div
            key={i}
            className={`traffic-bulb traffic-bulb--red${on ? " is-on" : ""}`}
            aria-label={`Light ${i + 1} of ${BULBS}${on ? ", on" : ", off"}`}
          />
        ))}
      </div>

      <p className="traffic-semaforo-status team-lab-hint">
        {runState === "idle" && "Ready for a new run."}
        {runState === "prep" && "Get ready..."}
        {runState === "arming" && "Lights are turning on — do not press yet."}
        {runState === "armed" && "All five are on — wait until they all turn off together."}
        {runState === "stimulus" && "All lights off! — Space or button now."}
        {runState === "false_start" && (hint ?? "False start.")}
        {runState === "done" && lastMs != null && `Your time: ${lastMs} ms`}
      </p>

      <div className="traffic-semaforo-actions">
        {runState === "idle" || runState === "done" ? (
          <button type="button" className="btn btn-primary" onClick={startRun} disabled={saveBusy}>
            {runState === "done" ? "Run again" : "Start"}
          </button>
        ) : null}
        {runState === "stimulus" ? (
          <button type="button" className="btn btn-primary traffic-hit-btn" onClick={onEarlyOrHit}>
            React now! (same as Space)
          </button>
        ) : null}
      </div>

      {runState === "done" && lastMs != null ? (
        <button
          type="button"
          className="btn btn-ghost team-lab-btn-block"
          style={{ marginTop: 12 }}
          disabled={saveBusy}
          onClick={() =>
            onSave({
              inputJson: { stimulus: "five_red_all_off", layout: "horizontal_5" },
              resultJson: { reactionMs: lastMs },
            })
          }
        >
          {saveBusy ? "Saving..." : "Save this time"}
        </button>
      ) : null}
    </section>
  );
}
