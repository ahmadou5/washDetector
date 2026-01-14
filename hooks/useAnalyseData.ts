import { AnalysisReport } from "@/types";
import { useCacheStore } from "@/store/cacheStore";
import axios from "axios";
import { useCallback, useState } from "react";
import { fakeResponse } from "@/utils/fakeData";

interface payloadType {
  tokenAddress?: string;
  startBlock?: number;
  endBlock?: number;
}

export const useAnalyseData = () => {
  const [report, setReport] = useState<AnalysisReport>({
    analysisTimestamp: "",
    methodology: "",
    organicTraders: [],
    summary: {
      analysisBlockRange: {
        start: "",
        end: "",
      },
      identifiedWashTraders: 0,
      organicVolume: 0,
      organicVolumePercent: 0,
      totalTransfers: 0,
      totalVolume: 0,
      uniqueAddresses: 0,
      washVolume: 0,
      washVolumePercent: 0,
    },
    topWashTraders: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isBackgroundLoading, setIsBackgroundLoading] = useState(false);

  const { getCache, setCache, setFetching } = useCacheStore();

  const runAnalysis = useCallback(
    async (tokenAddress?: string, startBlock?: number, endBlock?: number) => {
      console.log("[useAnalysis] Starting analysis with:", {
        tokenAddress,
        startBlock,
        endBlock,
      });

      // Always show loading when explicitly triggered (not from cache)
      setLoading(true);
      setError(null);

      try {
        const payload: payloadType = {};

        if (tokenAddress) {
          payload.tokenAddress = tokenAddress;
        }

        if (startBlock !== undefined) {
          payload.startBlock = startBlock;
        }

        if (endBlock !== undefined) {
          payload.endBlock = endBlock;
        }

        console.log("[useAnalysis] Sending payload:", payload);
        const response = await axios.post("/api/solana", payload);

        console.log("[useAnalysis] API response received", response.data);

        if (response.data.success && response.data.data) {
          console.log("[useAnalysis] Report data set successfully");
          const reportData = response.data.data as AnalysisReport;
          setReport(reportData);
          // Update cache with new data
          setCache(reportData, tokenAddress, startBlock, endBlock);
          console.log("[useAnalysis] Cache updated with new data");
        } else {
          throw new Error(response.data.error || "Analysis failed");
        }
      } catch (error) {
        let errorMessage = "Unknown error";

        if (axios.isAxiosError(error)) {
          console.error("[useAnalysis] Axios error:", error.message);
          console.error(
            "[useAnalysis] Response status:",
            error.response?.status
          );
          console.error("[useAnalysis] Response data:", error.response?.data);
          errorMessage =
            error.response?.data?.error ||
            error.message ||
            "API request failed";
          
          // 3-tier fallback strategy - trigger on ANY API error with response
          if (error.response) {
            console.warn("[useAnalysis] API failed with status", error.response.status, "attempting 3-tier fallback...");
            
            // Tier 1: Try to get from cache
            const cachedData = getCache(tokenAddress, startBlock, endBlock);
            if (cachedData) {
              console.warn("[useAnalysis] Tier 1: Using cached data");
              setReport(cachedData);
              setError("API unavailable - showing cached data");
            } else {
              // Tier 2: No cache, use fakeResponse
              console.warn("[useAnalysis] Tier 2: No cache, using fake data");
              setReport(fakeResponse.data as AnalysisReport);
              setCache(fakeResponse.data as AnalysisReport, tokenAddress, startBlock, endBlock);
              setError("API unavailable - showing demo data");
            }
          }
        } else if (error instanceof Error) {
          console.error("[useAnalysis] Error:", error.message);
          errorMessage = error.message;
        }

        if (errorMessage && !axios.isAxiosError(error)) {
          console.error("[useAnalysis] Analysis error:", errorMessage);
          setError(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    },
    [getCache, setCache, report]
  );

  /**
   * Background analysis - doesn't block UI, just updates cache
   * Used for refreshing data when cached data is shown
   */
  const runAnalysisBackground = useCallback(
    async (tokenAddress?: string, startBlock?: number, endBlock?: number) => {
      console.log("[useAnalysis] Starting background analysis with:", {
        tokenAddress,
        startBlock,
        endBlock,
      });

      setIsBackgroundLoading(true);
      setFetching(true);

      try {
        const payload: payloadType = {};

        if (tokenAddress) {
          payload.tokenAddress = tokenAddress;
        }

        if (startBlock !== undefined) {
          payload.startBlock = startBlock;
        }

        if (endBlock !== undefined) {
          payload.endBlock = endBlock;
        }

        console.log("[useAnalysis] Sending background payload:", payload);
        const response = await axios.post("/api/solana", payload);

        console.log(
          "[useAnalysis] Background API response received",
          response.data
        );

        if (response.data.success && response.data.data) {
          const reportData = response.data.data as AnalysisReport;
          // Update both the component state and cache
          setReport(reportData);
          setCache(reportData, tokenAddress, startBlock, endBlock);
          console.log(
            "[useAnalysis] Background analysis complete, cache updated"
          );
        } else {
          throw new Error(response.data.error || "Background analysis failed");
        }
      } catch (error) {
        let errorMessage = "Unknown error";

        if (axios.isAxiosError(error)) {
          console.error("[useAnalysis] Background axios error:", error.message);
          errorMessage =
            error.response?.data?.error ||
            error.message ||
            "API request failed";
          
          // 3-tier fallback strategy for background analysis - trigger on ANY API error with response
          if (error.response) {
            console.warn("[useAnalysis] Background: API failed with status", error.response.status, "attempting 3-tier fallback...");
            console.warn("[useAnalysis] fakeResponse data:", fakeResponse.data);
            
            // Tier 1: Try to get from cache
            const cachedData = getCache(tokenAddress, startBlock, endBlock);
            if (cachedData) {
              console.warn("[useAnalysis] Background Tier 1: Using cached data");
              setReport(cachedData);
              setError("API unavailable - showing cached data");
            } else {
              // Tier 2: No cache, use fakeResponse
              console.warn("[useAnalysis] Background Tier 2: No cache, using fake data");
              console.warn("[useAnalysis] Setting report to fakeResponse immediately");
              setReport(fakeResponse.data as AnalysisReport);
              setCache(fakeResponse.data as AnalysisReport, tokenAddress, startBlock, endBlock);
              setError("API unavailable - showing demo data");
              setIsBackgroundLoading(false); // Stop loading indicator immediately
            }
          }
        } else if (error instanceof Error) {
          console.error("[useAnalysis] Background error:", error.message);
          errorMessage = error.message;
        }

        if (errorMessage && !axios.isAxiosError(error)) {
          console.error("[useAnalysis] Background analysis error:", errorMessage);
          setError(errorMessage);
        }
      } finally {
        setIsBackgroundLoading(false);
        setFetching(false);
      }
    },
    [setCache, setFetching]
  );

  // Removed automatic analysis on mount - analysis is now lazy-loaded on user action
  // This prevents expensive computations from running unnecessarily on initial page load
  // Users can trigger analysis manually through the Dashboard component

  return {
    report,
    loading,
    error,
    runAnalysis,
    runAnalysisBackground,
    isBackgroundLoading,
  };
};
