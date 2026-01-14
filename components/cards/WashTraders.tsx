import { ProfitabilityResult } from "@/types";
import {
  AlertTriangle,
  Check,
  Copy,
  ExternalLink,
  Shield,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { useThemeStore } from "@/store/themeStore";

export interface indicators {
  highVolume: boolean;
  lowNetPosition: boolean;
  manyTransactions: boolean;
  repetitivePattern: boolean;
}

export const WashTradeCard = ({
  washTraders,
}: {
  washTraders: ProfitabilityResult[];
}) => {
  const { isDark } = useThemeStore();
  const [copiedAddress, setCopiedAddress] = useState<string>("");
  const [currentWashPage, setCurrentWashPage] = useState(1);
  const [pageSize] = useState(10);

  // Pagination calculations
  const totalWashPages = Math.ceil(washTraders.length / pageSize);

  const paginatedWashTraders = washTraders.slice(
    (currentWashPage - 1) * pageSize,
    currentWashPage * pageSize
  );

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handlePageChange = (page: number) => {
    setCurrentWashPage(Math.min(page, totalWashPages));
  };


  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(2)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(2)}K`;
    }
    return num.toFixed(2);
  };

  const formatUSD = (num: number) => {
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(2)}M`;
    }
    if (num >= 1000) {
      return `$${(num / 1000).toFixed(2)}K`;
    }
    return `$${num.toFixed(2)}`;
  };

  const copyToClipboard = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(""), 2000);
  };

  const getIndicatorBadges = (indicators: indicators) => {
    const badges = [];
    if (indicators.highVolume === true)
      badges.push({ label: "High Vol", color: "red" });
    if (indicators.lowNetPosition)
      badges.push({ label: "Low Net", color: "orange" });
    if (indicators.manyTransactions)
      badges.push({ label: "Many Tx", color: "yellow" });
    if (indicators.repetitivePattern)
      badges.push({ label: "Repetitive", color: "purple" });
    return badges;
  };
  return (
    <div
      className={`rounded-2xl w-full overflow-hidden ${
        isDark
          ? "bg-gray-900 border border-gray-800"
          : "bg-white border border-gray-200"
      } shadow-2xl`}
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr
              className={`border-b ${
                isDark
                  ? "border-gray-800 bg-gray-850"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              <th
                className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Trader
              </th>
              <th
                className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Volume (USD)
              </th>
              <th
                className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Score
              </th>
              <th
                className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Transactions
              </th>
              <th
                className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                ROI
              </th>
              <th
                className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                LP Position
              </th>
              <th
                className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Indicators
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedWashTraders.map((trader, index) => (
              <tr
                key={index}
                className={`border-b transition-colors ${
                  isDark
                    ? "border-gray-800 hover:bg-gray-850"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2.5 rounded-lg ${
                        isDark ? "bg-red-500/10" : "bg-red-50"
                      }`}
                    >
                      <AlertTriangle
                        className={`w-5 h-5 ${
                          isDark ? "text-red-400" : "text-red-600"
                        }`}
                      />
                    </div>
                    <div>
                      <div
                        className={`font-mono text-sm font-semibold ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {formatAddress(trader.address)}
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <button
                          onClick={() => copyToClipboard(trader.address)}
                          className={`text-xs flex items-center gap-1 transition-colors ${
                            isDark
                              ? "text-gray-500 hover:text-gray-300"
                              : "text-gray-400 hover:text-gray-600"
                          }`}
                        >
                          {copiedAddress === trader.address ? (
                            <>
                              <Check className="w-3 h-3" /> Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" /> Copy
                            </>
                          )}
                        </button>
                        <button
                          className={`text-xs flex items-center gap-1 transition-colors ${
                            isDark
                              ? "text-gray-500 hover:text-gray-300"
                              : "text-gray-400 hover:text-gray-600"
                          }`}
                        >
                          <ExternalLink className="w-3 h-3" /> View
                        </button>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div
                    className={`font-semibold ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {formatUSD(trader.volumeUSD)}
                  </div>
                  <div
                    className={`text-xs mt-1 ${
                      isDark ? "text-gray-500" : "text-gray-500"
                    }`}
                  >
                    {formatNumber(trader.totalVolume)} tokens
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold ${
                      trader.suspicionScore === 100
                        ? "bg-red-500/20 text-red-400 ring-1 ring-red-500/50"
                        : trader.suspicionScore >= 90
                        ? "bg-orange-500/20 text-orange-400 ring-1 ring-orange-500/50"
                        : "bg-yellow-500/20 text-yellow-400 ring-1 ring-yellow-500/50"
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5" />
                    {trader.suspicionScore}%
                  </div>
                </td>
                <td
                  className={`px-6 py-5 font-semibold ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {trader.transactionCount}
                </td>
                <td className="px-6 py-5">
                  <div
                    className={`flex items-center gap-1.5 font-semibold ${
                      isDark ? "text-green-400" : "text-green-600"
                    }`}
                  >
                    <TrendingUp className="w-4 h-4" />
                    {formatNumber(trader.roi)}%
                  </div>
                  <div
                    className={`text-xs mt-1 ${
                      isDark ? "text-gray-500" : "text-gray-500"
                    }`}
                  >
                    {formatUSD(trader.estimatedNetProfit)} profit
                  </div>
                </td>
                <td className="px-6 py-5">
                  {trader.hasLPPosition ? (
                    <div
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${
                        isDark
                          ? "bg-blue-500/10 text-blue-400"
                          : "bg-blue-50 text-blue-600"
                      }`}
                    >
                      <Zap className="w-3 h-3" />
                      {trader.lpDetails}
                    </div>
                  ) : (
                    <span
                      className={`text-xs ${
                        isDark ? "text-gray-600" : "text-gray-400"
                      }`}
                    >
                      None
                    </span>
                  )}
                </td>
                <td className="px-6 py-5">
                  <div className="flex flex-wrap gap-1.5">
                    {getIndicatorBadges(trader.indicators).map((badge, i) => (
                      <span
                        key={i}
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          badge.color === "red"
                            ? "bg-red-500/10 text-red-400"
                            : badge.color === "orange"
                            ? "bg-orange-500/10 text-orange-400"
                            : badge.color === "yellow"
                            ? "bg-yellow-500/10 text-yellow-400"
                            : "bg-purple-500/10 text-purple-400"
                        }`}
                      >
                        {badge.label}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          <div className="flex items-end justify-end py-3 px-2">
            {totalWashPages > 1 && (
              <div className="flex items-end gap-2 mt-0 justify-end px-4">
                {/* Previous Button */}
                <button
                  onClick={() => handlePageChange(currentWashPage - 1)}
                  disabled={currentWashPage === 1}
                  className="w-9 h-9 rounded-md bg-gray-800/0 hover:bg-green-700/20 border border-green-400/40 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-gray-300 transition-colors"
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
                  let startPage = Math.max(1, currentWashPage - 1);
                  const endPage = Math.min(
                    totalWashPages,
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
                        className={`w-9 h-9 rounded-md flex items-center justify-center text-sm font-medium transition-colors ${
                          currentWashPage === i
                            ? "bg-green-400/60 text-gray-900"
                            : "bg-gray-800/0 border border-green-400/40 text-gray-300 hover:bg-gray-700"
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
                  onClick={() => handlePageChange(currentWashPage + 1)}
                  disabled={currentWashPage === totalWashPages}
                  className="w-9 h-9 rounded-md bg-gray-800/0 hover:bg-green-700/20 disabled:opacity-30 disabled:cursor-not-allowed border border-green-400/40 flex items-center justify-center text-gray-300 transition-colors"
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
        </table>
      </div>
    </div>
  );
};
