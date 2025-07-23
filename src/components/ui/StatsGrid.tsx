import { DataCard } from "./DataCard";
import { LucideIcon } from "lucide-react";

interface Stat {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

interface StatsGridProps {
  stats: Stat[];
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export function StatsGrid({ stats, columns = 3, className }: StatsGridProps) {
  const gridClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={`grid ${gridClasses[columns]} gap-4 ${className}`}>
      {stats.map((stat, index) => (
        <DataCard
          key={index}
          title={stat.title}
          value={stat.value}
          subtitle={stat.subtitle}
          icon={stat.icon}
          trend={stat.trend}
        />
      ))}
    </div>
  );
}
