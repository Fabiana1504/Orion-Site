import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedLabRoute from "./components/auth/ProtectedLabRoute";
import HomePage from "./pages/HomePage";
import LabGuestCalcAnalyticsPage from "./pages/LabGuestCalcAnalyticsPage";
import PublicToolsPage from "./pages/PublicToolsPage";
import TeamLabPage from "./pages/TeamLabPage";

export default function App() {
  return (
    // BrowserRouter maneja navegación SPA (sin recarga completa).
    <BrowserRouter>
      {/* AuthProvider expone sesión, permisos de laboratorio y acciones de login/logout. */}
      <AuthProvider>
        <Routes>
          {/* Home pública del sitio Orion */}
          <Route path="/" element={<HomePage />} />
          {/* Herramientas públicas para que equipos externos registren mediciones */}
          <Route path="/herramientas-equipos" element={<PublicToolsPage />} />
          <Route
            path="/equipo/calculos-visitantes"
            element={
              // Vista de analítica privada: requiere autenticación + permiso de laboratorio.
              <ProtectedLabRoute>
                <LabGuestCalcAnalyticsPage />
              </ProtectedLabRoute>
            }
          />
          <Route
            path="/equipo/laboratorio"
            element={
              // Laboratorio privado principal (telemetría, IA, publicación).
              <ProtectedLabRoute>
                <TeamLabPage />
              </ProtectedLabRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
