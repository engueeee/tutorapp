"use client";

import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DatePicker } from "@/components/ui/datepicker";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const FILTERS = [
  { value: "day", label: "Jour" },
  { value: "week", label: "Semaine" },
  { value: "month", label: "Mois" },
  { value: "quarter", label: "Trimestre" },
  { value: "year", label: "Année" },
];

function formatCurrency(value: number) {
  return value.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

export default function RevenueDashboardPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState("month");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    if (!user || user.role !== "tutor") return;
    setLoading(true);
    setError(null);
    fetch(`/api/revenue?tutorId=${user.id}&range=${filter}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((d) => {
        setData(d);
        // Transform revenueByPeriod to array for recharts
        const arr = Object.entries(d.revenueByPeriod || {}).map(
          ([date, value]) => ({ date, value })
        );
        setChartData(arr);
      })
      .catch((err) => {
        setError(err.message || "Erreur lors du chargement des données");
      })
      .finally(() => setLoading(false));
  }, [user, filter]);

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6 text-[#050f8b]">Revenus</h1>
      <Tabs value={filter} onValueChange={setFilter} className="mb-6">
        <TabsList className="bg-[#dfb529]/10">
          {FILTERS.map((f) => (
            <TabsTrigger key={f.value} value={f.value}>
              {f.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      {loading ? (
        <div className="flex items-center justify-center h-40">
          Chargement...
        </div>
      ) : error ? (
        <div className="text-red-500 text-center mb-4">{error}</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="p-4 bg-white border-[#dfb529]">
              <div className="text-sm text-gray-500">Revenu total</div>
              <div className="text-2xl font-bold text-[#050f8b]">
                {formatCurrency(data?.totalRevenue || 0)}
              </div>
            </Card>
            <Card className="p-4 bg-white border-[#dfb529]">
              <div className="text-sm text-gray-500">Taux horaire moyen</div>
              <div className="text-2xl font-bold text-[#050f8b]">
                {formatCurrency(data?.averageHourlyRate || 0)}
              </div>
            </Card>
            <Card className="p-4 bg-white border-[#dfb529]">
              <div className="text-sm text-gray-500">Leçons terminées</div>
              <div className="text-2xl font-bold text-[#050f8b]">
                {data?.lessonsCompleted || 0}
              </div>
            </Card>
          </div>
          <Card className="p-6 bg-white border-[#dfb529]">
            <div className="mb-4 flex items-center justify-between">
              <div className="font-semibold text-[#050f8b]">
                Tendance des revenus
              </div>
              <DatePicker />
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" stroke="#050f8b" />
                  <YAxis stroke="#050f8b" tickFormatter={formatCurrency} />
                  <Tooltip
                    formatter={formatCurrency}
                    labelFormatter={(l) => `Date: ${l}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#050f8b"
                    strokeWidth={2}
                    dot={{ r: 3, fill: "#dfb529" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              Revenu projeté (leçons à venir) :{" "}
              <span className="font-bold text-[#dfb529]">
                {formatCurrency(data?.projectedRevenue || 0)}
              </span>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
