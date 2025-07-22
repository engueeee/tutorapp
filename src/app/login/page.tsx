import type { Metadata } from "next";
import LoginPageClient from "./page-client";

export const metadata: Metadata = {
  title: "Connexion | TutorApp",
  description:
    "Connectez-vous à votre compte TutorApp pour accéder à votre tableau de bord et gérer vos cours.",
  keywords: "connexion, login, compte, TutorApp",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Connexion | TutorApp",
    description:
      "Connectez-vous à votre compte TutorApp pour accéder à votre tableau de bord et gérer vos cours.",
    type: "website",
    images: ["/logo.png"],
    siteName: "TutorApp",
    locale: "fr_FR",
  },
  twitter: {
    card: "summary",
    title: "Connexion | TutorApp",
    description:
      "Connectez-vous à votre compte TutorApp pour accéder à votre tableau de bord et gérer vos cours.",
    images: ["/logo.png"],
  },
};

export default function LoginPage() {
  return <LoginPageClient />;
}
