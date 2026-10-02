import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Compritas Bonitas | POS & Control de Inventario",
  description: "Sistema POS boutique profesional para Compritas Bonitas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="font-sans antialiased fixed inset-0 flex flex-col overflow-hidden bg-cream">{children}</body>
    </html>
  );
}
