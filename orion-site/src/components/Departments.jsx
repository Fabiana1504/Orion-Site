import SafeImage from "./SafeImage";
import { departments } from "../data/team";

export default function Departments() {
  return (
    <section id="departments" className="section section-departments">
      <div className="container">
        <div className="section-head">
          <p className="eyebrow">Departments</p>
          <h2>Every area pushes Orion forward.</h2>
          <p className="section-lead">
            Two pillars: engineering and communication. Images are carefully framed
            to keep proper proportions on any screen.
          </p>
        </div>

        <div className="department-list clean-list">
          {departments.map((department) => {
            const ph = department.photo;
            const needsRot = ph && ph.rotateDeg !== 0;
            return (
              <article className="department-card clean" key={department.name}>
                <div className="department-copy">
                  <h3>{department.name}</h3>
                  <p>{department.description}</p>
                </div>

                <figure
                  className={`department-media media-frame ${needsRot ? "media-frame--rot" : ""}`}
                >
                  {needsRot ? (
                    <div
                      className="department-photo-inner"
                      style={{
                        transform: `rotate(${ph.rotateDeg}deg) scale(${ph.scale})`,
                      }}
                    >
                      <SafeImage
                        src={department.images[0]}
                        alt={department.name}
                        className="department-single-image"
                        loading="lazy"
                        style={{ objectPosition: ph.objectPosition }}
                      />
                    </div>
                  ) : (
                    <SafeImage
                      src={department.images[0]}
                      alt={department.name}
                      className="department-single-image"
                      loading="lazy"
                      style={{ objectPosition: ph?.objectPosition || "center center" }}
                    />
                  )}
                </figure>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
