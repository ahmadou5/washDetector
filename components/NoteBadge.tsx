"use client";

import { useThemeStore } from "@/store/themeStore";
import { LucideInfo } from "lucide-react";

type StatusType = "available" | "hidden";

interface StatusBadgeProps {
  status: StatusType;
  data?: string;
}

export const NoteBadge = ({ status, data }: StatusBadgeProps) => {
  const { isDark } = useThemeStore();

  if (status === "hidden") {
    return null;
  }

  const isDateAvailabel = status === "available";

  return (
    <div
      className={`
        flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium
        transition-all duration-300 ease-in-out
        ${
          isDateAvailabel
            ? isDark
              ? "bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700"
              : "bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-200"
            : ""
        }
      `}
    >
      {/* Demo data indicator */}
      {isDateAvailabel && (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-current" />
          <LucideInfo
            className={`${isDark ? "text-gray-200" : "text-gray-600"}`}
          />
          <span className={`${isDark ? "text-gray-200" : "text-gray-600"}`}>
            {data}
          </span>
        </div>
      )}
    </div>
  );
};

export default NoteBadge;
