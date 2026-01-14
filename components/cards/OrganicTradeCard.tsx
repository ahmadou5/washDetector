import { useState } from "react";
import { Copy, Check, ExternalLink } from "lucide-react";
import { OrganicTrader } from "@/types";
import { useThemeStore } from "@/store/themeStore";

export const OrganicTraderCard = ({
  trader,
  isDark: isDarkProp,
}: {
  trader: OrganicTrader;
  isDark?: boolean;
}) => {
  const { isDark: isDarkTheme } = useThemeStore();
  const isDark = isDarkProp !== undefined ? isDarkProp : isDarkTheme;
  const [copiedAddress, setCopiedAddress] = useState<string>("");

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
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

  const openBaseScan = (address: string): void => {
    window.open(
      `https:basescan.org/address${address}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const copyToClipboard = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(""), 2000);
  };

  return (
    <div
      className={`py-2 px-4  transition-all hover:shadow-lg ${
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
            {formatNumber(trader.volume)}
          </div>
        </div>

        {/* Transactions */}
        <div className="flex-1 min-w-[120px]">
          <div
            className={`font-semibold ${
              isDark ? "text-gray-300" : "text-gray-700"
            }`}
          >
            {trader.transactionCount}
          </div>
        </div>

        {/* Net Position */}
        <div className="flex-1 min-w-[120px]">
          <div
            className={`font-semibold ${
              isDark ? "text-gray-300" : "text-gray-700"
            }`}
          >
            {formatNumber(trader.netPosition)}
          </div>
        </div>

        {/* Avg Per Tx - items-end */}
        <div className="flex-1 min-w-[120px] flex items-end justify-end">
          <div
            className={`font-semibold ${
              isDark ? "text-gray-300" : "text-gray-700"
            }`}
          >
            {formatNumber(trader.volume / trader.transactionCount)}
          </div>
        </div>
      </div>
    </div>
  );
};
