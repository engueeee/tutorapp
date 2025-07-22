import type { Metadata } from "next";
import TutorDashboardPageClient from "./page-client";

export const metadata: Metadata = {
  title: "Tableau de bord Tuteur | TutorApp",
  description:
    "Gérez vos cours, étudiants et revenus depuis votre tableau de bord tuteur. Planifiez vos leçons et suivez vos performances.",
  keywords: "tableau de bord, tuteur, cours, étudiants, revenus, TutorApp",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Tableau de bord Tuteur | TutorApp",
    description:
      "Gérez vos cours, étudiants et revenus depuis votre tableau de bord tuteur. Planifiez vos leçons et suivez vos performances.",
    type: "website",
    images: ["/logo.png"],
    siteName: "TutorApp",
    locale: "fr_FR",
  },
  twitter: {
    card: "summary",
    title: "Tableau de bord Tuteur | TutorApp",
    description:
      "Gérez vos cours, étudiants et revenus depuis votre tableau de bord tuteur. Planifiez vos leçons et suivez vos performances.",
    images: ["/logo.png"],
  },
};

export default function TutorDashboardPage() {
  return <TutorDashboardPageClient />;
}
