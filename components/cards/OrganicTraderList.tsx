import { useState } from "react";
import { OrganicTable } from "../OrganicTraderTable";
import { useThemeStore } from "@/store/themeStore";

import { OrganicTrader, AnalysisReport } from "@/types";

export interface indicators {
  highVolume: boolean;
  lowNetPosition: boolean;
  manyTransactions: boolean;
  repetitivePattern: boolean;
}

interface OrganicTradersListProps {
  organicTraders?: OrganicTrader[];
  report?: AnalysisReport | null;
}

const OrganicTradersList = ({
  organicTraders,
  report,
}: OrganicTradersListProps) => {
  const { isDark } = useThemeStore();
  const [currentOrganicPage, setCurrentOrganicPage] = useState(1);

  const itemsPerPage = 10;

  // Use report data if available, otherwise use prop or empty array
  const traders = Array.isArray(report?.organicTraders)
    ? report.organicTraders
    : Array.isArray(organicTraders)
    ? organicTraders
    : [];

  // Pagination calculations
  const totalPages = Math.ceil((traders?.length || 0) / itemsPerPage);

  const paginatedOrganicTraders = traders.slice(
    (currentOrganicPage - 1) * itemsPerPage,
    currentOrganicPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentOrganicPage(Math.min(page, totalPages));
  };

  return (
    <div className={`h-auto w-full transition-colors`}>
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-sm sm:text-base text-gray-500 dark:text-solana-gray-400">
            {paginatedOrganicTraders?.length} Organic Traders Found
            {totalPages > 1 && (
              <span className="hidden sm:inline ml-2">
                • Page {currentOrganicPage} of {totalPages}
              </span>
            )}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Page info on mobile */}
          <div className="sm:hidden text-sm text-gray-500 dark:text-solana-gray-400">
            Page {currentOrganicPage} of {totalPages}
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
          <div className="flex-1 min-w-[200px] flex items-start">
            <div
              className={`text-xs font-semibold ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Address
            </div>
          </div>

          {/* Volume */}
          <div className="flex-1 min-w-[120px]">
            <div
              className={`text-xs font-semibold ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Volume
            </div>
          </div>

          {/* Transactions */}
          <div className="flex-1 min-w-[120px]">
            <div
              className={`text-xs font-semibold ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Transactions
            </div>
          </div>

          {/* Net Position */}
          <div className="flex-1 min-w-[120px]">
            <div
              className={`text-xs font-semibold ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Net Position
            </div>
          </div>

          {/* Avg Per Tx - items-end */}
          <div className="flex-1 min-w-[120px] flex items-end justify-end">
            <div
              className={`text-xs font-semibold ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Avg Per Tx
            </div>
          </div>
        </div>
      </div>
      {/* Validator Display */}
      {paginatedOrganicTraders?.length === 0 ? (
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
        <OrganicTable
          traders={paginatedOrganicTraders}
          totalPages={totalPages}
          handlePageChange={handlePageChange}
          currentPage={currentOrganicPage}
          isDark={isDark}
        />
      )}
    </div>
  );
};

export default OrganicTradersList;
