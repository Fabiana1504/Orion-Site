import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const LINKS = [
  { to: "/herramientas-equipos", label: "Team tools", isRoute: true },
  { href: "/#about", label: "About us" },
  { href: "/#values", label: "Values" },
  { href: "/#historia", label: "Story" },
  { href: "/#car", label: "Car" },
  { href: "/#proceso", label: "Process" },
  { href: "/#departments", label: "Departments" },
  { href: "/#team", label: "Team" },
  { href: "/#contacto", label: "Contact" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  useEffect(() => {
    if (menuOpen) {
      document.body.classList.add("nav-menu-open");
    } else {
      document.body.classList.remove("nav-menu-open");
    }
    return () => document.body.classList.remove("nav-menu-open");
  }, [menuOpen]);

  return (
    <>
      <header className="header">
        <div className="container nav">
          <Link to="/" className="mini-brand">
            ORION
          </Link>

          <button
            type="button"
            className={`nav-burger ${menuOpen ? "is-open" : ""}`}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="site-nav"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span className="nav-burger-bar" />
            <span className="nav-burger-bar" />
            <span className="nav-burger-bar" />
          </button>

          <div
            className={`nav-backdrop ${menuOpen ? "is-visible" : ""}`}
            aria-hidden
            onClick={() => setMenuOpen(false)}
          />

          <nav
            id="site-nav"
            className={`nav-links ${menuOpen ? "is-open" : ""}`}
            aria-label="Main navigation"
          >
            <div className="nav-links-track">
              {LINKS.map((item) =>
                item.isRoute ? (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="nav-link"
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <a
                    key={item.href}
                    href={item.href}
                    className="nav-link"
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </a>
                ),
              )}
            </div>
          </nav>
        </div>
      </header>
    </>
  );
}
