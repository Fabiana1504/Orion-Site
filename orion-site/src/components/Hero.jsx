import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import SafeImage from "./SafeImage";

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
          <Link to="/herramientas-equipos" className="btn btn-ghost hero-lab-link">
            Go to team tools
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
