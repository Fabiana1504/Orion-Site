"use client";

import { useEffect, useState } from "react";

const CAR_GLB_PATH = "/so26.glb";

const MODEL_VIEWER_HTML = `<model-viewer
  class="car-model-viewer"
  src="${CAR_GLB_PATH}"
  alt="Orion car 3D model"
  camera-controls
  touch-action="pan-y"
  interaction-prompt="none"
  shadow-intensity="0.5"
  shadow-softness="0.6"
  environment-image="/studio-top-light.jpg"
  exposure="1.2"
  orientation="0deg 0deg 0deg"
  min-camera-orbit="auto 20deg 70%"
  max-camera-orbit="auto 115deg 220%"
  camera-orbit="38deg 74deg 55%"
  min-field-of-view="14deg"
  max-field-of-view="58deg"
  field-of-view="22deg"
  disable-tap
  style="background-color: transparent; --poster-color: transparent;"
></model-viewer>`;

export default function CarModelViewer() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (customElements.get("model-viewer")) {
      setMounted(true);
      return;
    }
    const script = document.createElement("script");
    script.type = "module";
    script.src =
      "https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js";
    script.onload = () => setMounted(true);
    script.onerror = () => console.error("Failed to load model-viewer");
    document.head.appendChild(script);
    return () => {
      // Do not remove script on unmount to avoid re-loading
    };
  }, []);

  if (!mounted) {
    return (
      <div className="car-model-wrapper mx-auto" aria-label="Orion vehicle viewer">
        <div
          className="car-model-viewer"
          style={{ background: "transparent" }}
        />
      </div>
    );
  }

  return (
    <div className="car-model-wrapper mx-auto" aria-label="Orion vehicle viewer">
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "10%",
          width: "80%",
          height: "55%",
          mixBlendMode: "overlay",
          pointerEvents: "none",
          zIndex: 2,
        }}
      />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          height: "100%",
        }}
        dangerouslySetInnerHTML={{ __html: MODEL_VIEWER_HTML }}
      />
    </div>
  );
}
