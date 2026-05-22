import { lazy, Suspense } from "react";
import Header from "../components/Header";
import Hero from "../components/Hero";
import About from "../components/About";
import ValuesSection from "../components/ValuesSection";
import CarShowcaseLazy from "../components/CarShowcaseLazy";
import ProcessSection from "../components/ProcessSection";
import Departments from "../components/Departments";
import TeamSection from "../components/TeamSection";
import Footer from "../components/Footer";

const MissionStorySection = lazy(() => import("../components/MissionStorySection"));

export default function HomePage() {
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
        <ProcessSection />
        <Departments />
        <TeamSection />
      </main>
      <Footer />
    </div>
  );
}
