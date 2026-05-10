import { useEffect, useId, useRef } from "react";
import { setAuth } from "../lib/auth";

/**
 * Modal de acceso al modo equipo (demo local, sin backend).
 */
export default function LoginModal({ open, onClose, onSuccess }) {
  const titleId = useId();
  const closeRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const esc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [open, onClose]);

  if (!open) return null;

  const submit = (e) => {
    e.preventDefault();
    setAuth(true);
    onSuccess?.();
    onClose();
  };

  return (
    <div className="login-modal-root" role="presentation">
      <button type="button" className="login-modal-backdrop" aria-label="Cerrar" onClick={onClose} />
      <div
        className="login-modal-dialog clean-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="login-modal-head">
          <h2 id={titleId} className="login-modal-title">
            Acceso al laboratorio
          </h2>
          <button
            ref={closeRef}
            type="button"
            className="login-modal-close"
            aria-label="Cerrar"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <p className="login-modal-lead">
          Ingresá usuario y contraseña para entrar al laboratorio de datos (telemetría, Arduino y publicación).
          En esta demo no hay servidor: cualquier combinación habilita el acceso.
        </p>
        <form className="login-modal-form" onSubmit={submit}>
          <label className="login-modal-field">
            <span>Usuario</span>
            <input name="user" type="text" autoComplete="username" required placeholder="equipo.orion" />
          </label>
          <label className="login-modal-field">
            <span>Password</span>
            <input
              name="pass"
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
            />
          </label>
          <div className="login-modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Entrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
