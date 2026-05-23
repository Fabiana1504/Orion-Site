"use client";

import { useId, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { hasLocalLabCredentialsConfigured } from "../../lib/localLabAuth";

/**
 * Formulario email/contraseña (Supabase Auth).
 * @param {{ onSuccess?: () => void, onClose?: () => void, dialogTitleId?: string }} props
 */
export default function LabLogin({ onSuccess, onClose, dialogTitleId }) {
  const autoId = useId();
  const titleId = dialogTitleId ?? autoId;
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const hasLocalCredentials = hasLocalLabCredentialsConfigured();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const msg = await signIn(email.trim(), password);
      if (msg) {
        setError(msg);
        return;
      }
      onSuccess?.();
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {onClose ? (
        <div className="login-modal-head">
          <h2 id={titleId} className="login-modal-title">
            Enter the laboratory
          </h2>
          <button type="button" className="login-modal-close" aria-label="Close" onClick={onClose}>
            ×
          </button>
        </div>
      ) : (
        <h1 id={titleId} className="team-lab-page-title" style={{ marginBottom: "0.35rem" }}>
          Enter the laboratory
        </h1>
      )}

      <form className="login-modal-form lab-login-form" onSubmit={handleSubmit} aria-labelledby={titleId}>
        <label className="login-modal-field">
          <span>Email</span>
          <input
            name="email"
            type={hasLocalCredentials ? "text" : "email"}
            autoComplete={hasLocalCredentials ? "username" : "email"}
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={hasLocalCredentials ? "laboratory user" : "team@yourinstitution.edu"}
            disabled={loading}
          />
        </label>
        <label className="login-modal-field">
          <span>Password</span>
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            disabled={loading}
          />
        </label>
        {error ? (
          <p className="lab-login-error" role="alert">
            {error}
          </p>
        ) : null}
        <div className="login-modal-actions">
          {onClose ? (
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={loading}>
              Cancel
            </button>
          ) : null}
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </div>
      </form>
    </>
  );
}
