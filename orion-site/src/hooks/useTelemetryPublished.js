import { useEffect, useState } from "react";
import { loadPublished } from "../lib/telemetryStore";

export function useTelemetryPublished() {
  const [data, setData] = useState(() => loadPublished());

  useEffect(() => {
    const fn = () => setData(loadPublished());
    window.addEventListener("orion-telemetry-change", fn);
    return () => window.removeEventListener("orion-telemetry-change", fn);
  }, []);

  return data;
}
