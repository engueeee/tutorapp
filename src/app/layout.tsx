// Fichier : /src/app/layout.tsx

import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TutorApp",
  description: "Plateforme de gestion de cours de tutorat",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <AuthProvider>{children}</AuthProvider>
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
