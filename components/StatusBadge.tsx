"use client";

import { useThemeStore } from "@/store/themeStore";

type StatusType = "updating" | "stale" | "hidden" | "cached-data" | "demo-data";

interface StatusBadgeProps {
  status: StatusType;
  lastUpdatedAt?: number | null;
}

export const StatusBadge = ({ status, lastUpdatedAt }: StatusBadgeProps) => {
  const { isDark } = useThemeStore();

  if (status === "hidden") {
    return null;
  }

  const formatLastUpdated = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const isUpdating = status === "updating";
  const isStale = status === "stale";
  const isCachedData = status === "cached-data";
  const isDemoData = status === "demo-data";

  return (
    <div
      className={`
        flex items-center gap-2 px-3 py-2 rounded-xl max-w-[200px] text-sm font-medium
        transition-all duration-300 ease-in-out
        ${
          isUpdating
            ? isDark
              ? "bg-gradient-to-br from-gray-800 to-gray-900 "
              : "bg-gradient-to-br from-gray-100 to-gray-200"
            : isStale
            ? isDark
              ? "bg-gradient-to-br from-gray-800 to-gray-900 "
              : "bg-gradient-to-br from-gray-100 to-gray-200 "
            : isCachedData
            ? isDark
              ? "bg-gradient-to-br from-gray-800 to-gray-900 "
              : "bg-gradient-to-br from-gray-100 to-gray-200 "
            : isDemoData
            ? isDark
              ? "bg-gradient-to-br from-gray-800 to-gray-900 "
              : "bg-gradient-to-br from-gray-100 to-gray-200 "
            : ""
        }
      `}
    >
      {/* Loading Spinner for updating state */}
      {isUpdating && (
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full border-2 border-transparent border-t-current animate-spin" />
          <span>Updating data...</span>
        </div>
      )}

      {/* Stale data indicator */}
      {isStale && lastUpdatedAt && (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-current" />
          <span>Last updated: {formatLastUpdated(lastUpdatedAt)}</span>
        </div>
      )}

      {/* Cached data indicator */}
      {isCachedData && (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-current" />
          <span>⚠️ API unavailable - showing cached data</span>
        </div>
      )}

      {/* Demo data indicator */}
      {isDemoData && (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-current" />
          <span>📊 Demo data (API unavailable)</span>
        </div>
      )}
    </div>
  );
};

export default StatusBadge;
