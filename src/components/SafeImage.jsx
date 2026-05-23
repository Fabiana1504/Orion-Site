"use client";

import { useState } from "react";

function initialsFromAlt(alt) {
  if (!alt || typeof alt !== "string") return "?";
  const parts = alt.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase().slice(0, 2);
  }
  return alt.slice(0, 2).toUpperCase();
}

export default function SafeImage({
  src,
  alt = "",
  className = "",
  style,
  loading = "lazy",
  decoding = "async",
  draggable,
  ...rest
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`flex items-center justify-center overflow-hidden font-display font-bold tracking-[0.06em] text-[rgba(255,255,255,0.92)] ${className}`.trim()}
        role="img"
        aria-label={alt || "Image unavailable"}
        style={{
          ...style,
          background: "linear-gradient(145deg, rgba(43,124,255,0.22), rgba(91,61,255,0.12), rgba(0,0,0,0.35))",
          border: "1px solid var(--line)",
        }}
      >
        <span className="select-none text-[clamp(1rem,3vw,1.35rem)] pointer-events-none">
          {initialsFromAlt(alt)}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      loading={loading}
      decoding={decoding}
      draggable={draggable}
      onError={() => setFailed(true)}
      {...rest}
    />
  );
}
