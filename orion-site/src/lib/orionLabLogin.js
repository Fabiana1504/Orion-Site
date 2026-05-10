/** Evento para abrir el flujo de acceso al laboratorio (ahora en una sola pantalla). */
export const ORION_OPEN_LAB_LOGIN_EVENT = "orion-open-lab-login";

export function openLabLoginModal() {
  window.dispatchEvent(new Event(ORION_OPEN_LAB_LOGIN_EVENT));
}
