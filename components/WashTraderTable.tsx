"use client";

import { ProfitabilityResult } from "@/types";
import { WashTraderCard } from "./cards/WashTraderCard";
import { useThemeStore } from "@/store/themeStore";

interface WashTraderTableProps {
  traders: ProfitabilityResult[];
  //onValidatorSelect: (validator: ValidatorInfo) => void;
  totalPages: number;
  currentPage: number;
  isDark?: boolean;
  handlePageChange: (page: number) => void;
}

export function WashTable({
  traders,
  totalPages,
  currentPage,
  isDark: isDarkProp,
  handlePageChange,
}: WashTraderTableProps) {
  const { isDark: isDarkTheme } = useThemeStore();
  const isDark = isDarkProp !== undefined ? isDarkProp : isDarkTheme;
  return (
    <div
      className={` rounded-b-xl p-0 overflow-hidden ${
        isDark
          ? "bg-gray-800 hover:bg-gray-800/40"
          : "bg-gray-100 hover:bg-gray-200/40"
      }`}
    >
      <div className="overflow-x-auto flex">
        <div className="w-full">
          <div className="w-full">
            {traders.map((trader) => (
              <WashTraderCard
                key={trader.address}
                trader={trader}
                isDark={isDark}
              />
            ))}
            <div
              className={`flex items-end rounded-b-xl w-full ${
                isDark
                  ? "bg-gray-900 border-gray-800"
                  : "bg-gray-100 border-gray-200"
              } justify-end py-2  px-1`}
            >
              {totalPages > 1 && (
                <div className="flex items-end gap-2 mt-0 justify-end px-4">
                  {/* Previous Button */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`w-9 h-9 rounded-md ${
                      isDark ? "text-gray-200" : "text-gray-600"
                    } disabled:opacity-30 ${
                      isDark ? "bg-gray-800" : "bg-gray-300"
                    } disabled:cursor-not-allowed flex items-center justify-center text-gray-300 transition-colors`}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>

                  {/* Page Numbers */}
                  {(() => {
                    const pages = [];
                    const maxVisible = 3;
                    let startPage = Math.max(1, currentPage - 1);
                    const endPage = Math.min(
                      totalPages,
                      startPage + maxVisible - 1
                    );

                    if (endPage - startPage < maxVisible - 1) {
                      startPage = Math.max(1, endPage - maxVisible + 1);
                    }

                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(
                        <button
                          key={i}
                          onClick={() => handlePageChange(i)}
                          className={`w-9 h-9 rounded-md flex  items-center justify-center text-sm font-medium transition-colors ${
                            currentPage === i
                              ? "bg-black text-gray-300"
                              : "bg-black/50 border border-white text-gray-300 hover:bg-gray-700"
                          }`}
                        >
                          {i}
                        </button>
                      );
                    }
                    return pages;
                  })()}

                  {/* Next Button */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`w-9 h-9 rounded-md  ${
                      isDark ? "text-gray-200" : "text-gray-600"
                    } ${
                      isDark ? "bg-gray-800" : "bg-gray-300"
                    } disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-gray-300 transition-colors`}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
