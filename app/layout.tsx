import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#020617",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "IPSA Lyon — Compagnon JPO & Compte Rendu Parcoursup",
  description:
    "Application compagnon pour la Journée Portes Ouvertes de l'école d'ingénieurs IPSA (Campus de Lyon) : agenda dynamique, checklist questions stratégiques, carnet de visite et générateur de compte-rendu Parcoursup & Famille.",
  keywords: [
    "IPSA",
    "IPSA Lyon",
    "JPO",
    "Journée Portes Ouvertes",
    "Parcoursup",
    "École d'ingénieurs",
    "Aéronautique",
    "Aérospatial",
    "Concours Advance",
    "Projet de formation motivé",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${inter.variable} scroll-smooth`}>
      <body className="min-h-screen antialiased bg-slate-950 text-slate-100 selection:bg-blue-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
