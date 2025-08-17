"use client";

import { useEffect, useState } from "react";

interface PerformanceMonitorProps {
  name: string;
  onLoadComplete?: (duration: number) => void;
}

export function PerformanceMonitor({
  name,
  onLoadComplete,
}: PerformanceMonitorProps) {
  const [startTime] = useState(Date.now());
  const [loadTime, setLoadTime] = useState<number | null>(null);

  useEffect(() => {
    const endTime = Date.now();
    const duration = endTime - startTime;
    setLoadTime(duration);

    console.log(`🚀 ${name} loaded in ${duration}ms`);

    if (onLoadComplete) {
      onLoadComplete(duration);
    }

    // Log performance warning if loading takes too long
    if (duration > 2000) {
      console.warn(`⚠️ ${name} took ${duration}ms to load (slow)`);
    }
  }, [name, startTime, onLoadComplete]);

  // Only show in development
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white px-3 py-1 rounded text-xs z-50">
      {name}: {loadTime ? `${loadTime}ms` : "loading..."}
    </div>
  );
}
