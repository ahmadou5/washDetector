"use client";

import { useThemeStore } from "@/store/themeStore";

interface SkeletonLoaderProps {
  width?: string;
  height?: string;
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  count?: number;
}

export const SkeletonLoader = ({
  width = "w-full",
  height = "h-4",
  className = "",
  variant = "rectangular",
  count = 1,
}: SkeletonLoaderProps) => {
  const { isDark } = useThemeStore();

  const baseClasses = `
    ${isDark ? "bg-gray-700" : "bg-gray-200"}
    animate-pulse
    relative
    overflow-hidden
    ${className}
  `;

  const shimmerClasses = `
    absolute
    inset-0
    ${isDark ? "bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700" : "bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200"}
    opacity-50
    animate-shimmer
  `;

  const skeletons = Array(count).fill(null).map((_, i) => (
    <div
      key={i}
      className={`
        ${baseClasses}
        ${variant === "circular" ? "rounded-full" : "rounded-lg"}
        ${variant === "text" ? "mb-2" : ""}
        ${width} ${height}
      `}
    >
      <div className={shimmerClasses} />
    </div>
  ));

  return count === 1 ? skeletons[0] : <div className="space-y-2">{skeletons}</div>;
};

export default SkeletonLoader;
