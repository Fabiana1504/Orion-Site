import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedLabRoute from "./components/auth/ProtectedLabRoute";
import HomePage from "./pages/HomePage";
import LabGuestCalcAnalyticsPage from "./pages/LabGuestCalcAnalyticsPage";
import PublicToolsPage from "./pages/PublicToolsPage";
import TeamLabPage from "./pages/TeamLabPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/herramientas-equipos" element={<PublicToolsPage />} />
          <Route
            path="/equipo/calculos-visitantes"
            element={
              <ProtectedLabRoute>
                <LabGuestCalcAnalyticsPage />
              </ProtectedLabRoute>
            }
          />
          <Route
            path="/equipo/laboratorio"
            element={
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
