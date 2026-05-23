import { Orbitron, Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["500", "700", "800"],
  variable: "--font-orbitron",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "Orion — STEM Racing",
  description:
    "Orion Team — STEM Racing. Ingeniería, diseño y el coche en 3D.",
  metadataBase: new URL("http://localhost:3000"),
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/logo.png", type: "image/png", sizes: "any" },
    ],
    apple: "/logo.png",
  },
  openGraph: {
    type: "website",
    title: "Orion — STEM Racing",
    description:
      "Orion Team — STEM Racing. Ingeniería, diseño y el coche en 3D.",
    images: ["/logo.png"],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/logo.png"],
  },
};

export const viewport = {
  themeColor: "#1b2230",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="es"
      className={`${orbitron.variable} ${plusJakarta.variable} ${inter.variable}`}
    >
      <body>
        <div id="root">
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
