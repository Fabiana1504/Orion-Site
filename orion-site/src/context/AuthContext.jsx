import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as authService from "../services/authService";
import { getLabAccess } from "../services/labAccessService";
import {
  createLocalLabUser,
  hasLocalLabCredentialsConfigured,
  matchesLocalLabCredentials,
  readLocalLabSession,
  writeLocalLabSession,
} from "../lib/localLabAuth";

const AuthContext = createContext(null);

/** "Failed to fetch" = red, DNS, URL mal copiada o proyecto pausado. */
function humanizeAuthError(err) {
  const raw = err?.message != null ? String(err.message) : String(err ?? "");
  const l = raw.toLowerCase();
  if (
    l.includes("failed to fetch") ||
    l.includes("networkerror") ||
    l.includes("load failed") ||
    l.includes("network request failed")
  ) {
    return (
      "No connection to Supabase (network error). Revisá: " +
      "(1) En dashboard → Settings → API, copiá de nuevo la Project URL y la anon/public key en .env.local. " +
      "(2) Que el proyecto no esté pausado. " +
      "(3) Internet, VPN o firewall. " +
      "Nota: el laboratorio Orion sigue siendo por invitación (cuenta con correo)."
    );
  }
  return raw || "Sign-in error.";
}

function getAllowedLabEmails() {
  const raw = String(import.meta.env.VITE_LAB_ALLOWED_EMAILS ?? "");
  return raw
    .split(",")
    .map((x) => x.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Sesión Supabase + fila `lab_access` (role: admin | lab_operator | viewer, can_access_lab).
 */
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [labAccess, setLabAccess] = useState(null);
  const [loading, setLoading] = useState(true);
  const localAuthEnabled = hasLocalLabCredentialsConfigured();
  const allowedLabEmails = useMemo(() => getAllowedLabEmails(), []);

  const refreshLabAccess = useCallback(async (uid) => {
    if (!uid) {
      setLabAccess(null);
      return;
    }
    const row = await getLabAccess(uid);
    setLabAccess(row ?? { role: null, can_access_lab: false });
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const localActive = localAuthEnabled && readLocalLabSession();
      if (localActive) {
        const localUser = createLocalLabUser(import.meta.env.VITE_LAB_LOGIN_USER ?? "orion-lab");
        if (cancelled) return;
        setSession({ user: localUser, access_token: "local-lab-session" });
        setUser(localUser);
        setLabAccess({ role: "lab_operator", can_access_lab: true });
        setLoading(false);
        return;
      }

      const { data } = await authService.getCurrentSession();
      if (cancelled) return;
      if (data.session?.user?.email && allowedLabEmails.length > 0) {
        const email = String(data.session.user.email).toLowerCase();
        if (!allowedLabEmails.includes(email)) {
          await authService.signOutUser();
          setSession(null);
          setUser(null);
          setLabAccess(null);
          setLoading(false);
          return;
        }
      }
      setSession(data.session ?? null);
      setUser(data.session?.user ?? null);
      if (data.session?.user?.id) {
        await refreshLabAccess(data.session.user.id);
      } else {
        setLabAccess(null);
      }
      setLoading(false);
    })();

    const {
      data: { subscription },
    } = authService.onAuthStateChange((event, nextSession) => {
      if (nextSession?.user?.id) {
        writeLocalLabSession(false);
      }
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      if (!nextSession?.user?.id) {
        setLabAccess(null);
        setLoading(false);
        return;
      }
      const uid = nextSession.user.id;
      // Tras login, esperar lab_access antes de quitar loading (evita flash de acceso denegado).
      if (event === "SIGNED_IN") {
        setLoading(true);
        void refreshLabAccess(uid).finally(() => setLoading(false));
        return;
      }
      void refreshLabAccess(uid);
    });

    return () => {
      cancelled = true;
      subscription?.unsubscribe();
    };
  }, [allowedLabEmails, localAuthEnabled, refreshLabAccess]);

  /** @returns {Promise<string | null>} mensaje de error o null si OK */
  const signIn = useCallback(async (email, password) => {
    const normalizedEmail = email.trim().toLowerCase();
    if (allowedLabEmails.length > 0 && !allowedLabEmails.includes(normalizedEmail)) {
      return "Este correo no tiene acceso al laboratorio.";
    }

    if (localAuthEnabled && matchesLocalLabCredentials(email, password)) {
      const localUser = createLocalLabUser(email);
      writeLocalLabSession(true);
      setSession({ user: localUser, access_token: "local-lab-session" });
      setUser(localUser);
      setLabAccess({ role: "lab_operator", can_access_lab: true });
      return null;
    }

    try {
      const { data, error } = await authService.signInWithEmail(email, password);
      if (!error) {
        const signedEmail = String(data?.user?.email ?? normalizedEmail).toLowerCase();
        if (allowedLabEmails.length > 0 && !allowedLabEmails.includes(signedEmail)) {
          await authService.signOutUser();
          return "Este correo no tiene acceso al laboratorio.";
        }
        return null;
      }
      return humanizeAuthError(error);
    } catch (e) {
      return humanizeAuthError(e);
    }
  }, [allowedLabEmails, localAuthEnabled]);

  const signOut = useCallback(async () => {
    if (user?.id === "local-lab-user") {
      writeLocalLabSession(false);
      setSession(null);
      setUser(null);
      setLabAccess(null);
      return;
    }
    await authService.signOutUser();
    setLabAccess(null);
  }, [user]);

  const canAccessLab = Boolean(user && labAccess?.can_access_lab === true);

  const value = useMemo(
    () => ({
      session,
      user,
      loading,
      labAccess,
      signIn,
      signOut,
      canAccessLab,
    }),
    [session, user, loading, labAccess, signIn, signOut, canAccessLab],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return ctx;
}
