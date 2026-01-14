"use client";
import { Dashboard } from "@/components/cards/Dashboard";
import { useSolanaPrice } from "@/hooks/useNativePrice";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useThemeStore } from "@/store/themeStore";
import Image from "next/image";
import BlockRangeSelector from "@/components/cards/BlockRange";
import { useAnalyseData } from "@/hooks/useAnalyseData";
import { useRef } from "react";

export default function Home() {
  const { price } = useSolanaPrice();
  const { isDark } = useThemeStore();
  const { runAnalysis } = useAnalyseData();
  const blockRangeSelectorRef = useRef(null);

  const handleBlockRangeUpdate = (startBlock: number, endBlock: number) => {
    console.log("[Dashboard] Block range updated, triggering analysis:", {
      startBlock,
      endBlock,
    });
    // Use the default token address with new block range
    runAnalysis(
      "0x311935cd80b76769bf2ecc9d8ab7635b2139cf82",
      startBlock,
      endBlock
    );
  };

  return (
    <div
      className={`flex min-h-screen items-center flex-col justify-center p-3 font-sans transition-colors ${
        isDark ? "bg-black" : "bg-zinc-50"
      }`}
    >
      <div className="flex py-4 px-3 w-full items-center">
        <div className="flex py-2 px-1 mr-auto ml-1">
          <BlockRangeSelector
            ref={blockRangeSelectorRef}
            onUpdate={handleBlockRangeUpdate}
          />
        </div>
        <div className=" flex ml-auto mr-1 ">
          <div
            className={`rounded-xl py-1 px-3 ml-2 mr-2 flex ml-3 mr-3 border transition-colors ${
              isDark
                ? "border-green-500 text-white"
                : "border-green-400 text-gray-900"
            }`}
          >
            <div>
              <Image
                height={22}
                width={22}
                alt="sol"
                src={
                  "https://wsrv.nl/?w=25&h=25&default=1&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolana-labs%2Ftoken-list%2Fmain%2Fassets%2Fmainnet%2FSo11111111111111111111111111111111111111112%2Flogo.png&output=webp&default=https://wsrv.nl/?w=25&h=25&default=1&url=https://storage.googleapis.com/assetdash-prod-images/moby_screener/crypto_placeholder.png"
                }
              />
            </div>

            <p>{price.toLocaleString()}</p>
          </div>
          <ThemeToggle />
        </div>
      </div>
      <Dashboard />
    </div>
  );
}
