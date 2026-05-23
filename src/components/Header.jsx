"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const LINKS = [
  { href: "/herramientas-equipos", label: "Team tools" },
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
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => document.body.classList.remove("overflow-hidden");
  }, [menuOpen]);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50">
        <div className="mx-auto flex w-[min(1120px,calc(100%-clamp(32px,7vw,56px)))] items-center py-3 relative">
          <button
            type="button"
            className={`z-[52] flex h-10 w-10 cursor-pointer flex-col items-center justify-center gap-[5px] rounded-[10px] border border-white/10 bg-white/[0.04] p-0 transition-all duration-200 hover:border-[rgba(61,140,255,0.4)] hover:bg-[rgba(61,140,255,0.08)] max-lg:ml-auto lg:!hidden ${menuOpen ? "border-[rgba(61,140,255,0.4)] bg-[rgba(61,140,255,0.08)]" : ""}`}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="site-nav"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span className={`mx-auto block h-[2px] w-[16px] rounded-sm bg-white/80 transition-all duration-250 ${menuOpen ? "translate-y-[7px] rotate-45" : ""}`} />
            <span className={`mx-auto block h-[2px] w-[16px] rounded-sm bg-white/80 transition-all duration-250 ${menuOpen ? "scale-x-0 opacity-0" : ""}`} />
            <span className={`mx-auto block h-[2px] w-[16px] rounded-sm bg-white/80 transition-all duration-250 ${menuOpen ? "-translate-y-[7px] -rotate-45" : ""}`} />
          </button>

          <div
            className={`fixed inset-0 z-48 bg-[rgba(5,8,14,0.6)] opacity-0 backdrop-blur-sm transition-all duration-300 pointer-events-none lg:!hidden ${menuOpen ? "!opacity-100 !pointer-events-auto" : ""}`}
            aria-hidden
            onClick={() => setMenuOpen(false)}
          />

          <nav
            id="site-nav"
            className={`flex min-w-0 flex-1 items-center max-lg:absolute max-lg:left-0 max-lg:right-0 max-lg:top-[calc(100%+8px)] max-lg:z-[51] max-lg:m-auto max-lg:hidden max-lg:w-[min(100%,400px)] max-lg:animate-[nav-drop_0.25s_ease] ${menuOpen ? "max-lg:!flex" : ""}`}
            aria-label="Main navigation"
          >
            <div
              className="flex w-full items-center justify-between rounded-2xl border border-white/10 p-1.5 max-lg:w-full max-lg:flex-col max-lg:gap-0.5 max-lg:rounded-2xl max-lg:border-white/12 max-lg:p-2.5 backdrop-blur-[20px] max-lg:backdrop-blur-[40px]"
              style={{
                background: "linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01)), rgba(6,10,16,0.5)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 12px 32px rgba(0,0,0,0.25)",
              }}
            >
              <div className="flex items-center max-lg:w-full">
                <a
                  href="/"
                  className="flex shrink-0 items-center rounded-[10px] border border-transparent px-3.5 py-2 no-underline transition-all duration-200 hover:border-[rgba(61,140,255,0.25)] hover:bg-[rgba(61,140,255,0.1)] hover:shadow-[0_0_20px_rgba(61,140,255,0.08)] max-lg:w-full max-lg:justify-start"
                >
                  <Image
                    src="/orion-marca/isologo.svg"
                    alt="Orion"
                    className="block size-[40px]"
                    width={40}
                    height={40}
                    loading="eager"
                  />
                </a>
              </div>

              <div className="flex items-center gap-1 max-lg:w-full max-lg:flex-col max-lg:gap-0.5">
                {LINKS.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="inline-block whitespace-nowrap rounded-[10px] border border-transparent px-3.5 py-2 text-[0.78rem] font-semibold tracking-[0.02em] text-white/65 no-underline transition-all duration-200 hover:-translate-y-[0.5px] hover:border-[rgba(61,140,255,0.25)] hover:bg-[rgba(61,140,255,0.1)] hover:text-white/95 hover:shadow-[0_0_20px_rgba(61,140,255,0.08)] focus-visible:outline-[2px] focus-visible:outline-[rgba(61,140,255,0.75)] focus-visible:outline-offset-2 max-lg:w-full max-lg:rounded-[10px] max-lg:px-3.5 max-lg:py-2.5 max-lg:text-left max-lg:text-[0.85rem]"
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </div>
          </nav>
        </div>
      </header>
    </>
  );
}
