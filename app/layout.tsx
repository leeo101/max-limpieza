import type { Metadata, Viewport } from "next";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: new URL("https://www.maxlimpieza.com.ar"),
  title: "MAX Limpieza | Productos de Limpieza Premium",
  description: "Compra productos de limpieza de calidad al mejor precio. Detergentes, desengrasantes, perfuminas y accesorios para el hogar y la industria.",
  keywords: "artículos de limpieza, detergentes, desengrasantes, perfuminas, limpieza automotriz, lavandina, jabón líquido",
  authors: [{ name: "MAX Limpieza" }],
  manifest: "/manifest.json",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "MAX Limpieza | Tu Tienda Online de Confianza",
    description: "Encontrá los mejores productos de limpieza al mejor precio del mercado.",
    url: "https://www.maxlimpieza.com.ar",
    siteName: "MAX Limpieza",
    images: [
      {
        url: "/logo.png", // Reemplazar con una imagen específica tipo banner (1200x630) si dispones de ella
        width: 800,
        height: 600,
        alt: "Logo MAX Limpieza",
      },
    ],
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MAX Limpieza Premium",
    description: "Calidad y rendimiento en productos de limpieza.",
    images: ["/logo.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#0284c7", // Tailwind sky-600
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

import FloatingSupport from "@/components/FloatingSupport";
import ToastProvider from "@/components/ToastProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased scroll-smooth" suppressHydrationWarning>
        {children}
        <ToastProvider />
        <FloatingSupport />
      </body>
    </html>
  );
}
