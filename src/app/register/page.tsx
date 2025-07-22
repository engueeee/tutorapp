import type { Metadata } from "next";
import RegisterPageClient from "./page-client";

export const metadata: Metadata = {
  title: "Inscription | TutorApp",
  description:
    "Créez votre compte TutorApp pour commencer votre parcours de tutorat. Inscrivez-vous en tant qu'étudiant ou tuteur.",
  keywords: "inscription, compte, étudiant, tuteur, TutorApp",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Inscription | TutorApp",
    description:
      "Créez votre compte TutorApp pour commencer votre parcours de tutorat. Inscrivez-vous en tant qu'étudiant ou tuteur.",
    type: "website",
    images: ["/logo.png"],
    siteName: "TutorApp",
    locale: "fr_FR",
  },
  twitter: {
    card: "summary",
    title: "Inscription | TutorApp",
    description:
      "Créez votre compte TutorApp pour commencer votre parcours de tutorat. Inscrivez-vous en tant qu'étudiant ou tuteur.",
    images: ["/logo.png"],
  },
};

export default function RegisterPage() {
  return <RegisterPageClient />;
}
