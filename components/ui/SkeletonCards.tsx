"use client";

import { useThemeStore } from "@/store/themeStore";
import { SkeletonLoader } from "./SkeletonLoader";

/**
 * OverviewCardSkeleton - Shows 4 metric cards (Net Flow, Organic, Wash, Transfer Count)
 */
export const OverviewCardSkeleton = () => {
  const { isDark } = useThemeStore();

  return (
    <div
      className={`
        rounded-lg p-6 mb-6
        ${isDark ? "bg-slate-800" : "bg-gray-100"}
      `}
    >
      <h2
        className={`
          text-lg font-semibold mb-6
          ${isDark ? "text-gray-400" : "text-gray-500"}
        `}
      >
        <SkeletonLoader width="w-32" height="h-5" />
      </h2>

      {/* 4 metric cards in a grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-3">
            {/* Top number */}
            <SkeletonLoader width="w-20" height="h-7" />
            {/* Second line */}
            <SkeletonLoader width="w-28" height="h-4" />
            {/* Third line */}
            <SkeletonLoader width="w-24" height="h-4" />
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * GaugeCardSkeleton - Shows 2 circular gauges + right side card
 */
export const GaugeCardSkeleton = () => {
  const { isDark } = useThemeStore();

  return (
    <div
      className={`
        rounded-lg p-6 mb-6
        ${isDark ? "bg-slate-800" : "bg-gray-100"}
        grid grid-cols-1 lg:grid-cols-3 gap-6
      `}
    >
      {/* Left Gauge 1 */}
      <div className="flex flex-col items-center justify-center space-y-4">
        <SkeletonLoader
          variant="circular"
          width="w-24"
          height="h-24"
        />
        <SkeletonLoader width="w-32" height="h-4" />
      </div>

      {/* Middle Gauge 2 */}
      <div className="flex flex-col items-center justify-center space-y-4">
        <SkeletonLoader
          variant="circular"
          width="w-24"
          height="h-24"
        />
        <SkeletonLoader width="w-32" height="h-4" />
      </div>

      {/* Right Card */}
      <div
        className={`
          rounded-lg p-4
          ${isDark ? "bg-slate-700" : "bg-gray-200"}
          flex flex-col justify-center space-y-4
        `}
      >
        <SkeletonLoader width="w-20" height="h-5" />
        <SkeletonLoader width="w-24" height="h-7" />
        <div className="grid grid-cols-2 gap-3">
          <SkeletonLoader width="w-full" height="h-12" />
          <SkeletonLoader width="w-full" height="h-12" />
        </div>
      </div>
    </div>
  );
};

/**
 * SummaryCardSkeleton - Shows 3 trading volume cards at the bottom
 */
export const SummaryCardSkeleton = () => {
  const { isDark } = useThemeStore();

  return (
    <div
      className={`
        rounded-lg p-6
        ${isDark ? "bg-slate-800" : "bg-gray-100"}
      `}
    >
      {/* Section title */}
      <SkeletonLoader width="w-40" height="h-5" className="mb-6" />

      {/* 3 summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`
              rounded-lg p-4 space-y-3
              ${isDark ? "bg-slate-700" : "bg-gray-200"}
            `}
          >
            <SkeletonLoader width="w-32" height="h-4" />
            <SkeletonLoader width="w-28" height="h-6" />
            <SkeletonLoader width="w-24" height="h-4" />
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Full Dashboard Skeleton - Combines all skeleton sections
 */
export const DashboardSkeleton = () => {
  return (
    <div className="space-y-6">
      <OverviewCardSkeleton />
      <GaugeCardSkeleton />
      <SummaryCardSkeleton />
    </div>
  );
};

export default DashboardSkeleton;
