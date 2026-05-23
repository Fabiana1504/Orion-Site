"use client";

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
import SponsorMarquee from "../components/SponsorMarquee";

const MissionStorySection = lazy(
  () => import("../components/MissionStorySection"),
);

export default function HomePage() {
  return (
    <div id="top">
      <Header />
      <main>
        <Hero />
        <SponsorMarquee />
        <About />
        <ValuesSection />
        <Suspense
          fallback={
            <section
              id="historia"
              className="relative py-[clamp(72px,10vw,96px)]"
              aria-busy="true"
            >
              <div className="mx-auto w-[min(1120px,calc(100%-clamp(32px,7vw,56px)))]">
                <div className="mx-auto mb-7 max-w-[48rem] text-center">
                  <p className="mb-3 font-sans text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[rgba(61,140,255,0.88)]">
                    Story &amp; data
                  </p>
                  <h2>The mission behind the car</h2>
                  <p className="m-0 mx-auto max-w-[42rem] text-[0.95rem] leading-[1.55] text-[rgba(244,246,251,0.58)]">
                    Loading...
                  </p>
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
