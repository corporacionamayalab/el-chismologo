import type { Metadata, Viewport } from "next";
import "./globals.css";
import PWAInstaller from "@/components/PWAInstaller";

export const metadata: Metadata = {
  title: {
  default: "Chismólogo",
  template: "%s | Chismólogo",
},
  description:
    "La red social donde puedes confesar tus secretos de forma anónima, encontrar pareja o amigos, y chatear en tiempo real. Todo en un lugar seguro y moderado.",
  keywords: [
    "chismes",
    "confesiones",
    "confesiones anónimas",
    "contactos",
    "buscar pareja",
    "amigos",
    "chatear",
    "red social",
    "chismologo",
    "perú",
    "trujillo",
  ],
  authors: [{ name: "Chismólogo" }],
  creator: "Chismólogo",
  metadataBase: new URL("https://www.chismologo.online"),
  alternates: {
    canonical: "https://www.chismologo.online",
  },

  // 👈 PWA
  applicationName: "Chismólogo",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Chismólogo",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },

  openGraph: {
    type: "website",
    locale: "es_PE",
    url: "https://www.chismologo.online",
    siteName: "Chismólogo",
    title: "Chismólogo — Confesiones anónimas y contactos en Perú",
    description:
      "Confiesa tus secretos, encuentra pareja o amigos, y chatea en tiempo real. Todo en un lugar seguro.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Chismólogo — Aquí todo se sabe",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Chismólogo — Confesiones anónimas y contactos",
    description:
      "Confiesa tus secretos, encuentra pareja o amigos, y chatea en tiempo real.",
    images: ["/og-image.png"],
  },

  // 👈 PWA: íconos completos (svg + PNG 192/512)
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

// 👈 PWA: viewport (requerido en Next.js 14+)
export const viewport: Viewport = {
  themeColor: "#8B5CF6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Script de tema existente — SIN TOCAR */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var tema = localStorage.getItem('tema');
                  if (tema === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />

        {/* 👈 PWA: fallbacks navegadores viejos */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#8B5CF6" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="Chismólogo" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="bg-fondo text-texto antialiased min-h-screen flex flex-col">
        {children}
        <PWAInstaller /> {/* 👈 PWA */}
      </body>
    </html>
  );
}