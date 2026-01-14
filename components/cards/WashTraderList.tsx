import { useState } from "react";
import { WashTable } from "../WashTraderTable";

import { useThemeStore } from "@/store/themeStore";

import { ProfitabilityResult, AnalysisReport } from "@/types";

export interface indicators {
  highVolume: boolean;
  lowNetPosition: boolean;
  manyTransactions: boolean;
  repetitivePattern: boolean;
}

interface WashTradersListProps {
  washTraders?: ProfitabilityResult[];
  report?: AnalysisReport | null;
}

const WashTradersList = ({ washTraders, report }: WashTradersListProps) => {
  const { isDark } = useThemeStore();
  const [currentWashPage, setCurrentWashPage] = useState(1);
  const itemsPerPage = 10;

  // Use report data if available, otherwise use prop or empty array
  const traders = Array.isArray(report?.topWashTraders)
    ? report.topWashTraders
    : Array.isArray(washTraders)
    ? washTraders
    : [];

  // Pagination calculations
  const totalPages = Math.ceil((traders?.length || 0) / itemsPerPage);

  const paginatedWashTraders = traders?.slice(
    (currentWashPage - 1) * itemsPerPage,
    currentWashPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentWashPage(Math.min(page, totalPages));
  };

  return (
    <div className={`h-auto w-full transition-colors bg-inherit`}>
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-sm sm:text-base text-gray-500 dark:text-solana-gray-400">
            {paginatedWashTraders.length} Potential Wash Traders Found
            {totalPages > 1 && (
              <span className="hidden sm:inline ml-2">
                • Page {currentWashPage} of {totalPages}
              </span>
            )}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Page info on mobile */}
          <div className="sm:hidden text-sm text-gray-500 dark:text-solana-gray-400">
            Page {currentWashPage} of {totalPages}
          </div>
        </div>
      </div>
      <div
        className={`py-4 px-6 border rounded-t-xl ${
          isDark ? "bg-gray-900 border-gray-800" : "bg-gray-100 border-gray-200"
        }`}
      >
        <div className="flex flex-row items-center gap-6 flex-wrap lg:flex-nowrap">
          {/* Address - items-start */}
          <div className="flex-1 min-w-[200px] flex items-center">
            <div
              className={`text-base  font-semibold text-center ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Address
            </div>
          </div>

          {/* Volume */}
          <div className="flex-1 min-w-[120px]">
            <div
              className={`text-base  font-semibold ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Volume (USD)
            </div>
          </div>

          {/* Score */}
          <div className="flex-1 min-w-[120px]">
            <div
              className={`text-base  font-semibold ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Suspicious Score
            </div>
          </div>

          {/* Transactions */}
          <div className="flex-1 min-w-[100px]">
            <div
              className={`text-base  font-semibold ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Transactions
            </div>
          </div>

          {/* ROI */}
          <div className="flex-1 min-w-[120px]">
            <div
              className={`text-base font-semibold ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              ROI
            </div>
          </div>

          {/* LP Position */}
          <div className="flex-1 min-w-[120px]">
            <div
              className={`text-base  font-semibold ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              LP Position
            </div>
          </div>

          {/* Indicators - items-end */}
          <div className="flex-1 min-w-[150px] flex items-end justify-end">
            <div
              className={`text-base  font-semibold ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Indicators
            </div>
          </div>
        </div>
      </div>
      {/* Validator Display */}
      {paginatedWashTraders.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-solana-gray-400">
            <svg
              className="w-16 h-16 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8V4a1 1 0 00-1-1H7a1 1 0 00-1 1v1m7-1v1"
              />
            </svg>
            <h3 className="text-xl font-semibold mb-2">No Traders Found</h3>
            <p>Try adjusting your filters or refresh the data.</p>
          </div>
        </div>
      ) : (
        <WashTable
          traders={paginatedWashTraders}
          totalPages={totalPages}
          handlePageChange={handlePageChange}
          currentPage={currentWashPage}
          isDark={isDark}
        />
      )}
    </div>
  );
};

export default WashTradersList;
