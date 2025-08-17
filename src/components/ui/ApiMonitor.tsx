"use client";

import { useState, useEffect } from "react";
import { dataManager } from "@/lib/dataManager";

interface ApiStats {
  cacheSize: number;
  cacheKeys: string[];
  pendingRequests: number;
}

export function ApiMonitor() {
  const [stats, setStats] = useState<ApiStats>({
    cacheSize: 0,
    cacheKeys: [],
    pendingRequests: 0,
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateStats = () => {
      const cacheStats = dataManager.getCacheStats();
      setStats({
        cacheSize: cacheStats.size,
        cacheKeys: cacheStats.keys,
        pendingRequests: (dataManager as any).pendingRequests?.size || 0,
      });
    };

    // Update stats immediately
    updateStats();

    // Update stats every 2 seconds
    const interval = setInterval(updateStats, 2000);

    return () => clearInterval(interval);
  }, []);

  // Only show in development
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50">
      {/* Toggle button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-blue-600 text-white px-3 py-1 rounded text-xs mb-2 hover:bg-blue-700"
      >
        {isVisible ? "Hide" : "Show"} API Stats
      </button>

      {/* Stats panel */}
      {isVisible && (
        <div className="bg-black/90 text-white p-4 rounded-lg text-xs max-w-sm">
          <h3 className="font-bold mb-2">API Performance Monitor</h3>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Cache Entries:</span>
              <span className="text-green-400">{stats.cacheSize}</span>
            </div>

            <div className="flex justify-between">
              <span>Pending Requests:</span>
              <span className="text-yellow-400">{stats.pendingRequests}</span>
            </div>

            <div className="border-t border-gray-600 pt-2 mt-2">
              <div className="text-gray-300 mb-1">Cached Data:</div>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {stats.cacheKeys.length > 0 ? (
                  stats.cacheKeys.map((key) => (
                    <div key={key} className="text-gray-400 text-xs">
                      {key}
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500">No cached data</div>
                )}
              </div>
            </div>

            <div className="border-t border-gray-600 pt-2 mt-2">
              <button
                onClick={() => dataManager.invalidateCache()}
                className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700"
              >
                Clear Cache
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
