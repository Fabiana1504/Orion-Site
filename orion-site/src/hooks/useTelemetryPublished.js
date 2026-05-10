import { useEffect, useState } from "react";
import { loadPublished } from "../lib/telemetryStore";

export function useTelemetryPublished() {
  // Estado inicial desde localStorage/snapshot publicado (si existe).
  const [data, setData] = useState(() => loadPublished());

  useEffect(() => {
    // Este hook escucha cuando el laboratorio publica nuevos resultados
    // y refresca la vista pública sin recargar toda la página.
    const fn = () => setData(loadPublished());
    window.addEventListener("orion-telemetry-change", fn);
    return () => window.removeEventListener("orion-telemetry-change", fn);
  }, []);

  // Se retorna el "último análisis publicado" para gráficos de Home.
  return data;
}
