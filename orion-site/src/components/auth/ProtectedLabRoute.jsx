import { Link } from "react-router-dom";
import { useState } from "react";
import Footer from "../Footer";
import Header from "../Header";
import { useAuth } from "../../context/AuthContext";
import AccessDenied from "./AccessDenied";
import LabLogin from "./LabLogin";

export default function ProtectedLabRoute({ children }) {
  const { user, loading, canAccessLab } = useAuth();
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
    return null;
  }

  if (!canAccessLab) {
    return <AccessDenied />;
  }

  return children;
}
