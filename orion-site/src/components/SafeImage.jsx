import { useState } from "react";

function initialsFromAlt(alt) {
  if (!alt || typeof alt !== "string") return "?";
  const parts = alt.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase().slice(0, 2);
  }
  return alt.slice(0, 2).toUpperCase();
}

/**
 * Image with error fallback and consistent sizing via className on both states.
 */
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
        className={`safe-image-fallback ${className}`.trim()}
        role="img"
        aria-label={alt || "Image unavailable"}
        style={style}
      >
        <span className="safe-image-fallback-initials">{initialsFromAlt(alt)}</span>
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
