import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import SafeImage from "./SafeImage";

/**
 * Archivo: Hero.jsx
 * Responsabilidad: portada principal de la landing (branding + CTA hacia Team tools).
 */
export default function Hero() {
  return (
    <section className="hero-minimal">
      <div className="hero-center">
        <motion.div
          className="hero-logo-wrap"
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9 }}
        >
          {/* SafeImage evita roturas visuales si la imagen falla y mantiene estilo consistente. */}
          <SafeImage
            src="/logo.png"
            alt="Orion"
            className="hero-logo-big"
            loading="eager"
            decoding="sync"
          />
        </motion.div>

        <motion.p
          className="hero-subtle"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Precision · Identity · Performance
        </motion.p>

        <motion.div
          className="hero-lab-cta"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.45 }}
        >
          <p className="hero-subtle">Laboratory access</p>
          <Link to="/equipo/laboratorio" className="btn btn-primary hero-lab-link">
            Private access
          </Link>
          <Link to="/herramientas-equipos" className="btn btn-ghost hero-lab-link">
            Team access
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
