/**
 * Cinemática simple para correlacionar tiempo de pista, longitud y aceleración.
 * v_med = distancia / tiempo_total ; a ≈ v_final / t si arranca desde reposo.
 */

export function resolveTotalTimeSec(manualTrackSec, lapTimesSec) {
  const m = manualTrackSec != null && Number.isFinite(Number(manualTrackSec)) ? Number(manualTrackSec) : null;
  if (m != null && m > 0) return m;
  const laps = (lapTimesSec || []).map(Number).filter((n) => Number.isFinite(n) && n > 0);
  if (!laps.length) return null;
  return laps.reduce((a, b) => a + b, 0) / laps.length;
}

export function velocityFromDistanceAndTime(distanceM, timeSec) {
  const d = Number(distanceM);
  const t = Number(timeSec);
  if (!Number.isFinite(d) || !Number.isFinite(t) || d <= 0 || t <= 0) return null;
  return d / t;
}

/** Desde reposo: a = v / t */
export function accelerationFromRestToSpeed(finalVelocityMs, timeSec) {
  const v = Number(finalVelocityMs);
  const t = Number(timeSec);
  if (!Number.isFinite(v) || !Number.isFinite(t) || t <= 0 || v < 0) return null;
  return v / t;
}

export function kmhFromMs(vMs) {
  if (vMs == null || !Number.isFinite(vMs)) return null;
  return vMs * 3.6;
}

/**
 * @param {{
 *   trackLengthM?: number | null,
 *   manualTrackSec?: number | null,
 *   lapTimesSec?: number[],
 *   finalSpeedKmh?: number | null,
 *   reachSpeedTimeSec?: number | null,
 * }} p
 */
export function computeKinematicsSummary(p) {
  const totalTimeSec = resolveTotalTimeSec(p.manualTrackSec ?? null, p.lapTimesSec ?? []);
  const trackLengthM =
    p.trackLengthM != null && Number.isFinite(Number(p.trackLengthM)) && Number(p.trackLengthM) > 0
      ? Number(p.trackLengthM)
      : null;

  const velocityMs =
    trackLengthM != null && totalTimeSec != null ? velocityFromDistanceAndTime(trackLengthM, totalTimeSec) : null;

  let accelerationMs2 = null;
  const vKmh =
    p.finalSpeedKmh != null && Number.isFinite(Number(p.finalSpeedKmh)) ? Number(p.finalSpeedKmh) : null;
  const tReach =
    p.reachSpeedTimeSec != null && Number.isFinite(Number(p.reachSpeedTimeSec))
      ? Number(p.reachSpeedTimeSec)
      : null;
  if (vKmh != null && vKmh >= 0 && tReach != null && tReach > 0) {
    const vMs = vKmh / 3.6;
    accelerationMs2 = accelerationFromRestToSpeed(vMs, tReach);
  }

  return {
    totalTimeSec,
    velocityMs,
    velocityKmh: velocityMs != null ? kmhFromMs(velocityMs) : null,
    accelerationMs2,
  };
}
