"use client";

import { lazy, Suspense, useEffect, useRef, useState } from "react";
import CarShowcaseSkeleton from "./CarShowcaseSkeleton";

const CarShowcase = lazy(() => import("./CarShowcase"));

const IO_ROOT_MARGIN = "280px 0px";

export default function CarShowcaseLazy() {
  const [shouldLoad, setShouldLoad] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: IO_ROOT_MARGIN, threshold: 0 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (shouldLoad) {
    return (
      <Suspense
        fallback={
          <section id="car" className="relative pb-[112px] pt-8">
            <div className="mx-auto w-[min(1120px,calc(100%-clamp(32px,7vw,56px)))]">
              <CarShowcaseSkeleton busy />
            </div>
          </section>
        }
      >
        <CarShowcase />
      </Suspense>
    );
  }

  return (
    <section ref={sectionRef} id="car" className="relative pb-[112px] pt-8">
      <div className="mx-auto w-[min(1120px,calc(100%-clamp(32px,7vw,56px)))]">
        <CarShowcaseSkeleton busy={false} />
      </div>
    </section>
  );
}
