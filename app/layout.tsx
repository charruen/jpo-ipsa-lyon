import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "U Tragulinu — Carte & Menu",
  description:
    "Découvrez la carte du restaurant U Tragulinu à Saint-Cyprien, Lecci — Porto-Vecchio, Corse. Cuisine méditerranéenne et spécialités corses.",
  keywords: [
    "restaurant",
    "corse",
    "porto-vecchio",
    "saint-cyprien",
    "lecci",
    "carte",
    "menu",
    "U Tragulinu",
  ],
  openGraph: {
    title: "U Tragulinu — Carte & Menu",
    description:
      "Cuisine méditerranéenne et spécialités corses à Saint-Cyprien, Lecci.",
    locale: "fr_FR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${playfair.variable} scroll-smooth`}
    >
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
