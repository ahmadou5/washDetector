import axios, { isAxiosError } from "axios";
import { JupiterNativePriceResponse } from "@/types";
import { apiResponse } from "../api.helper";
import { ENV } from "../constants/env.constant";

export const JupiterRequest = {
  baseUrl: "https://api.jup.ag/price/v3",
  config: {
    "x-api-key": `${ENV.JUP_KEY}`,
  },

  // Update: Specify the return type in the Promise
  nativePrice: async () => {
    try {
      // Pass the interface to axios.get<T>
      const res = await axios.get<JupiterNativePriceResponse>(
        `${JupiterRequest.baseUrl}/?ids=So11111111111111111111111111111111111111112`,
        {
          headers: JupiterRequest.config,
        }
      );

      // Now res.data is typed as JupiterNativePriceResponse
      return apiResponse<JupiterNativePriceResponse>(
        true,
        "Fetched native prices",
        res.data
      );
    } catch (error) {
      const message = isAxiosError(error)
        ? error.response?.data?.error
        : (error as Error).message;
      return apiResponse<null>(false, "Error Fetching native prices", message);
    }
  },
};
