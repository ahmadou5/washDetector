import { NextRequest, NextResponse } from "next/server";
import Moralis from "moralis";
import { runAnalysis } from "@/lib/analyser";
import { ENV } from "@/lib/constants/env.constant";
import { getBlocks } from "@/lib/api_request/blockFetcher.lib";

// Initialize Moralis with API key from environment
const initializeMoralis = async () => {
  const apiKey = ENV?.MORALIS_KEY;
  if (!apiKey) {
    throw new Error("MORALIS_API_KEY environment variable is not set");
  }
  if (!Moralis.Core.isStarted) {
    console.info("Initializing Moralis...");
    await Moralis.start({ apiKey });
    console.info("Moralis initialized");
  }
};

// Note: These constants are currently unused but kept for future extension
// const pool_address = process.env.POOL_ADDRESS || "0xb30540172f1b37d1ee1d109e49f883e935e69219";
// const swap_signature = "0xc42079f94a6350d7e6235f29174924f928cc2ac818eb64fed8004e115fbcca67";

/**
 * Validates token address format
 */
const validateTokenAddress = (address?: string): void => {
  if (address && !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    throw new Error("Invalid token address format");
  }
};

// Note: validateBlockRange is currently unused but kept for future reference
// const validateBlockRange = (from: number, to: number): void => {
//   if (!Number.isInteger(from) || !Number.isInteger(to)) {
//     throw new Error("Block numbers must be integers");
//   }
//   if (from < 0 || to < 0) {
//     throw new Error("Block numbers must be non-negative");
//   }
//   if (from > to) {
//     throw new Error("Start block must be less than or equal to end block");
//   }
//   const maxBlockRange = 10000; // Prevent excessive data fetching
//   if (to - from > maxBlockRange) {
//     throw new Error(`Block range cannot exceed ${maxBlockRange} blocks`);
//   }
// };

export async function POST(req: NextRequest) {
  try {
    // Initialize Moralis before processing
    await initializeMoralis();

    const body = await req.json();
    const { tokenAddress } = body;
    // Note: blockRange, startBlock, and endBlock are currently unused but kept for future extension

    const rangeSize = 1000;

    const blocks = await getBlocks();
    //const rangeSize = 10000;
    const latestBlock = blocks[blocks.length - 1].number;
    const startBlock = latestBlock - rangeSize;
    // Use provided block range or defaults
    const from = startBlock;
    const to = latestBlock;

    // Validate inputs
    //validateBlockRange(from, to);
    validateTokenAddress(tokenAddress);

    console.log(`[API] Starting analysis from block ${from} to ${to}`);
    console.log(`[API] Token Address: ${tokenAddress}`);

    // Run the analysis
    const analyData = await runAnalysis({
      from,
      to,
    });

    console.log(
      `[API] Analysis complete. Found ${
        analyData.topWashTraders?.length || 0
      } wash traders`
    );
    console.log(`[API] Summary:`, analyData.summary);

    // Return the complete analysis data
    return NextResponse.json({
      success: true,
      data: {
        summary: analyData.summary || {
          totalTransfers: 0,
          totalVolume: 0,
          washVolume: 0,
          organicVolume: 0,
          washVolumePercent: 0,
          organicVolumePercent: 0,
          uniqueAddresses: 0,
          identifiedWashTraders: 0,
          analysisBlockRange: {
            start: String(from),
            end: String(to),
          },
        },
        topWashTraders: analyData.topWashTraders || [],
        organicTraders: analyData.organicTraders || [],
        methodology:
          analyData.methodology ||
          "Analysis based on transaction patterns and behavior heuristics",
        analysisTimestamp: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[API] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
        data: null,
      },
      { status: 500 }
    );
  }
}
