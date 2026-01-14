import { AnalysisReport } from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CacheEntry {
  data: AnalysisReport;
  timestamp: number;
}

interface CacheMetadata {
  isFetching: boolean;
  isStale: boolean;
  lastUpdatedAt: number | null;
}

interface CacheStore {
  cache: Map<string, CacheEntry>;
  cacheMetadata: CacheMetadata;
  
  getCacheKey: (tokenAddress?: string, startBlock?: number, endBlock?: number) => string;
  getCache: (tokenAddress?: string, startBlock?: number, endBlock?: number) => AnalysisReport | null;
  getCachedAnalysis: () => AnalysisReport | null;
  setCache: (data: AnalysisReport, tokenAddress?: string, startBlock?: number, endBlock?: number) => void;
  isCacheValid: (timestamp: number, expiryMinutes?: number) => boolean;
  clearCache: () => void;
  
  // Metadata operations
  setFetching: (isFetching: boolean) => void;
  markStale: () => void;
  isDataStale: (tokenAddress?: string, startBlock?: number, endBlock?: number) => boolean;
}

export const useCacheStore = create<CacheStore>()(
  persist(
    (set, get) => ({
      cache: new Map(),
      cacheMetadata: {
        isFetching: false,
        isStale: false,
        lastUpdatedAt: null,
      },

      getCacheKey: (tokenAddress?: string, startBlock?: number, endBlock?: number) => {
        return `${tokenAddress || "default"}_${startBlock || "none"}_${endBlock || "none"}`;
      },

      isCacheValid: (timestamp: number, expiryMinutes = 20) => {
        const expiryMs = expiryMinutes * 60 * 1000;
        return Date.now() - timestamp < expiryMs;
      },

      getCache: (tokenAddress?: string, startBlock?: number, endBlock?: number) => {
        const { cache, getCacheKey, isCacheValid } = get();
        const key = getCacheKey(tokenAddress, startBlock, endBlock);
        const entry = cache.get(key);

        if (!entry) {
          return null;
        }

        if (!isCacheValid(entry.timestamp)) {
          // Cache expired, remove it
          cache.delete(key);
          set((state) => ({
            cacheMetadata: { ...state.cacheMetadata, isStale: true },
          }));
          return null;
        }

        return entry.data;
      },

      getCachedAnalysis: () => {
        const { cache, isCacheValid } = get();
        // Get the first (default) cache entry
        const key = "default_none_none";
        const entry = cache.get(key);

        if (!entry) {
          return null;
        }

        if (!isCacheValid(entry.timestamp)) {
          return null;
        }

        return entry.data;
      },

      setCache: (data: AnalysisReport, tokenAddress?: string, startBlock?: number, endBlock?: number) => {
        set((state) => {
          const newCache = new Map(state.cache);
          const key = state.getCacheKey(tokenAddress, startBlock, endBlock);
          newCache.set(key, {
            data,
            timestamp: Date.now(),
          });
          return { 
            cache: newCache,
            cacheMetadata: { 
              isFetching: false, 
              isStale: false,
              lastUpdatedAt: Date.now(),
            },
          };
        });
      },

      clearCache: () => {
        set({ 
          cache: new Map(),
          cacheMetadata: { 
            isFetching: false, 
            isStale: false,
            lastUpdatedAt: null,
          },
        });
      },

      setFetching: (isFetching: boolean) => {
        set((state) => ({
          cacheMetadata: { ...state.cacheMetadata, isFetching },
        }));
      },

      markStale: () => {
        set((state) => ({
          cacheMetadata: { ...state.cacheMetadata, isStale: true },
        }));
      },

      isDataStale: (tokenAddress?: string, startBlock?: number, endBlock?: number) => {
        const { cache, getCacheKey, isCacheValid } = get();
        const key = getCacheKey(tokenAddress, startBlock, endBlock);
        const entry = cache.get(key);

        if (!entry) return true;
        return !isCacheValid(entry.timestamp);
      },
    }),
    {
      name: "analysis-cache",
      storage: {
        getItem: (name) => {
          const item = localStorage.getItem(name);
          if (!item) return null;
          try {
            const parsed = JSON.parse(item);
            // Convert the serialized map back to a Map
            if (parsed.state && parsed.state.cache) {
              parsed.state.cache = new Map(parsed.state.cache);
            }
            return parsed;
          } catch {
            return null;
          }
        },
        setItem: (name, value) => {
          try {
            const toStore = {
              ...value,
              state: {
                ...value.state,
                // Convert Map to array for serialization
                cache: value.state.cache instanceof Map 
                  ? Array.from(value.state.cache.entries()) 
                  : value.state.cache,
              },
            };
            localStorage.setItem(name, JSON.stringify(toStore));
          } catch {
            // Fail silently
          }
        },
        removeItem: (name) => {
          localStorage.removeItem(name);
        },
      },
    }
  )
);
