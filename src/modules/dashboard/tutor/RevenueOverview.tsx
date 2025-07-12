"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { TrendingUp, DollarSign, Clock, Calendar } from "lucide-react";
import Link from "next/link";

function formatCurrency(value: number) {
  return value.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

export function RevenueOverview() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!user || user.role !== "tutor") return;
    setLoading(true);
    fetch(`/api/revenue?tutorId=${user.id}&range=month`)
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) {
    return (
      <Card className="p-6 bg-white border-[#dfb529]">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="h-16 bg-gray-200 rounded"></div>
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
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-[#050f8b] flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Aperçu des revenus
        </h2>
        <Link
          href="/dashboard/tutor/revenue"
          className="text-sm text-[#050f8b] hover:underline"
        >
          Voir plus →
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <DollarSign className="h-4 w-4 text-[#dfb529]" />
          </div>
          <div className="text-sm text-gray-500">Revenu total</div>
          <div className="text-lg font-bold text-[#050f8b]">
            {formatCurrency(data?.totalRevenue || 0)}
          </div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Clock className="h-4 w-4 text-[#dfb529]" />
          </div>
          <div className="text-sm text-gray-500">Taux moyen</div>
          <div className="text-lg font-bold text-[#050f8b]">
            {formatCurrency(data?.averageHourlyRate || 0)}
          </div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Calendar className="h-4 w-4 text-[#dfb529]" />
          </div>
          <div className="text-sm text-gray-500">Leçons terminées</div>
          <div className="text-lg font-bold text-[#050f8b]">
            {data?.lessonsCompleted || 0}
          </div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <TrendingUp className="h-4 w-4 text-[#dfb529]" />
          </div>
          <div className="text-sm text-gray-500">Revenu projeté</div>
          <div className="text-lg font-bold text-[#050f8b]">
            {formatCurrency(data?.projectedRevenue || 0)}
          </div>
        </div>
      </div>
    </Card>
  );
}
