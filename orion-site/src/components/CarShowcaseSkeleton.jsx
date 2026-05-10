export default function CarShowcaseSkeleton({ busy = false }) {
  return (
    <>
      <div className="car-heading">
        <p className="eyebrow">Vehicle</p>
        <h2>The car in 360°.</h2>
        <p className="section-text">
          3D model from <code className="inline-code">public/gulf_mclaren_f1_2022_car.glb</code>.
          Drag with mouse or finger to rotate the camera around the car; zoom with wheel or pinch.
        </p>
      </div>

      <div
        className="car-scroll-stage car-scroll-stage--skeleton"
        aria-busy={busy ? "true" : undefined}
        aria-label={busy ? "Loading 3D model" : undefined}
      >
        <div className="car-skeleton-shimmer" aria-hidden />
        <p className="car-skeleton-label">{busy ? "Loading 3D model..." : "The viewer will load as you approach"}</p>
      </div>

      <div className="car-note">
        <span>Drag to rotate · wheel or pinch to zoom</span>
        <p>
          If you prefer less motion across the page, enable "Reduce motion" in your system settings
          (model controls remain available).
        </p>
      </div>
    </>
  );
}
