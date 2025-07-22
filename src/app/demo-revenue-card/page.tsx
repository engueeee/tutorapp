import type { Metadata } from "next";
import DemoRevenueCardPageClient from "./page-client";

export const metadata: Metadata = {
  title: "Demo Revenue Card | TutorApp",
  description: "Demo page for the new RevenueCard component",
};

export default function DemoRevenueCardPage() {
  return <DemoRevenueCardPageClient />;
}
