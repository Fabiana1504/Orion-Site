/** Telemetría publicada en la home (JSON en localStorage). */
export const PUBLISH_KEY = "orion-telemetry-published";

/** Borrador en el laboratorio (opcional). */
export const DRAFT_KEY = "orion-telemetry-draft";

export function loadPublished() {
  try {
    const raw = localStorage.getItem(PUBLISH_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || typeof data !== "object") return null;
    return data;
  } catch {
    return null;
  }
}

export function savePublished(payload) {
  localStorage.setItem(PUBLISH_KEY, JSON.stringify(payload));
  window.dispatchEvent(new Event("orion-telemetry-change"));
}

export function loadDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveDraft(draft) {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}
