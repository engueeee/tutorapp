"use client";

import { RevenueCard } from "@/components/dashboard/RevenueCard";

// Sample data for demonstration
const sampleChartData = [
  { date: "Jan", revenue: 1200 },
  { date: "Feb", revenue: 1800 },
  { date: "Mar", revenue: 1500 },
  { date: "Apr", revenue: 2200 },
  { date: "May", revenue: 2800 },
  { date: "Jun", revenue: 3200 },
];

const negativeGrowthData = [
  { date: "Jan", revenue: 3200 },
  { date: "Feb", revenue: 2800 },
  { date: "Mar", revenue: 2500 },
  { date: "Apr", revenue: 2200 },
  { date: "May", revenue: 1800 },
  { date: "Jun", revenue: 1500 },
];

export default function DemoRevenueCardPageClient() {
  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-[#050f8b] mb-6">
        Revenue Card Demo
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Positive Growth */}
        <RevenueCard
          totalRevenue={15231.89}
          growthPercentage={20.1}
          chartData={sampleChartData}
          title="Total Revenue"
          currency="EUR"
        />

        {/* Negative Growth */}
        <RevenueCard
          totalRevenue={8750.5}
          growthPercentage={-12.5}
          chartData={negativeGrowthData}
          title="Monthly Revenue"
          currency="EUR"
        />

        {/* Zero Growth */}
        <RevenueCard
          totalRevenue={12345.67}
          growthPercentage={0}
          chartData={sampleChartData}
          title="Quarterly Revenue"
          currency="EUR"
        />

        {/* USD Example */}
        <RevenueCard
          totalRevenue={18999.99}
          growthPercentage={35.7}
          chartData={sampleChartData}
          title="USD Revenue"
          currency="USD"
        />

        {/* Large Number */}
        <RevenueCard
          totalRevenue={125000.0}
          growthPercentage={8.3}
          chartData={sampleChartData}
          title="Annual Revenue"
          currency="EUR"
        />

        {/* Small Number */}
        <RevenueCard
          totalRevenue={1250.75}
          growthPercentage={-5.2}
          chartData={negativeGrowthData}
          title="Weekly Revenue"
          currency="EUR"
        />
      </div>

      <div className="mt-8 p-6 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold text-[#050f8b] mb-4">Features</h2>
        <ul className="space-y-2 text-gray-700">
          <li>• Large, prominent revenue number display</li>
          <li>
            • Growth percentage indicator with color coding (green for positive,
            red for negative)
          </li>
          <li>• Smooth line chart showing revenue evolution</li>
          <li>• Responsive design that works on all screen sizes</li>
          <li>• Customizable title and currency</li>
          <li>• Interactive tooltips on chart hover</li>
          <li>• Project color scheme integration</li>
        </ul>
      </div>
    </div>
  );
}
