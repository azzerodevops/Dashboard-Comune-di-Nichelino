import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://dashboard-comune-di-nichelino.vercel.app"),
  title: "Dashboard PAESC Nichelino",
  description:
    "Dashboard di monitoraggio del Piano d'Azione per l'Energia Sostenibile e il Clima del Comune di Nichelino",
  openGraph: {
    title: "Dashboard PAESC Nichelino",
    description:
      "Monitoraggio del Piano d'Azione per l'Energia Sostenibile e il Clima del Comune di Nichelino",
    images: [
      {
        url: "/piazza-nichelino.jpg",
        width: 1200,
        height: 630,
        alt: "Piazza di Nichelino",
      },
    ],
    locale: "it_IT",
    type: "website",
    siteName: "Dashboard PAESC Nichelino",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dashboard PAESC Nichelino",
    description:
      "Monitoraggio del Piano d'Azione per l'Energia Sostenibile e il Clima del Comune di Nichelino",
    images: ["/piazza-nichelino.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body className={`${inter.variable} antialiased`}>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
