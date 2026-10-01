import type { Metadata, Viewport } from "next";
import "./globals.css";
import PWAInstaller from "@/components/PWAInstaller";

const BASE_URL = "https://www.chismologo.online";

export const metadata: Metadata = {
  // ============ TITLE & DESCRIPTION ============
  title: {
    default: "El Chismólogo — Confesiones anónimas y contactos en Perú",
    template: "%s | El Chismólogo",
  },
  description:
    "Publica confesiones anónimas, encuentra amigos o pareja y chatea en tiempo real en Perú. Comunidad segura, moderada y gratis. Aquí todo se sabe 👀",

  // ============ KEYWORDS (SEO) ============
  keywords: [
    // Principales
    "confesiones anónimas",
    "confesiones anónimas perú",
    "confesar secretos online",
    "chismes anónimos",
    "chismologo",
    "el chismólogo",
    // Contactos / Social
    "buscar pareja perú",
    "buscar amigos perú",
    "conocer gente perú",
    "anuncios para conocer gente",
    "contactos perú",
    "red social perú",
    // Chat
    "chatear online",
    "chat anónimo",
    "mensajes en tiempo real",
    // Ciudades
    "confesiones lima",
    "confesiones trujillo",
    "confesiones arequipa",
    "confesiones cusco",
    "confesiones piura",
    "confesiones chiclayo",
    "confesiones perú",
    // Long-tail
    "donde confesar secretos anónimos",
    "publicar confesiones sin registro",
    "app para confesar secretos",
    "hacer amigos en perú online",
    "encontrar pareja en perú gratis",
  ],

  // ============ AUTORÍA ============
  authors: [{ name: "El Chismólogo", url: BASE_URL }],
  creator: "El Chismólogo",
  publisher: "El Chismólogo",
  category: "Social",

  // ============ BASE URL ============
  metadataBase: new URL(BASE_URL),
  alternates: {
    canonical: BASE_URL,
    languages: {
      "es-PE": BASE_URL,
      "es": BASE_URL,
    },
  },

  // ============ VERIFICACIÓN (Search Console) ============
  // Reemplaza los valores cuando los tengas
  verification: {
    // google: "TU_CODIGO_DE_GOOGLE_AQUI",
    // bing: "TU_CODIGO_DE_BING_AQUI",
    // yandex: "TU_CODIGO_DE_YANDEX_AQUI",
  },

  // ============ PWA ============
  applicationName: "El Chismólogo",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "El Chismólogo",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },

  // ============ OPEN GRAPH (WhatsApp, Facebook, LinkedIn) ============
  openGraph: {
    type: "website",
    locale: "es_PE",
    alternateLocale: ["es_AR", "es_MX", "es_CO", "es_CL"],
    url: BASE_URL,
    siteName: "El Chismólogo",
    title: "El Chismólogo — Confesiones anónimas y contactos en Perú",
    description:
      "Confiesa tus secretos, encuentra pareja o amigos y chatea en tiempo real. Comunidad segura y moderada. 👀",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "El Chismólogo — Aquí todo se sabe 👀",
        type: "image/png",
      },
    ],
  },

  // ============ TWITTER CARDS ============
  twitter: {
    card: "summary_large_image",
    site: "@chismologo",
    creator: "@chismologo",
    title: "El Chismólogo — Confesiones anónimas y contactos",
    description:
      "Confiesa tus secretos, encuentra pareja o amigos y chatea en tiempo real. 👀",
    images: ["/og-image.png"],
  },

  // ============ ICONS ============
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

  // ============ ROBOTS ============
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

// ============ VIEWPORT (PWA) ============
export const viewport: Viewport = {
  themeColor: "#38BDF8", // ✅ CAMBIADO a celeste
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  colorScheme: "light dark",
};

// ============ JSON-LD (Schema.org) ============
// Esto hace que Google muestre tu sitio con información enriquecida
const jsonLdWebSite = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "El Chismólogo",
  alternateName: "Chismólogo Online",
  url: BASE_URL,
  description:
    "Confesiones anónimas, contactos y chat en tiempo real en Perú.",
  inLanguage: "es-PE",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${BASE_URL}/confesiones?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

const jsonLdOrganization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "El Chismólogo",
  url: BASE_URL,
  logo: {
    "@type": "ImageObject",
    url: `${BASE_URL}/icons/icon-512.png`,
    width: 512,
    height: 512,
  },
  sameAs: [
    // Añade aquí tus redes sociales cuando las tengas:
    // "https://www.instagram.com/chismologo",
    // "https://www.tiktok.com/@chismologo",
  ],
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

        {/* JSON-LD Schema.org para Google */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebSite) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLdOrganization),
          }}
        />

        {/* PWA fallbacks */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#38BDF8" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="El Chismólogo" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />

        {/* Geo tags (Perú) */}
        <meta name="geo.region" content="PE" />
        <meta name="geo.placename" content="Perú" />

        {/* Language */}
        <meta httpEquiv="content-language" content="es-PE" />
      </head>
      <body className="bg-fondo text-texto antialiased min-h-screen flex flex-col">
        {children}
        <PWAInstaller />
      </body>
    </html>
  );
}