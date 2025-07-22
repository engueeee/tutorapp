"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

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

export default function TestRevenuePageClient() {
  const [filter, setFilter] = useState("month");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testRevenue = async () => {
    setLoading(true);
    setError(null);

    // Use a test tutor ID - you'll need to replace this with a real tutor ID from your database
    const testTutorId = "test-tutor-id"; // Replace with actual tutor ID

    try {
      const response = await fetch(
        `/api/revenue?tutorId=${testTutorId}&range=${filter}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-[#050f8b] mb-6">
        Test Revenue Calculations
      </h1>

      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Test Configuration</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Time Range:</label>
          <Tabs value={filter} onValueChange={setFilter} className="w-full">
            <TabsList className="bg-[#dfb529]/10">
              {FILTERS.map((f) => (
                <TabsTrigger key={f.value} value={f.value}>
                  {f.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <Button
          onClick={testRevenue}
          disabled={loading}
          className="bg-[#050f8b] hover:bg-[#0a1f9b]"
        >
          {loading ? "Testing..." : "Test Revenue API"}
        </Button>
      </Card>

      {error && (
        <Card className="p-6 mb-6 border-red-200 bg-red-50">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
          <p className="text-red-700">{error}</p>
          <p className="text-sm text-red-600 mt-2">
            Note: Make sure you have a valid tutor ID and lessons in the
            database.
          </p>
        </Card>
      )}

      {data && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Revenue Results</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-[#050f8b] mb-2">Key Metrics</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Revenue:</span>
                  <span className="font-semibold">
                    {formatCurrency(data.totalRevenue)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Average Hourly Rate:</span>
                  <span className="font-semibold">
                    {formatCurrency(data.averageHourlyRate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Lessons Completed:</span>
                  <span className="font-semibold">{data.lessonsCompleted}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Projected Revenue:</span>
                  <span className="font-semibold">
                    {formatCurrency(data.projectedRevenue)}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-[#050f8b] mb-2">
                Revenue by Period
              </h3>
              <div className="max-h-64 overflow-y-auto">
                {Object.entries(data.revenueByPeriod || {}).map(
                  ([date, revenue]) => (
                    <div
                      key={date}
                      className="flex justify-between py-1 border-b border-gray-100"
                    >
                      <span className="text-sm text-gray-600">{date}</span>
                      <span className="text-sm font-medium">
                        {formatCurrency(revenue as number)}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-[#050f8b] mb-2">Raw Data</h3>
            <pre className="text-xs overflow-x-auto">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        </Card>
      )}
    </div>
  );
}
