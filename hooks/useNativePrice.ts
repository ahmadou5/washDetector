import { JupiterRequest } from "@/lib/api_request/jupiterPrice.lib";
import { JupiterNativePriceResponse } from "@/types";
import { useState, useEffect, useCallback } from "react";

interface UseSolanaPriceOptions {
  autoFetch?: boolean;
  refreshInterval?: number; // in milliseconds
}

interface SolanaPriceState {
  price: number;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export const useSolanaPrice = (options: UseSolanaPriceOptions = {}) => {
  const { autoFetch = true, refreshInterval } = options;

  const [state, setState] = useState<SolanaPriceState>({
    price: 0,
    isLoading: false,
    error: null,
    lastUpdated: null,
  });

  const fetchPrice = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await JupiterRequest.nativePrice();

      const data = result.data as JupiterNativePriceResponse;

      if (result.success && result.data) {
        const solAddress: string =
          "So11111111111111111111111111111111111111112";
        const solPrice = data[solAddress]?.usdPrice;
        console.log(`Current SOL Price: $${solPrice}`);
        setState({
          price: solPrice,
          isLoading: false,
          error: null,
          lastUpdated: new Date(),
        });
      } else {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: result?.message || "Failed to fetch Solana price",
        }));
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      }));
    }
  }, []);

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      fetchPrice();
    }
  }, [autoFetch]);

  // Set up refresh interval if provided
  useEffect(() => {
    if (refreshInterval && refreshInterval > 0) {
      const intervalId = setInterval(fetchPrice, refreshInterval);
      return () => clearInterval(intervalId);
    }
    return undefined;
  }, [refreshInterval, fetchPrice]);

  return {
    price: state.price,
    isLoading: state.isLoading,
    error: state.error,
    lastUpdated: state.lastUpdated,
    refetch: fetchPrice,
  };
};
