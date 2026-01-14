import { NextRequest, NextResponse } from "next/server";
import {
  getRecentBlocksFallback,
  getBlocks,
} from "@/lib/api_request/blockFetcher.lib";

/**
 * GET /api/blocks
 * Fetches recent Base mainnet blocks for the block range selector
 *
 * Query parameters:
 * - limit: number of blocks to fetch (default: 10)
 * - minTxs: minimum transaction count (optional)
 * - maxTxs: maximum transaction count (optional)
 * - minutesBack: filter blocks from last X minutes (optional)
 * - sortBy: sort by 'txs' or 'recency' (default: 'recency')
 * - order: 'asc' or 'desc' (default: 'desc')
 */
export async function GET(_req: NextRequest) {
  try {
    // Fetch real blocks from Basescan
    let blocks = await getBlocks(); // Fetch extra for filtering

    // Limit results
    blocks = blocks.slice(0, 1000);
    console.log(blocks);
    return NextResponse.json({
      success: true,
      data: blocks,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[API] Error fetching blocks:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch blocks",
        data: getRecentBlocksFallback(10),
        source: "fallback",
      },
      { status: 200 } // Return 200 with fallback blocks instead of error
    );
  }
}
