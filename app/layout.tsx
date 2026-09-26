import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeartbeatConexion from "@/components/HeartbeatConexion";

export const metadata: Metadata = {
  title: {
    default: "Chismólogo — Aquí todo se sabe",
    template: "%s | Chismólogo",
  },
  description:
    "Confesiones anónimas, contactos y amigos. La red social del chisme. Comparte lo que no te atreves y conoce gente nueva.",
  keywords: [
    "chismes",
    "confesiones",
    "anónimo",
    "contactos",
    "amigos",
    "red social",
    "chismologo",
  ],
  authors: [{ name: "Chismólogo" }],
  creator: "Chismólogo",
  metadataBase: new URL("https://chismologo.online"),
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "https://chismologo.online",
    siteName: "Chismólogo",
    title: "Chismólogo — Aquí todo se sabe",
    description:
      "Confesiones anónimas, contactos y amigos. La red social del chisme.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Chismólogo — Aquí todo se sabe",
    description:
      "Confesiones anónimas, contactos y amigos. La red social del chisme.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="bg-fondo text-texto antialiased min-h-screen flex flex-col">
        <Header />
        <HeartbeatConexion />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}