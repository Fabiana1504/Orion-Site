"use client";

import Image from "next/image";

const ORION_CONTACT_EMAIL = "scuderia.oriononorati@gmail.com";
const ORION_INSTAGRAM_URL = "https://www.instagram.com/scuderiaorion?igsh=dG9sOTVjbXpyc3pq";

const EXPLORE_LINKS = [
  { href: "/#about", label: "About us" },
  { href: "/#values", label: "Values" },
  { href: "/#historia", label: "Story" },
  { href: "/#car", label: "Car Showcase" },
  { href: "/#proceso", label: "Process" },
];

const RESOURCES_LINKS = [
  { href: "/herramientas-equipos", label: "Team Tools & Lab" },
  { href: "/#departments", label: "Departments" },
  { href: "/#team", label: "Meet the Team" },
];

const SPONSORS = [
  { name: "Monge", src: "/logos-marca/Monge.png" },
  { name: "La Guaca", src: "/logos-marca/Logo-La-Guaca.png" },
  { name: "La Manada", src: "/logos-marca/La Manada.webp" },
  { name: "Smart Rabbit", src: "/logos-marca/smart-rabbit.png" },
  { name: "Garaje", src: "/logos-marca/garaje.webp" },
  { name: "Guipi", src: "/logos-marca/guipi.png" },
  { name: "Kadec", src: "/logos-marca/kadec.png" },
  { name: "Karima", src: "/logos-marca/karima.jpeg" },
  { name: "Repuestos", src: "/logos-marca/respuestos.png" },
  { name: "Hair Studio", src: "/logos-marca/hair.jpg" },
];

export default function Footer() {
  return (
    <footer
      id="contacto"
      className="relative border-t border-white/10 pt-20 pb-0 overflow-hidden"
      style={{
        background: "linear-gradient(180deg, transparent, rgba(6,10,16,0.85) 15%, rgba(5,8,14,0.98) 60%, #030508 100%)",
      }}
    >
      {/* Soft Ambient Lights for Visual Depth */}
      <div className="absolute left-1/4 top-20 -translate-y-1/2 w-[350px] h-[350px] bg-[#818cf8]/3 rounded-full blur-[100px] pointer-events-none z-0" />
      <div className="absolute right-1/4 bottom-10 w-[450px] h-[300px] bg-[#3d8cff]/4 rounded-full blur-[120px] pointer-events-none z-0" />

      <div className="relative z-10 mx-auto w-[min(1120px,calc(100%-clamp(32px,7vw,56px)))] flex flex-col">
        {/* Footer Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 items-end gap-12 lg:gap-8 pb-16">
          
          {/* Column 1: Brand Info */}
          <div className="flex flex-col gap-5">
            <div className="flex items-center">
              <Image
                src="/orion-marca/isologo.svg"
                alt="Scuderia Orion Isologo"
                width={27}
                height={22}
                className="w-auto h-[22px] object-contain"
              />
            </div>
            <p className="text-[0.82rem] leading-[1.6] text-[rgba(244,246,251,0.55)] font-medium max-w-[260px]">
              Fusing cutting-edge engineering, data analytics, and design identity to push the boundaries of student motorsport.
            </p>
          </div>

          {/* Column 2: Navigation Links */}
          <div className="flex flex-col gap-4">
            <h4 className="font-sans text-[0.68rem] font-bold uppercase tracking-[0.25em] text-white/40">
              Explore
            </h4>
            <ul className="flex flex-col gap-2.5 p-0 m-0 list-none">
              {EXPLORE_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-[0.8rem] text-[rgba(244,246,251,0.65)] hover:text-white transition-colors duration-250 font-medium"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div className="flex flex-col gap-4">
            <h4 className="font-sans text-[0.68rem] font-bold uppercase tracking-[0.25em] text-white/40">
              Resources
            </h4>
            <ul className="flex flex-col gap-2.5 p-0 m-0 list-none">
              {RESOURCES_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-[0.8rem] text-[rgba(244,246,251,0.65)] hover:text-white transition-colors duration-250 font-medium"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact & Social */}
          <div className="flex flex-col gap-4">
            <h4 className="font-sans text-[0.68rem] font-bold uppercase tracking-[0.25em] text-white/40">
              Connect
            </h4>
            <div className="flex flex-col gap-3">
              <a
                className="text-[0.88rem] font-semibold text-[rgba(129,180,255,0.98)] no-underline transition-all duration-300 hover:text-white pb-0.5 border-b border-transparent hover:border-[#3d8cff]/50 self-start"
                href={`mailto:${ORION_CONTACT_EMAIL}`}
              >
                {ORION_CONTACT_EMAIL}
              </a>
              <div className="flex items-center gap-3 mt-1">
                <a
                  className="inline-flex size-[40px] items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-[rgba(129,180,255,0.98)] transition-all duration-300 hover:text-white hover:border-[#3d8cff]/40 hover:bg-[rgba(61,140,255,0.08)] hover:shadow-[0_0_20px_rgba(61,140,255,0.12)]"
                  href={ORION_INSTAGRAM_URL}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Follow Orion on Instagram"
                  title="Instagram"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="size-[20px] fill-current">
                    <path d="M7.8 2h8.4A5.8 5.8 0 0 1 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8A5.8 5.8 0 0 1 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2Zm0 1.9A3.9 3.9 0 0 0 3.9 7.8v8.4a3.9 3.9 0 0 0 3.9 3.9h8.4a3.9 3.9 0 0 0 3.9-3.9V7.8a3.9 3.9 0 0 0-3.9-3.9H7.8Zm8.9 1.46a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.9a3.1 3.1 0 1 0 0 6.2 3.1 3.1 0 0 0 0-6.2Z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Sponsors Gallery */}
        <div className="border-t border-white/5 py-12 flex flex-col items-center">
          <p className="font-sans text-[0.62rem] font-black uppercase tracking-[0.3em] text-white/25 mb-8">
            Supported by our partners
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-6 md:gap-x-12 w-full max-w-[1000px]">
            {SPONSORS.map((sponsor) => (
              <div
                key={sponsor.name}
                className="relative group/sponsor flex items-center justify-center h-8 md:h-10 w-24 md:w-28 transition-all duration-300"
              >
                <img
                  src={sponsor.src}
                  alt={`${sponsor.name} Logo`}
                  className="max-h-full max-w-full object-contain brightness-[0.75] contrast-[1.25] grayscale opacity-45 transition-all duration-300 group-hover/sponsor:brightness-100 group-hover/sponsor:grayscale-0 group-hover/sponsor:opacity-90 group-hover/sponsor:scale-105"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar: Copyright & Tag */}
        <div className="border-t border-white/5 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 z-10">
          <p className="m-0 text-[0.72rem] tracking-[0.06em] text-white/35 font-sans">
            © {new Date().getFullYear()} Orion Team. All rights reserved.
          </p>
          <p className="m-0 text-[0.68rem] tracking-[0.15em] uppercase text-[#3d8cff]/60 font-semibold font-sans">
            STEM Racing Excellence
          </p>
        </div>
      </div>

      {/* Overlaid Logo Watermark at the Bottom Center */}
      <div className="group absolute left-1/2 bottom-0 z-0 w-full max-w-[960px] -translate-x-1/2 translate-y-[35%] pointer-events-none select-none">
        {/* Glow behind the watermark that intensifies on parent footer hover */}
        <div className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-[20%] w-[500px] h-[150px] bg-blue-500/[0.02] group-hover:bg-blue-500/[0.06] rounded-full blur-[100px] transition-all duration-700" />
        
        <svg
          id="FooterLogo"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="20 470 1040 265"
          className="w-full h-auto fill-current text-white opacity-[0.05] group-hover:opacity-[0.09] transition-opacity duration-700"
        >
          {/* Path 6: Star Logo (Blue) */}
          <path d="M111.06,486.27h0m-16.38,52.6c3.07,5.74,5.78,9.72,8.34,12.45h0a60.26,60.26,0,0,0,11.1,9.68A70.4,70.4,0,0,0,94.7,585.14a88,88,0,0,0-9.8-13.81A85,85,0,0,0,74,560.79a74.13,74.13,0,0,0,12.59-10.55l-.34-.32a50.85,50.85,0,0,0,8.45-11M95,482.29h0c-.32,0-.49,1.72-.9,4.64-.37,2.71-.91,5.39-1.3,8.09-3.93,27.78-18.32,43.66-18.32,43.66C57.63,556.33,34.8,557.72,29,557.9c11.07,2.4,29.39,8.41,43.23,24.39,14.84,17.12,18.5,38.75,21,53.56,1,5.93,1.47,10.88,1.71,14.23.36-2.46.92-6.06,1.73-10.39,3.42-18.33,7.18-38.44,15.85-52.23,3.28-5.22,15.52-22.67,48.36-30.3h-.33c-8.23,0-30.92-1.16-45.1-17,0,0-12.45-13.9-18-45.14-.41-2.32-.92-4.63-1.31-6.95-.65-3.78-.89-5.78-1.23-5.78Zm65.94,74.87h0Z" fill="#3d8cff" />
          {/* Path 1: Letter 'O' */}
          <path d="M316.73,583.08a10.85,10.85,0,0,0-5.91-6.09c-2.7-1.13-5.71-1.09-8.65-1-50.51,1-99-.66-149.48.38-8.63.19-16.74,3.45-20.1,9.69a21.67,21.67,0,0,0-2,5.73c-2.94,13.45-6,26.77-9.39,40.11-1.93,7.56-3.36,18.56,7.45,18.56q81,0,161.93,0c3.53,0,7.35-.11,10.2-2.19,3.22-2.34,4.37-6.56,5.32-10.44q5.09-20.92,10.16-41.81C317.28,591.73,318.28,587.16,316.73,583.08Zm-39.9,26.52c-1.22,3.71-2.42,7.43-3.63,11.14a2.13,2.13,0,0,1-2,1.49l-111.61.7c-1.53,0-2.55-1-2-2.46,1.39-3.65,2.8-7.32,4.18-11,.59-1.46,1-2.48,2.68-2.71a51.68,51.68,0,0,1,6.59-.12q7,0,14.09,0,14.1,0,28.19.09c18.79.11,37.59.26,56.38.09l5.07,0A2.18,2.18,0,0,1,276.83,609.6Z" />
          {/* Path 7: Letter 'R' */}
          <path d="M503.27,648.62c3.2-2.34,4.36-6.57,5.3-10.44q5.07-20.89,10.18-41.82c1-4.24,2-8.81.49-12.89a11,11,0,0,0-5.92-6.1c-2.69-1.12-5.71-1.08-8.65-1-50.52,1-101.3-1-151.82,0-8.63.19-14.39,3.86-17.78,10.08a22.44,22.44,0,0,0-2,5.73c-2.94,13.44-6,26.78-9.38,40.1a35,35,0,0,0-1.33,9.54,16.61,16.61,0,0,0,1.59,8.25c2.79,5.58,7.6,7.4,12.35,10.69,4,2.76,9,7.56,13.08,16.53a1.89,1.89,0,0,0,1.71,1.12h41.49a1.89,1.89,0,0,0,1.76-2.54,67.8,67.8,0,0,0-7.79-15.11,70,70,0,0,0-5.31-6.82,1.87,1.87,0,0,1,1.42-3.1q25.3,0,50.61,0a1.88,1.88,0,0,1,1.22.45L466.1,678.1a1.88,1.88,0,0,0,1.22.45h42.43c3.46,0,5.19-3.54,2.74-5.62l-22.14-18.82a1.88,1.88,0,0,1,1.22-3.31h1.5C496.6,650.8,500.39,650.72,503.27,648.62ZM359.75,620.47l4.18-11c.33-.82,2.13-2.73,3-2.75,37-.45,73,.44,110,0A2.18,2.18,0,0,1,479,609.6c-1.2,3.71-2.42,7.43-3.63,11.14a2.13,2.13,0,0,1-2,1.49l-111.71.7C360.12,623,359.2,621.9,359.75,620.47Z" />
          {/* Path 5: Letter 'I' */}
          <path d="M544.82,581.73,525.5,669.64c-1,4.51,3,8.69,8.48,8.81l24.69.52c4.47.1,8.33-2.62,9-6.34l15.72-88.44c.8-4.5-3.35-8.55-8.76-8.55H553.53C549.26,575.64,545.6,578.2,544.82,581.73Z" />
          {/* Path 2: Letter 'O' */}
          <path d="M783.51,582.64a10.88,10.88,0,0,0-5.9-6.1c-2.71-1.12-5.73-1.08-8.65-1-50.52,1-101-.21-151.51.83-8.65.19-14.73,3-18.09,9.24a21.62,21.62,0,0,0-2,5.74c-2.94,13.44-6,26.78-9.38,40.1C586,639,584.59,650,595.4,650q81,0,162,0c3.52,0,7.32-.08,10.17-2.18,3.23-2.35,4.39-6.57,5.33-10.45q5.07-20.93,10.16-41.81C784.06,591.28,785.08,586.72,783.51,582.64Zm-40.43,27.41q-1.82,5.57-3.61,11.14a2.2,2.2,0,0,1-2,1.49l-111.58,1.2a2.17,2.17,0,0,1-2-3c1.41-3.65,2.8-7.32,4.21-11a2.16,2.16,0,0,1,2-1.39l111-1.37A2.17,2.17,0,0,1,743.08,610.05Z" />
          {/* Path 3: Letter 'N' */}
          <path d="M983.8,595.25q-5.1,20.91-10.17,41.8c-.94,3.9-2.1,8.11-5.32,10.46a17,17,0,0,1-10,2.93c-18,0-35.61-.15-53.62,0-1.86,0-4.41-1.46-5.81-2.62-1.61-1.34-3-3-4.54-4.34l-9-7.76-19.48-16.86-8.78-7.6a2.73,2.73,0,0,0-4.3,1l-6.49,15.5-5,12.06c-1.13,2.71-2,6.81-3.75,9.16a1.6,1.6,0,0,1-.64.54c-.49.22-1.42.9-2,.89-13-.22-25.47,0-38.5,0-10.81,0-9.57-11.74-7.64-19.29,3.38-13.33,6.45-26.65,9.38-40.11a22.27,22.27,0,0,1,2-5.74c3.38-6.22,8.94-8.78,17.59-8.95,9.38-.18,19.53.2,28.9,0,4.85-.1,9.83.1,14.68,0a21.44,21.44,0,0,1,8.17,1.65,39.17,39.17,0,0,1,5.3,3.07l9.74,5.6,23.73,13.64,15.67,9a2.81,2.81,0,0,0,1.35.36,2.77,2.77,0,0,0,2.68-2.2L932.86,584a10.35,10.35,0,0,1,9.92-8.22l27-.55c2.92-.06,5.95-.1,8.65,1a10.91,10.91,0,0,1,5.91,6.09C985.85,586.43,984.83,591,983.8,595.25Z" />
          {/* Path 4: Blue curve accent */}
          <path d="M119.84,663c14.45.9,51.79,5.13,81.42,31.81a107.56,107.56,0,0,1,19.54,23.37h61.89a77.15,77.15,0,0,0-24.76-36.35A89,89,0,0,0,215.58,663Z" fill="#3d8cff" />
          {/* Path 8: Blue long horizontal line */}
          <path d="M261.58,663c7.7,4.21,21,12.69,31.14,27a70.58,70.58,0,0,1,12.1,28.19H1048.6l-36.18-23.93-678.19-.82a47.38,47.38,0,0,0-11.58-19.94A60,60,0,0,0,309.15,663Z" fill="#3d8cff" />
          {/* Path 9: Blue secondary horizontal line */}
          <path d="M1000.14,678.48,578.36,679a1.07,1.07,0,0,1-1.05-1.31l2.27-9.74a6.32,6.32,0,0,1,6.16-4.89c86.9.15,193,.38,279.12.53L977.48,663a1.18,1.18,0,0,1,.55.14Z" fill="#3d8cff" />
        </svg>
      </div>
    </footer>
  );
}
