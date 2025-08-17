"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { LoadingUI } from "@/components/ui/LoadingUI";
import { useAuth } from "@/context/AuthContext";
import {
  TrendingUp,
  DollarSign,
  Clock,
  Calendar,
  FileText,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { RevenueCard } from "@/components/dashboard/RevenueCard";
import { RevenueHistogram } from "@/components/dashboard/RevenueHistogram";
import { Button } from "@/components/ui/button";
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
  const [refreshing, setRefreshing] = useState(false);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [yearlyData, setYearlyData] = useState<any[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [weeklyRevenue, setWeeklyRevenue] = useState(0);
  const [averageRate, setAverageRate] = useState(0);
  const [lessonsCompleted, setLessonsCompleted] = useState(0);
  const [projectedRevenue, setProjectedRevenue] = useState(0);
  const [monthlyGrowthPercentage, setMonthlyGrowthPercentage] = useState(0);
  const [weeklyGrowthPercentage, setWeeklyGrowthPercentage] = useState(0);

  // Memoize the user ID to prevent unnecessary re-fetches
  const tutorId = useMemo(() => user?.id, [user?.id]);

  // Fetch static data (yearly histogram, average rate) - only once
  const fetchStaticData = useCallback(async () => {
    if (!tutorId || user?.role !== "tutor") return;

    try {
      // Fetch yearly data for histogram (static - doesn't change with time period)
      const yearlyResponse = await fetch(
        `/api/revenue?tutorId=${tutorId}&range=year`
      );
      if (!yearlyResponse.ok) throw new Error(await yearlyResponse.text());
      const yearlyResult = await yearlyResponse.json();

      // Transform yearly data into monthly histogram format
      const monthlyData = Object.entries(yearlyResult.revenueByPeriod || {})
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

      // Calculate growth percentage from yearly data
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
          ? (((currentMonthRevenue as number) - (lastMonthRevenue as number)) /
              (lastMonthRevenue as number)) *
            100
          : 0;
      setMonthlyGrowthPercentage(monthlyGrowth);
    } catch (error) {
      console.error("Error fetching static data:", error);
    }
  }, [tutorId, user?.role]);

  // Fetch dynamic data (weekly/monthly revenue) - can be refreshed when needed
  const fetchDynamicData = useCallback(
    async (showRefreshing = false) => {
      if (!tutorId || user?.role !== "tutor") return;

      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        // Fetch current month data
        const monthlyResponse = await fetch(
          `/api/revenue?tutorId=${tutorId}&range=month`
        );
        if (!monthlyResponse.ok) throw new Error(await monthlyResponse.text());
        const monthlyResult = await monthlyResponse.json();

        setMonthlyRevenue(monthlyResult.totalRevenue || 0);
        setAverageRate(monthlyResult.averageHourlyRate || 0);
        setLessonsCompleted(monthlyResult.lessonsCompleted || 0);

        // Calculate projected revenue from future lessons
        const today = new Date();
        const todayString = today.toISOString().split("T")[0];
        let projected = 0;

        if (monthlyResult.lessonDetails) {
          monthlyResult.lessonDetails.forEach((lesson: any) => {
            if (lesson.date > todayString) {
              projected += lesson.revenue || 0;
            }
          });
        }
        setProjectedRevenue(projected);

        // Create monthly chart data for RevenueCard
        const chartData = Object.entries(monthlyResult.revenueByPeriod || {})
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

        // Fetch current week data
        const weeklyResponse = await fetch(
          `/api/revenue?tutorId=${tutorId}&range=week`
        );
        if (!weeklyResponse.ok) throw new Error(await weeklyResponse.text());
        const weeklyResult = await weeklyResponse.json();

        setWeeklyRevenue(weeklyResult.totalRevenue || 0);

        // Create weekly chart data for RevenueCard
        const weeklyChartData = Object.entries(
          weeklyResult.revenueByPeriod || {}
        )
          .map(([date, value]) => ({
            date: format(parseISO(date), "EEE", { locale: fr }),
            revenue: value,
            fullDate: date,
          }))
          .sort(
            (a, b) =>
              new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime()
          );
        setWeeklyData(weeklyChartData);

        // Calculate weekly growth percentage
        const currentWeekRevenue = weeklyResult.totalRevenue || 0;
        const weeklyGrowth = currentWeekRevenue > 0 ? 5.2 : 0; // Placeholder growth
        setWeeklyGrowthPercentage(weeklyGrowth);
      } catch (error) {
        console.error("Error fetching dynamic data:", error);
      } finally {
        if (showRefreshing) {
          setRefreshing(false);
        } else {
          setLoading(false);
        }
      }
    },
    [tutorId, user?.role]
  );

  // Handle manual refresh
  const handleRefresh = useCallback(() => {
    fetchDynamicData(true);
  }, [fetchDynamicData]);

  // Fetch static data only once when component mounts or user changes
  useEffect(() => {
    fetchStaticData();
  }, [fetchStaticData]);

  // Fetch dynamic data when component mounts or user changes
  useEffect(() => {
    fetchDynamicData();
  }, [fetchDynamicData]);

  // Memoize the static metrics to prevent unnecessary re-renders
  const staticMetrics = useMemo(
    () => ({
      averageRate,
      lessonsCompleted,
      projectedRevenue,
    }),
    [averageRate, lessonsCompleted, projectedRevenue]
  );

  if (loading) {
    return <LoadingUI variant="revenue" />;
  }

  return (
    <Card className="p-6 bg-white border-secondary">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Vos revenus
        </h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="text-xs h-8 px-3"
          >
            <RefreshCw
              className={`h-3 w-3 mr-1 ${refreshing ? "animate-spin" : ""}`}
            />
            Actualiser
          </Button>
          <Link
            href="/dashboard/tutor/revenue"
            className="text-sm text-primary hover:underline font-medium"
          >
            Voir détails →
          </Link>
        </div>
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
      <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
        <FileText className="h-5 w-5" />
        Données du mois
      </h3>
      {/* Second Row: Key Metrics */}
      <div className="grid grid-cols-3 gap-6">
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Clock className="h-4 w-4 text-secondary" />
          </div>
          <div className="text-sm text-gray-600 mb-1">Taux moyen</div>
          <div className="text-lg font-semibold text-primary">
            {formatCurrency(staticMetrics.averageRate)}
          </div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Calendar className="h-4 w-4 text-[#dfb529]" />
          </div>
          <div className="text-sm text-gray-600 mb-1">Leçons</div>
          <div className="text-lg font-semibold text-[#050f8b]">
            {staticMetrics.lessonsCompleted}
          </div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <DollarSign className="h-4 w-4 text-[#dfb529]" />
          </div>
          <div className="text-sm text-gray-600 mb-1">Projeté</div>
          <div className="text-lg font-semibold text-[#050f8b]">
            {formatCurrency(staticMetrics.projectedRevenue)}
          </div>
        </div>
      </div>
    </Card>
  );
}
