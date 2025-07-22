"use client";

import { Card } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

function formatCurrency(value: number) {
  return value.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

function formatMonth(dateString: string) {
  const date = parseISO(dateString);
  return format(date, "MMM", { locale: fr });
}

interface RevenueHistogramProps {
  data: any[];
  title: string;
  subtitle: string;
  className?: string;
}

export function RevenueHistogram({
  data,
  title,
  subtitle,
  className = "",
}: RevenueHistogramProps) {
  // Transform data into monthly histogram with proper aggregation
  const monthlyAggregation: Record<string, number> = {};

  // Aggregate revenue by month
  data.forEach((item) => {
    const monthKey = item.fullDate.substring(0, 7); // Get YYYY-MM part
    monthlyAggregation[monthKey] =
      (monthlyAggregation[monthKey] || 0) + (item.revenue || item.value || 0);
  });

  // Convert to chart format
  const chartData = Object.entries(monthlyAggregation)
    .map(([monthKey, revenue]) => ({
      month: formatMonth(monthKey + "-01"), // Add day to make it a valid date
      revenue: revenue,
      fullDate: monthKey,
    }))
    .sort(
      (a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime()
    );

  return (
    <Card className={`p-6 bg-white border-[#dfb529] ${className}`}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-[#050f8b] mb-2">{title}</h3>
        <p className="text-sm text-gray-600">{subtitle}</p>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="month"
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatCurrency(value).replace("€", "")}
            />
            <Tooltip
              formatter={(value: number) => [formatCurrency(value), "Revenu"]}
              labelFormatter={(label) => `Mois: ${label}`}
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
            />
            <Bar dataKey="revenue" fill="#dfb529" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
