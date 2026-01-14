import axios from "axios";
import {
  assetDashNativePriceResponse,
  assetDashOHCLV,
  assetDashTokenData,
  assetDashTokenListResponse,
  assetDashTrendingTokensResponse,
} from "@/types";
import { apiResponse } from "../api.helper";

export const assetDashRequests = {
  baseUrl: "https://public-api.mobyscreener.com/public",
  config: {
    Accept: "*/*",
    "User-Agent": "Thunder Client (https://www.thunderclient.com)",
    "Access-Control-Allow-Origin": "*",
  },
  //fetch trending tokens using assetdash api
  trending: async (limit: number = 30) => {
    try {
      const res = await axios.get(
        `${assetDashRequests.baseUrl}/leaderboard/trending_leaderboard`,
        {
          headers: assetDashRequests.config,
          timeout: 10000,
        }
      );
      return apiResponse<assetDashTrendingTokensResponse>(
        true,
        "Fetched trending tokens",
        { items: res?.data?.items.slice(0, limit) }
      );
    } catch (error) {
      return apiResponse<assetDashTrendingTokensResponse>(
        false,
        "Error Fetching trending tokens",
        error as any
      );
    }
  },
  //fetch top solana tokens using assetDash api
  tokens: async () => {
    try {
      const res = await axios.get(
        `${assetDashRequests.baseUrl}/leaderboard/list?compact=false`,
        {
          headers: assetDashRequests.config,
          timeout: 10000,
        }
      );
      //console.log("Fetched tokens:", res?.data.tokens);
      return apiResponse<assetDashTokenListResponse>(
        true,
        "Fetched solana tokens",
        { items: res?.data }
      );
    } catch (error) {
      return apiResponse<assetDashTokenListResponse>(
        false,
        "Error Fetching solana tokens",
        error as any
      );
    }
  },
  //spl token details
  tokenDetails: async (mintAddress: string) => {
    try {
      const res = await axios.get(
        `${assetDashRequests.baseUrl}/tokens/details/solana/${mintAddress}?compact=false`,
        {
          headers: assetDashRequests.config,
          timeout: 10000,
        }
      );

      return apiResponse<assetDashTokenData>(
        true,
        "Fetched SPL token details",
        res?.data
      );
    } catch (error) {
      return apiResponse<assetDashTokenData>(
        false,
        "Error Fetching solana tokens",
        error as any
      );
    }
  },
  ohclv: async (mintAddress: string, timeframe: string = "24H") => {
    try {
      const timeframeMap: {
        [key: string]: { timeframe: string; aggregate: number; limit: number };
      } = {
        "24H": { timeframe: "hour", aggregate: 1, limit: 24 },
        "1W": { timeframe: "day", aggregate: 1, limit: 7 },
        "1M": { timeframe: "day", aggregate: 1, limit: 30 },
        "6M": { timeframe: "week", aggregate: 1, limit: 26 },
        "1Y": { timeframe: "week", aggregate: 1, limit: 52 },
      };

      const params = timeframeMap[timeframe] || timeframeMap["1W"];
      const res = await axios.get(
        `${assetDashRequests.baseUrl}tokens/ohlcv_v2/solana/${mintAddress}`,
        {
          params: {
            timeframe: params.timeframe,
            aggregate: params.aggregate,
            limit: params.limit,
          },
          headers: assetDashRequests.config,
          timeout: 10000,
        }
      );
      return apiResponse<assetDashOHCLV>(true, "Fetched OHCLV data", res?.data);
    } catch (error) {
      return apiResponse<assetDashOHCLV>(false, "Error Fetching OHCLV data", {
        s: "",
        t: [],
        o: [],
        h: [],
        l: [],
        c: [],
        v: [],
      });
    }
  },
  nativePrice: async () => {
    try {
      const res = await axios.get(
        `${assetDashRequests.baseUrl}/tokens/token/blockchain-prices`,
        {
          headers: assetDashRequests.config,
          timeout: 10000,
        }
      );
      return apiResponse<assetDashNativePriceResponse>(
        true,
        "Fetched native prices",
        res?.data
      );
    } catch (error) {
      return apiResponse<assetDashNativePriceResponse>(
        false,
        "Error Fetching native prices",
        {} as assetDashNativePriceResponse
      );
    }
  },
};
