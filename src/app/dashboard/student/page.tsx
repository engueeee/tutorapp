import type { Metadata } from "next";
import StudentDashboardClient from "./page-client";

export const metadata: Metadata = {
  title: "Tableau de bord Étudiant | TutorApp",
  description:
    "Accédez à vos cours, devoirs et informations de tuteur depuis votre tableau de bord étudiant. Consultez votre calendrier et suivez vos progrès.",
  keywords:
    "tableau de bord, étudiant, cours, devoirs, calendrier, tuteur, TutorApp",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Tableau de bord Étudiant | TutorApp",
    description:
      "Accédez à vos cours, devoirs et informations de tuteur depuis votre tableau de bord étudiant. Consultez votre calendrier et suivez vos progrès.",
    type: "website",
    images: ["/logo.png"],
    siteName: "TutorApp",
    locale: "fr_FR",
  },
  twitter: {
    card: "summary",
    title: "Tableau de bord Étudiant | TutorApp",
    description:
      "Accédez à vos cours, devoirs et informations de tuteur depuis votre tableau de bord étudiant. Consultez votre calendrier et suivez vos progrès.",
    images: ["/logo.png"],
  },
};

export default function StudentDashboard() {
  return <StudentDashboardClient />;
}
