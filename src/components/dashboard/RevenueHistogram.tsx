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
import { useMemo, memo } from "react";

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

export const RevenueHistogram = memo(function RevenueHistogram({
  data,
  title,
  subtitle,
  className = "",
}: RevenueHistogramProps) {
  // Memoize chart data to prevent unnecessary recalculations
  const chartData = useMemo(
    () =>
      data.map((item) => ({
        month: item.month,
        revenue: item.revenue,
        fullDate: item.fullDate,
      })),
    [data]
  );

  return (
    <Card className={`p-6 bg-white border-[#dfb529] ${className}`}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-[#050f8b] mb-2">{title}</h3>
        <p className="text-sm text-gray-600">{subtitle}</p>
      </div>

      <div className="h-64">
        <ResponsiveContainer
          width="100%"
          height="100%"
          key={`histogram-${chartData.length}`}
        >
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
});
