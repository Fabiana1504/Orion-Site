import { lazy, Suspense, useEffect, useState } from "react";
import Header from "../components/Header";
import Hero from "../components/Hero";
import About from "../components/About";
import ValuesSection from "../components/ValuesSection";
import CarShowcaseLazy from "../components/CarShowcaseLazy";
import DataAnalysisSection from "../components/DataAnalysisSection";
import ProcessSection from "../components/ProcessSection";
import Departments from "../components/Departments";
import TeamSection from "../components/TeamSection";
import Footer from "../components/Footer";
import LabLogin from "../components/auth/LabLogin";
import { ORION_OPEN_LAB_LOGIN_EVENT } from "../lib/orionLabLogin";
import { useAuth } from "../hooks/useAuth";

const MissionStorySection = lazy(() => import("../components/MissionStorySection"));

export default function HomePage() {
  const { canAccessLab } = useAuth();
  const [isLabLoginOpen, setIsLabLoginOpen] = useState(false);

  useEffect(() => {
    const open = () => setIsLabLoginOpen(true);
    window.addEventListener(ORION_OPEN_LAB_LOGIN_EVENT, open);
    return () => window.removeEventListener(ORION_OPEN_LAB_LOGIN_EVENT, open);
  }, []);

  useEffect(() => {
    if (canAccessLab) {
      setIsLabLoginOpen(false);
    }
  }, [canAccessLab]);

  return (
    <div id="top">
      <Header />
      <main className="site-main">
        <Hero />
        <About />
        <ValuesSection />
        <Suspense
          fallback={
            <section id="historia" className="section section-mission" aria-busy="true">
              <div className="container">
                <div className="section-head section-head--center">
                  <p className="eyebrow">Story & data</p>
                  <h2>The mission behind the car</h2>
                  <p className="section-lead section-lead--center">Loading...</p>
                </div>
              </div>
            </section>
          }
        >
          <MissionStorySection />
        </Suspense>
        <CarShowcaseLazy />
        <DataAnalysisSection />
        <ProcessSection />
        <Departments />
        <TeamSection />
      </main>
      <Footer />

      {isLabLoginOpen ? (
        <div className="login-modal-root" role="presentation">
          <button
            type="button"
            className="login-modal-backdrop"
            aria-label="Close"
            onClick={() => setIsLabLoginOpen(false)}
          />
          <div className="login-modal-dialog clean-panel" role="dialog" aria-modal="true">
            <LabLogin
              onClose={() => setIsLabLoginOpen(false)}
              onSuccess={() => setIsLabLoginOpen(false)}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
