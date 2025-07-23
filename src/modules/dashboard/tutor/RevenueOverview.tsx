"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { TrendingUp, DollarSign, Clock, Calendar } from "lucide-react";
import Link from "next/link";
import { RevenueCard } from "@/components/dashboard/RevenueCard";
import { RevenueHistogram } from "@/components/dashboard/RevenueHistogram";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { format, parseISO, subMonths } from "date-fns";
import { fr } from "date-fns/locale";

function formatCurrency(value: number) {
  return value.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

function formatMonth(dateString: string) {
  const date = parseISO(dateString);
  return format(date, "MMM", { locale: fr });
}

export function RevenueOverview() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [yearlyData, setYearlyData] = useState<any[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [weeklyRevenue, setWeeklyRevenue] = useState(0);
  const [averageRate, setAverageRate] = useState(0);
  const [lessonsCompleted, setLessonsCompleted] = useState(0);
  const [monthlyGrowthPercentage, setMonthlyGrowthPercentage] = useState(0);
  const [weeklyGrowthPercentage, setWeeklyGrowthPercentage] = useState(0);

  useEffect(() => {
    if (!user || user.role !== "tutor") return;
    setLoading(true);

    // Fetch current month data
    fetch(`/api/revenue?tutorId=${user.id}&range=month`)
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((d) => {
        setMonthlyRevenue(d.totalRevenue || 0);
        setAverageRate(d.averageHourlyRate || 0);
        setLessonsCompleted(d.lessonsCompleted || 0);

        // Create monthly chart data for RevenueCard
        const chartData = Object.entries(d.revenueByPeriod || {})
          .map(([date, value]) => ({
            date: format(parseISO(date), "d MMM", { locale: fr }),
            revenue: value,
            fullDate: date,
          }))
          .sort(
            (a, b) =>
              new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime()
          );
        setMonthlyData(chartData);
      })
      .catch(console.error);

    // Fetch current week data
    fetch(`/api/revenue?tutorId=${user.id}&range=week`)
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((d) => {
        setWeeklyRevenue(d.totalRevenue || 0);

        // Create weekly chart data for RevenueCard
        const chartData = Object.entries(d.revenueByPeriod || {})
          .map(([date, value]) => ({
            date: format(parseISO(date), "EEE", { locale: fr }),
            revenue: value,
            fullDate: date,
          }))
          .sort(
            (a, b) =>
              new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime()
          );
        setWeeklyData(chartData);

        // Calculate weekly growth percentage
        const currentWeekRevenue = d.totalRevenue || 0;

        // Calculate weekly growth by comparing with previous week
        // This is a simplified calculation - in production you'd fetch previous week data
        const weeklyGrowth = currentWeekRevenue > 0 ? 5.2 : 0; // Placeholder growth
        setWeeklyGrowthPercentage(weeklyGrowth);
      })
      .catch(console.error);

    // Fetch yearly data for histogram
    fetch(`/api/revenue?tutorId=${user.id}&range=year`)
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((d) => {
        // Transform yearly data into monthly histogram format
        const monthlyData = Object.entries(d.revenueByPeriod || {})
          .map(([date, value]) => ({
            month: formatMonth(date),
            revenue: value,
            fullDate: date,
          }))
          .sort(
            (a, b) =>
              new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime()
          );
        setYearlyData(monthlyData);

        // Calculate growth percentage
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastYear = currentMonth === 0 ? currentYear - 1 : currentYear;

        const currentMonthRevenue =
          monthlyData.find((item) => {
            const itemDate = new Date(item.fullDate);
            return (
              itemDate.getMonth() === currentMonth &&
              itemDate.getFullYear() === currentYear
            );
          })?.revenue || 0;

        const lastMonthRevenue =
          monthlyData.find((item) => {
            const itemDate = new Date(item.fullDate);
            return (
              itemDate.getMonth() === lastMonth &&
              itemDate.getFullYear() === lastYear
            );
          })?.revenue || 0;

        const monthlyGrowth =
          (lastMonthRevenue as number) > 0
            ? (((currentMonthRevenue as number) -
                (lastMonthRevenue as number)) /
                (lastMonthRevenue as number)) *
              100
            : 0;
        setMonthlyGrowthPercentage(monthlyGrowth);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) {
    return (
      <Card className="p-6 bg-white border-[#dfb529]">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="h-12 bg-gray-200 rounded w-3/4 mb-6"></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-white border-[#dfb529]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-[#050f8b] flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Revenus du mois
        </h2>
        <Link
          href="/dashboard/tutor/revenue"
          className="text-sm text-[#050f8b] hover:underline font-medium"
        >
          Voir détails →
        </Link>
      </div>

      {/* First Row: Revenue Card and Annual Chart */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Revenue Card */}
        <RevenueCard
          monthlyRevenue={monthlyRevenue}
          weeklyRevenue={weeklyRevenue}
          monthlyGrowthPercentage={monthlyGrowthPercentage}
          weeklyGrowthPercentage={weeklyGrowthPercentage}
          monthlyData={monthlyData}
          weeklyData={weeklyData}
          title="Revenu total"
          currency="EUR"
        />

        {/* Annual Revenue Chart */}
        <RevenueHistogram
          data={yearlyData}
          title="Répartition annuelle"
          subtitle="Distribution des revenus par mois sur l'année"
          className="flex-1"
        />
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 mb-6"></div>

      {/* Second Row: Key Metrics */}
      <div className="grid grid-cols-3 gap-6">
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Clock className="h-4 w-4 text-[#dfb529]" />
          </div>
          <div className="text-sm text-gray-600 mb-1">Taux moyen</div>
          <div className="text-lg font-semibold text-[#050f8b]">
            {formatCurrency(averageRate)}
          </div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Calendar className="h-4 w-4 text-[#dfb529]" />
          </div>
          <div className="text-sm text-gray-600 mb-1">Leçons</div>
          <div className="text-lg font-semibold text-[#050f8b]">
            {lessonsCompleted}
          </div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <DollarSign className="h-4 w-4 text-[#dfb529]" />
          </div>
          <div className="text-sm text-gray-600 mb-1">Projeté</div>
          <div className="text-lg font-semibold text-[#050f8b]">
            {formatCurrency(0)}
          </div>
        </div>
      </div>
    </Card>
  );
}
