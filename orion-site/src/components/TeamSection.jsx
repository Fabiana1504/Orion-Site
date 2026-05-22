import { useState } from "react";
import SafeImage from "./SafeImage";
import { teamMembers } from "../data/team";

const defaultPhoto = {
  rotateDeg: 0,
  objectPosition: "50% 28%",
  thumbPosition: "50% 30%",
  scale: 1.18,
};

function needsPhotoTransform(p) {
  return (p.rotateDeg ?? 0) !== 0 || Boolean(p.flipX);
}

/** Combina rotación, escala y espejo horizontal (flipX). */
function photoTransform(p, scaleOverride) {
  const rot = p.rotateDeg ?? 0;
  const sc = scaleOverride ?? p.scale ?? 1;
  const parts = [`rotate(${rot}deg)`, `scale(${sc})`];
  if (p.flipX) parts.push("scaleX(-1)");
  return parts.join(" ");
}

export default function TeamSection() {
  const [selected, setSelected] = useState(teamMembers[0]);

  const ph = { ...defaultPhoto, ...selected.photo };

  return (
    <section id="team" className="section section-team">
      <div className="container">
        <div className="section-head">
          <p className="eyebrow">Team</p>
          <h2>Orion Team</h2>
          <p className="section-lead">
            Face, role, and context in one view. Select someone from the list.
          </p>
        </div>

        <div className="team-layout clean-team">
          <div className="team-list clean-panel">
            {teamMembers.map((member) => {
              const p = { ...defaultPhoto, ...member.photo };
              const tScale =
                p.thumbScale ?? Math.min(typeof p.scale === "number" ? p.scale : 1.18, 1.42);
              const thumbNeeds = needsPhotoTransform(p);
              return (
                <button
                  key={member.name}
                  type="button"
                  className={`team-button ${selected.name === member.name ? "active" : ""}`}
                  onClick={() => setSelected(member)}
                >
                  <span
                    className={`team-thumb-wrap ${thumbNeeds ? "team-thumb-wrap--rot" : ""}`}
                  >
                    {thumbNeeds ? (
                      <div
                        className="team-thumb-inner"
                        style={{
                          transform: photoTransform(p, tScale),
                        }}
                      >
                        <SafeImage
                          src={member.image}
                          alt={member.name}
                          className="team-thumb"
                          loading="lazy"
                          style={{ objectPosition: p.thumbPosition }}
                        />
                      </div>
                    ) : (
                      <SafeImage
                        src={member.image}
                        alt={member.name}
                        className="team-thumb"
                        loading="lazy"
                        style={{ objectPosition: p.thumbPosition }}
                      />
                    )}
                  </span>
                  <div className="team-button-text">
                    <strong>{member.name}</strong>
                    <span>{member.role}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="member-detail clean-panel">
            <figure
              className={`member-photo-wrap ${needsPhotoTransform(ph) ? "member-photo-wrap--rot" : ""}`}
            >
              {needsPhotoTransform(ph) ? (
                <div
                  className="member-photo-inner"
                  style={{
                    transform: photoTransform(ph, ph.scale),
                  }}
                >
                  <SafeImage
                    src={selected.image}
                    alt={selected.name}
                    className="member-large"
                    loading="eager"
                    style={{ objectPosition: ph.objectPosition }}
                  />
                </div>
              ) : (
                <SafeImage
                  src={selected.image}
                  alt={selected.name}
                  className="member-large"
                  loading="eager"
                  style={{ objectPosition: ph.objectPosition }}
                />
              )}
            </figure>
            <div className="member-copy">
              <p className="eyebrow small">{selected.area}</p>
              <h3>{selected.name}</h3>
              <p className="member-role">{selected.role}</p>
              <p className="member-bio">{selected.bio}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
