import { useState } from "react";
import { Copy, Check, ExternalLink, Shield } from "lucide-react";
import { ProfitabilityResult } from "@/types";
import { useThemeStore } from "@/store/themeStore";

interface indicators {
  highVolume: boolean;
  lowNetPosition: boolean;
  manyTransactions: boolean;
  repetitivePattern: boolean;
}

export const WashTraderCard = ({
  trader,
  isDark: isDarkProp,
}: {
  trader: ProfitabilityResult;
  isDark?: boolean;
}) => {
  const { isDark: isDarkTheme } = useThemeStore();
  const isDark = isDarkProp !== undefined ? isDarkProp : isDarkTheme;
  const [copiedAddress, setCopiedAddress] = useState<string>("");

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const openBaseScan = (address: string): void => {
    window.open(
      `https:basescan.org/address${address}`,
      "_blank",
      "noopener,noreferrer"
    );
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
    if (indicators?.highVolume)
      badges.push({ label: "High Vol", color: "red" });
    if (indicators?.lowNetPosition)
      badges.push({ label: "Low Net", color: "orange" });
    if (indicators?.manyTransactions)
      badges.push({ label: "Many Tx", color: "yellow" });
    if (indicators?.repetitivePattern)
      badges.push({ label: "Repetitive", color: "purple" });
    return badges;
  };

  return (
    <div
      className={`py-2 px-4 transition-all hover:shadow-lg ${
        isDark
          ? "bg-gray-800 hover:bg-gray-800/10"
          : "bg-gray-100 hover:bg-gray-200/10 "
      }`}
    >
      <div className="flex flex-row items-center gap-6 flex-wrap lg:flex-nowrap">
        {/* Address - items-start */}
        <div className="flex-1 min-w-[200px] flex items-start">
          <div className="flex items-center gap-3 w-full">
            <div className="flex-1">
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
                  onClick={() => openBaseScan(trader.address)}
                >
                  <ExternalLink className="w-3 h-3" /> View
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Volume */}
        <div className="flex-1 min-w-[120px]">
          <div
            className={`font-semibold ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            {formatUSD(trader?.volumeUSD)}
          </div>
          <div
            className={`text-xs mt-1 ${
              isDark ? "text-gray-500" : "text-gray-500"
            }`}
          >
            {formatNumber(trader.totalVolume)} SOL
          </div>
        </div>

        {/* Score */}
        <div className="flex-1 min-w-[120px]">
          <div
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-bold ${
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
        </div>

        {/* Transactions */}
        <div className="flex-1 min-w-[100px]">
          <div
            className={`font-semibold text-sm ${
              isDark ? "text-gray-300" : "text-gray-700"
            }`}
          >
            {trader.transactionCount}
          </div>
        </div>

        {/* ROI */}
        <div className="flex-1 min-w-[120px]">
          <div
            className={`flex items-center gap-1.5 font-semibold ${
              isDark ? "text-green-400" : "text-green-600"
            }`}
          >
            +{formatNumber(trader.roi)}%
          </div>
          <div
            className={`text-xs mt-1 ${
              isDark ? "text-gray-500" : "text-gray-500"
            }`}
          >
            {formatUSD(trader.estimatedNetProfit)} in profit
          </div>
        </div>

        {/* LP Position */}
        <div className="flex-1 min-w-[120px]">
          {trader.hasLPPosition ? (
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${
                isDark
                  ? "bg-blue-500/20 text-blue-400"
                  : "bg-blue-50 text-blue-600"
              }`}
            >
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
        </div>

        {/* Indicators - items-end */}
        {trader.indicators && (
          <div className="flex-1 min-w-[150px] flex items-end justify-end">
            <div className="flex flex-wrap gap-1.5 justify-end">
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
          </div>
        )}
      </div>
    </div>
  );
};
