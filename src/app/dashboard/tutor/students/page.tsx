import type { Metadata } from "next";
import TutorStudentsPageClient from "./page-client";

export const metadata: Metadata = {
  title: "Gestion des Étudiants | TutorApp",
  description:
    "Gérez votre liste d'étudiants, ajoutez de nouveaux élèves et suivez leurs progrès. Consultez les informations détaillées de chaque étudiant.",
  keywords: "étudiants, gestion, tuteur, cours, TutorApp",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Gestion des Étudiants | TutorApp",
    description:
      "Gérez votre liste d'étudiants, ajoutez de nouveaux élèves et suivez leurs progrès. Consultez les informations détaillées de chaque étudiant.",
    type: "website",
    images: ["/logo.png"],
    siteName: "TutorApp",
    locale: "fr_FR",
  },
  twitter: {
    card: "summary",
    title: "Gestion des Étudiants | TutorApp",
    description:
      "Gérez votre liste d'étudiants, ajoutez de nouveaux élèves et suivez leurs progrès. Consultez les informations détaillées de chaque étudiant.",
    images: ["/logo.png"],
  },
};

export default function TutorStudentsPage() {
  return <TutorStudentsPageClient />;
}
