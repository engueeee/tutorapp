import type { Metadata } from "next";
import RevenueDashboardPageClient from "./page-client";

export const metadata: Metadata = {
  title: "Revenus | TutorApp",
  description:
    "Suivez vos revenus, analysez vos performances et planifiez votre activité de tutorat. Consultez les tendances et projections de vos revenus.",
  keywords:
    "revenus, finances, tutorat, performances, tendances, projections, TutorApp",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Revenus | TutorApp",
    description:
      "Suivez vos revenus, analysez vos performances et planifiez votre activité de tutorat. Consultez les tendances et projections de vos revenus.",
    type: "website",
    images: ["/logo.png"],
    siteName: "TutorApp",
    locale: "fr_FR",
  },
  twitter: {
    card: "summary",
    title: "Revenus | TutorApp",
    description:
      "Suivez vos revenus, analysez vos performances et planifiez votre activité de tutorat. Consultez les tendances et projections de vos revenus.",
    images: ["/logo.png"],
  },
};

export default function RevenueDashboardPage() {
  return <RevenueDashboardPageClient />;
}
