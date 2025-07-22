import type { Metadata } from "next";
import TestRevenuePageClient from "./page-client";

export const metadata: Metadata = {
  title: "Test Revenue | TutorApp",
  description: "Test page for revenue calculations",
};

export default function TestRevenuePage() {
  return <TestRevenuePageClient />;
}
