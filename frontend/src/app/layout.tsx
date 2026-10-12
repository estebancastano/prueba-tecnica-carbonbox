import type { Metadata } from "next";
import { Layout } from "@/shared/components/Layout";
import { QueryProvider } from "@/shared/components/QueryProvider";
import "./../styles/globals.css";

export const metadata: Metadata = {
  title: "carbonBox · Procesamiento de documentos",
  description: "Carga, procesa y consulta tus archivos CSV."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="font-sans antialiased">
        <QueryProvider>
          <Layout>{children}</Layout>
        </QueryProvider>
      </body>
    </html>
  );
}
