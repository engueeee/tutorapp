import type { Metadata } from "next";
import TestAvatarsClient from "./page-client";

export const metadata: Metadata = {
  title: "Test Avatars | TutorApp",
  description: "Test page for student avatars and status badges",
  robots: {
    index: false,
    follow: false,
  },
};

export default function TestAvatars() {
  return <TestAvatarsClient />;
}
