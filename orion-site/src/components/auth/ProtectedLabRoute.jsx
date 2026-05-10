import { Link } from "react-router-dom";
import { useState } from "react";
import Footer from "../Footer";
import Header from "../Header";
import { useAuth } from "../../context/AuthContext";
import AccessDenied from "./AccessDenied";
import LabLogin from "./LabLogin";

export default function ProtectedLabRoute({ children }) {
  const { user, loading, canAccessLab } = useAuth();
  // reauthOk fuerza ingreso de credenciales cada vez que se entra a una ruta protegida.
  const [reauthOk, setReauthOk] = useState(false);
  const isSignedIn = Boolean(user && user.is_anonymous !== true);

  if (loading) {
    return (
      <div id="top">
        <Header />
        <main className="team-lab-main">
          <div className="container team-lab-container">
            <div className="protected-lab-loading clean-panel team-lab-gate">
              <p className="eyebrow eyebrow--pulse">ORION</p>
              <p className="team-lab-lead" style={{ marginBottom: 0 }}>
                Loading session...
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Always request credentials when entering lab routes.
  if (!reauthOk) {
    return (
      <div id="top">
        <Header />
        <main className="team-lab-main">
          <div className="container team-lab-container">
            <div className="team-lab-gate clean-panel">
              <p className="eyebrow eyebrow--pulse">Laboratory</p>
              {/* LabLogin resuelve credenciales (local o Supabase) y habilita el paso */}
              <LabLogin onSuccess={() => setReauthOk(true)} />
              <p className="team-lab-back">
                <Link to="/">← Back to home</Link>
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isSignedIn) {
    // Si el login falla/caduca, no renderizamos children para evitar flash de contenido privado.
    return null;
  }

  if (!canAccessLab) {
    // Usuario autenticado pero sin permiso en tabla lab_access.
    return <AccessDenied />;
  }

  // Solo llega aquí quien pasó reauth + sesión válida + permiso de laboratorio.
  return children;
}
