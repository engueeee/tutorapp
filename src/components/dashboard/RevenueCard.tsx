"use client";

import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

interface RevenueCardProps {
  monthlyRevenue: number;
  weeklyRevenue: number;
  monthlyGrowthPercentage: number;
  weeklyGrowthPercentage: number;
  monthlyData: Array<{ date: string; revenue: number }>;
  weeklyData: Array<{ date: string; revenue: number }>;
  title?: string;
  currency?: string;
}

function formatCurrency(value: number, currency: string = "EUR") {
  return value.toLocaleString("fr-FR", {
    style: "currency",
    currency: currency,
  });
}

export function RevenueCard({
  monthlyRevenue,
  weeklyRevenue,
  monthlyGrowthPercentage,
  weeklyGrowthPercentage,
  monthlyData,
  weeklyData,
  title = "Total Revenue",
  currency = "EUR",
}: RevenueCardProps) {
  const [viewMode, setViewMode] = useState<"month" | "week">("month");
  const [mounted, setMounted] = useState(false);
  const currentGrowthPercentage =
    viewMode === "week" ? weeklyGrowthPercentage : monthlyGrowthPercentage;
  const isPositiveGrowth = currentGrowthPercentage >= 0;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Card className="p-6 bg-white border-[#dfb529]">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-white border-[#dfb529]">
      {/* Header with Toggle */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <div className="flex gap-1">
          <Button
            variant={viewMode === "week" ? "secondary" : "outline"}
            size="sm"
            onClick={() => setViewMode("week")}
            className="text-xs h-7 px-2"
          >
            Semaine
          </Button>
          <Button
            variant={viewMode === "month" ? "secondary" : "outline"}
            size="sm"
            onClick={() => setViewMode("month")}
            className="text-xs h-7 px-2"
          >
            Mois
          </Button>
        </div>
      </div>

      {/* Revenue and Growth */}
      <div className="mb-6">
        <div className="text-3xl font-bold text-[#050f8b] mb-2">
          {formatCurrency(
            viewMode === "week" ? weeklyRevenue : monthlyRevenue,
            currency
          )}
        </div>
        <div className="flex items-center gap-2">
          {isPositiveGrowth ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
          <span
            className={`text-sm font-medium ${
              isPositiveGrowth ? "text-green-600" : "text-red-600"
            }`}
          >
            {isPositiveGrowth ? "+" : ""}
            {currentGrowthPercentage.toFixed(1)}% from last{" "}
            {viewMode === "week" ? "week" : "month"}
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={viewMode === "week" ? weeklyData : monthlyData}
            margin={{ top: 5, right: 5, left: 5, bottom: 20 }}
          >
            <XAxis
              dataKey="date"
              stroke="#6b7280"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10 }}
            />
            <YAxis
              stroke="#6b7280"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) =>
                formatCurrency(value, currency).replace("€", "")
              }
              tick={{ fontSize: 10 }}
            />
            <Tooltip
              formatter={(value: number) => [
                formatCurrency(value, currency),
                "Revenue",
              ]}
              labelFormatter={(label) => `Date: ${label}`}
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "6px",
                fontSize: "12px",
              }}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#050f8b"
              strokeWidth={2}
              dot={{
                r: 3,
                fill: "#dfb529",
                stroke: "#050f8b",
                strokeWidth: 1,
              }}
              activeDot={{
                r: 4,
                fill: "#dfb529",
                stroke: "#050f8b",
                strokeWidth: 2,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
