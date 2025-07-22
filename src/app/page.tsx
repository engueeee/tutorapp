import type { Metadata } from "next";
import HomePageClient from "./page-client";

export const metadata: Metadata = {
  title: "Accueil | TutorApp",
  description:
    "TutorApp - La plateforme de tutorat qui connecte étudiants et tuteurs. Trouvez votre tuteur idéal ou proposez vos services de tutorat.",
  keywords:
    "tutorat, cours particuliers, soutien scolaire, étudiants, tuteurs, TutorApp",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Accueil | TutorApp",
    description:
      "TutorApp - La plateforme de tutorat qui connecte étudiants et tuteurs. Trouvez votre tuteur idéal ou proposez vos services de tutorat.",
    type: "website",
    images: ["/logo.png"],
    siteName: "TutorApp",
    locale: "fr_FR",
  },
  twitter: {
    card: "summary",
    title: "Accueil | TutorApp",
    description:
      "TutorApp - La plateforme de tutorat qui connecte étudiants et tuteurs. Trouvez votre tuteur idéal ou proposez vos services de tutorat.",
    images: ["/logo.png"],
  },
  alternates: {
    canonical: "https://tutorapp.com",
  },
};

export default function HomePage() {
  return <HomePageClient />;
}
