import Moralis from "moralis";
import {
  Erc20Value,
  EvmChain,
  EvmNft,
} from "@moralisweb3/common-evm-utils";
import {
  AddressStats,
  AnalysisReport,
  OrganicTrader,
  ProfitabilityResult,
  TransactionPair,
  Transfer,
  WashTrader,
} from "@/types";
import { ENV } from "./constants/env.constant";
//interface
interface TransactionParams {
  chain: EvmChain;
  address: string;
  limit?: number;
  fromBlock?: number;
  toBlock?: number;
  cursor?: string;
}

// Configuration
const CONFIG = {
  MORALIS_API_KEY: ENV.MORALIS_KEY || "YOUR_MORALIS_API_KEY",
  TOKEN_ADDRESS: "0x311935cd80b76769bf2ecc9d8ab7635b2139cf82",
  CHAIN: EvmChain.BASE,
  SOL_PRICE_USD: 150,
  BASE_GAS_PRICE_USD: 0.01,
  AERO_REWARD_RATE: 0.001,
};

class VolumeAnalyzer {
  private transfers: Transfer[] = [];
  private addressStats: Map<string, AddressStats> = new Map();
  private readonly MAX_ADDRESSES = 5000; // Limit memory usage
  private readonly MAX_TRANSFERS_PER_ADDRESS = 500; // Prevent unbounded growth

  async initialize(): Promise<void> {
    if (!Moralis.Core.isStarted) {
      await Moralis.start({
        apiKey: CONFIG.MORALIS_API_KEY,
      });
    }
    console.log("✅ Moralis initialized");
  }

  async getTokenTransfers(
    fromBlock?: number,
    toBlock?: number,
    limit: number = 100
  ): Promise<Transfer[]> {
    try {
      console.log(`\n📥 Fetching token transfers...`);

      const params: TransactionParams = {
        chain: CONFIG.CHAIN,
        address: CONFIG.TOKEN_ADDRESS,
        limit,
      };

      if (fromBlock) params.fromBlock = fromBlock;
      if (toBlock) params.toBlock = toBlock;

      const allTransfers: Transfer[] = [];
      let cursor: string | undefined = undefined;
      let page = 0;
      const MAX_TRANSFERS = 2000; // More reasonable limit for performance

      do {
        page++;
        if (cursor) params.cursor = cursor;

        const response = await Moralis.EvmApi.token.getTokenTransfers(params);

        const pageTransfers: Transfer[] = response.result.map(
          (transfer: any) => ({
            from: transfer.fromAddress?.lowercase || transfer.from,
            to: transfer.toAddress?.lowercase || transfer.to,
            value: Number(transfer.value) / 1e9,
            timestamp: transfer.blockTimestamp,
            txHash: transfer.transactionHash,
            blockNumber: transfer.blockNumber,
          })
        );

        allTransfers.push(...pageTransfers);
        cursor = response.pagination.cursor;

        console.log(
          `   Page ${page}: ${pageTransfers.length} transfers (Total: ${allTransfers.length})`
        );

        await new Promise((resolve) => setTimeout(resolve, 300));

        // Improved safety limit - stop early to prevent excessive processing
        if (allTransfers.length >= MAX_TRANSFERS) {
          console.log(
            `   ⚠️ Reached limit of ${MAX_TRANSFERS} transfers for performance optimization`
          );
          break;
        }
      } while (cursor);

      this.transfers = allTransfers;
      console.log(`✅ Fetched ${allTransfers.length} total transfers\n`);

      return allTransfers;
    } catch (error) {
      if (error instanceof Error)
        console.error("❌ Error fetching transfers:", error.message);
      throw error;
    }
  }

  analyzeAddresses(): void {
    console.log("🔍 Analyzing address patterns...");

    for (const transfer of this.transfers) {
      this.updateAddressStats(transfer.from, transfer, "sent");
      this.updateAddressStats(transfer.to, transfer, "received");
    }

    console.log(`✅ Analyzed ${this.addressStats.size} unique addresses\n`);
  }

  private updateAddressStats(
    address: string,
    transfer: Transfer,
    direction: "sent" | "received"
  ): void {
    // Skip if we've hit the address limit to prevent unbounded memory growth
    if (!this.addressStats.has(address) && this.addressStats.size >= this.MAX_ADDRESSES) {
      return;
    }

    if (!this.addressStats.has(address)) {
      this.addressStats.set(address, {
        transfers: [],
        totalSent: 0,
        totalReceived: 0,
        netPosition: 0,
        transactionCount: 0,
        firstActivity: transfer.timestamp,
        lastActivity: transfer.timestamp,
        uniqueCounterparties: new Set(),
        transactionPairs: [],
      });
    }

    const stats = this.addressStats.get(address)!;
    
    // Only store transfers up to the limit to prevent array bloat
    if (stats.transfers.length < this.MAX_TRANSFERS_PER_ADDRESS) {
      stats.transfers.push(transfer);
    }
    
    stats.transactionCount++;
    stats.lastActivity = transfer.timestamp;

    if (direction === "sent") {
      stats.totalSent += transfer.value;
      stats.uniqueCounterparties.add(transfer.to);
    } else {
      stats.totalReceived += transfer.value;
      stats.uniqueCounterparties.add(transfer.from);
    }

    stats.netPosition = Math.abs(stats.totalReceived - stats.totalSent);
  }

  private findTransactionPairs(stats: AddressStats): TransactionPair[] {
    const pairs: TransactionPair[] = [];

    const sortedTransfers = [...stats.transfers].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    for (let i = 0; i < sortedTransfers.length - 1; i++) {
      const transfer1 = sortedTransfers[i];
      const transfer2 = sortedTransfers[i + 1];

      const isBuy1 = transfer1.to !== transfer1.from;
      const isBuy2 = transfer2.to !== transfer2.from;

      if (isBuy1 !== isBuy2) {
        const buy = isBuy1 ? transfer1 : transfer2;
        const sell = isBuy1 ? transfer2 : transfer1;

        const time1 = new Date(buy.timestamp).getTime();
        const time2 = new Date(sell.timestamp).getTime();
        const timeDiff = Math.abs(time2 - time1) / 1000;

        const amountDiff = (Math.abs(buy.value - sell.value) / buy.value) * 100;
        const netProfit = sell.value - buy.value;

        const isPotentialWashTrade = timeDiff < 300 && amountDiff < 5;

        pairs.push({
          buy,
          sell,
          timeDiff,
          amountDiff,
          netProfit,
          isPotentialWashTrade,
        });
      }
    }

    return pairs.filter((p) => p.isPotentialWashTrade);
  }

  identifyWashTraders(): WashTrader[] {
    console.log("🕵️ Identifying wash traders...");

    const washTraders: WashTrader[] = [];

    for (const [address, stats] of this.addressStats.entries()) {
      const totalVolume = stats.totalSent + stats.totalReceived;
      if (totalVolume < 10) continue;

      const pairs = this.findTransactionPairs(stats);
      stats.transactionPairs = pairs;

      const netPositionRatio = stats.netPosition / totalVolume;

      const firstTime = new Date(stats.firstActivity).getTime();
      const lastTime = new Date(stats.lastActivity).getTime();
      const duration = (lastTime - firstTime) / 3600000;
      const avgTimeBetweenTx = (duration / stats.transactionCount) * 60;

      const indicators = {
        highVolume: totalVolume > 50,
        lowNetPosition: netPositionRatio < 0.05,
        manyTransactions: stats.transactionCount > 10,
        repetitivePattern: this.detectRepetitivePattern(stats),
      };

      let score = 0;
      if (indicators.highVolume) score += 25;
      if (indicators.lowNetPosition) score += 35;
      if (indicators.manyTransactions) score += 20;
      if (indicators.repetitivePattern) score += 20;

      if (stats.uniqueCounterparties.size < 3) score += 15;
      if (avgTimeBetweenTx < 2) score += 10;
      if (netPositionRatio < 0.01) score += 10;
      if (pairs.length > 5) score += 15;

      if (score >= 50) {
        washTraders.push({
          address,
          totalVolume,
          netPosition: stats.netPosition,
          netPositionRatio,
          transactionCount: stats.transactionCount,
          suspicionScore: Math.min(score, 100),
          indicators,
          duration: duration || 0.01,
          uniqueCounterparties: stats.uniqueCounterparties.size,
          avgTimeBetweenTx,
          roundTripCount: pairs.length,
          topPairs: pairs.slice(0, 5),
        });
      }
    }

    const sorted = washTraders.sort(
      (a, b) => b.suspicionScore - a.suspicionScore
    );
    console.log(`✅ Identified ${sorted.length} potential wash traders\n`);

    return sorted;
  }

  private detectRepetitivePattern(stats: AddressStats): boolean {
    if (stats.transfers.length < 3) return false;

    const sorted = [...stats.transfers].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    let alternatingCount = 0;
    for (let i = 0; i < sorted.length - 1; i++) {
      const isSend1 = sorted[i].from === stats.transfers[0].from;
      const isSend2 = sorted[i + 1].from === stats.transfers[0].from;

      if (isSend1 !== isSend2) alternatingCount++;
    }

    return alternatingCount / sorted.length > 0.7;
  }

  async checkLPPositions(
    addresses: string[]
  ): Promise<Map<string, { hasPosition: boolean; details: string }>> {
    console.log("🔍 Checking for LP positions (V3 NFTs + V2 tokens)...");

    const lpHolders = new Map<
      string,
      { hasPosition: boolean; details: string }
    >();
    let checkedCount = 0;

    const AERODROME_V3_NFT_MANAGER =
      "0x827922686190790b37229fd06084350e74485b72";

    for (const address of addresses.slice(0, 20)) {
      try {
        const nftResponse = await Moralis.EvmApi.nft.getWalletNFTs({
          chain: CONFIG.CHAIN,
          address: address,
          limit: 10,
        });

        const nfts = nftResponse.result;
        const hasV3Position = nfts.some((nft: EvmNft) => {
          const contractAddr = nft.tokenAddress?.lowercase || "";
          const name = nft.name?.toLowerCase() || "";
          const symbol = nft.symbol?.toLowerCase() || "";

          return (
            contractAddr === AERODROME_V3_NFT_MANAGER.toLowerCase() ||
            name.includes("aerodrome") ||
            name.includes("position") ||
            symbol.includes("aero") ||
            symbol.includes("clp")
          );
        });

        const tokenResponse = await Moralis.EvmApi.token.getWalletTokenBalances(
          {
            chain: CONFIG.CHAIN,
            address: address,
          }
        );

        const tokens = tokenResponse.result;
        const hasV2Token = tokens.some((token: Erc20Value) => {
          const symbol = token.token?.symbol?.toLowerCase() || "";
          const name = token.token?.name?.toLowerCase() || "";
          const balance = Number(token.amount || 0);

          return (
            balance > 0 &&
            (symbol.includes("aero") ||
              symbol.includes("lp") ||
              symbol.includes("alp") ||
              name.includes("aerodrome") ||
              name.includes("liquidity"))
          );
        });

        const hasPosition = hasV3Position || hasV2Token;
        const details = hasV3Position
          ? "V3 NFT Position"
          : hasV2Token
          ? "V2 LP Token"
          : "None";

        lpHolders.set(address, { hasPosition, details });
        checkedCount++;

        if (hasPosition) {
          console.log(`   ✓ ${address} - ${details}`);
        }

        await new Promise((resolve) => setTimeout(resolve, 400));
      } catch (error) {
        if (error instanceof Error)
          console.error(
            `${error.message}  ✗ Error checking ${address.slice(0, 10)}...`
          );
        lpHolders.set(address, { hasPosition: false, details: "Error" });
      }
    }

    console.log(`✅ Checked ${checkedCount} addresses for LP positions\n`);
    return lpHolders;
  }

  calculateProfitability(washTraders: WashTrader[]): ProfitabilityResult[] {
    console.log("💰 Calculating profitability...\n");

    const results: ProfitabilityResult[] = [];

    for (const trader of washTraders) {
      const volumeUSD = trader.totalVolume * CONFIG.SOL_PRICE_USD;
      const estimatedAeroRewards = volumeUSD * CONFIG.AERO_REWARD_RATE;
      const estimatedGasCost =
        trader.transactionCount * CONFIG.BASE_GAS_PRICE_USD;

      const estimatedNetProfit = estimatedAeroRewards - estimatedGasCost;
      const hourlyProfit =
        trader.duration > 0 ? estimatedNetProfit / trader.duration : 0;

      results.push({
        ...trader,
        volumeUSD,
        estimatedAeroRewards,
        estimatedGasCost,
        estimatedNetProfit,
        hourlyProfit,
        roi:
          estimatedGasCost > 0
            ? (estimatedNetProfit / estimatedGasCost) * 100
            : 0,
      });
    }

    return results;
  }

  identifyOrganicTraders(washTraderAddresses: Set<string>): OrganicTrader[] {
    const organicTraders: OrganicTrader[] = [];

    for (const [address, stats] of this.addressStats.entries()) {
      if (washTraderAddresses.has(address.toLowerCase())) continue;

      const totalVolume = stats.totalSent + stats.totalReceived;

      if (totalVolume > 1) {
        organicTraders.push({
          address,
          volume: totalVolume,
          transactionCount: stats.transactionCount,
          netPosition: stats.netPosition,
        });
      }
    }

    return organicTraders.sort((a, b) => b.volume - a.volume);
  }

  generateReport(
    washTraders: WashTrader[],
    profitability: ProfitabilityResult[],
    organicTraders?: OrganicTrader[]
  ): AnalysisReport {
    const totalVolume = this.transfers.reduce((sum, t) => sum + t.value, 0);

    const washTraderAddresses = new Set(
      washTraders.map((w) => w.address.toLowerCase())
    );

    const washVolume = this.transfers
      .filter(
        (t) =>
          washTraderAddresses.has(t.from.toLowerCase()) ||
          washTraderAddresses.has(t.to.toLowerCase())
      )
      .reduce((sum, t) => sum + t.value, 0);

    const organicVolume = this.transfers
      .filter(
        (t) =>
          !washTraderAddresses.has(t.from.toLowerCase()) &&
          !washTraderAddresses.has(t.to.toLowerCase())
      )
      .reduce((sum, t) => sum + t.value, 0);

    const blockNumbers = this.transfers.map((t) => t.blockNumber);
    const minBlock = Math.min(...blockNumbers.map(Number));
    const maxBlock = Math.max(...blockNumbers.map(Number));

    return {
      summary: {
        totalTransfers: this.transfers.length,
        totalVolume,
        washVolume,
        organicVolume,
        washVolumePercent:
          totalVolume > 0 ? (washVolume / totalVolume) * 100 : 0,
        organicVolumePercent:
          totalVolume > 0 ? (organicVolume / totalVolume) * 100 : 0,
        uniqueAddresses: this.addressStats.size,
        identifiedWashTraders: washTraders.length,
        analysisBlockRange: {
          start: minBlock.toString(),
          end: maxBlock.toString(),
        },
      },
      organicTraders: organicTraders,
      topWashTraders: profitability.slice(0, 10),
      methodology:
        "Analysis based on token transfer patterns, identifying addresses with high volume but low net position changes, repetitive trading patterns, and LP token holdings.",
      analysisTimestamp: new Date().toISOString(),
    };
  }

  printReport(report: AnalysisReport): void {
    console.log("\n" + "=".repeat(70));
    console.log("📊 WASH TRADING ANALYSIS REPORT");
    console.log("=".repeat(70));

    console.log("\n📈 SUMMARY:");
    console.log(
      `   Total Transfers Analyzed: ${report.summary.totalTransfers.toLocaleString()}`
    );
    console.log(
      `   Total Volume: ${report.summary.totalVolume.toFixed(2)} SOL ($${(
        report.summary.totalVolume * CONFIG.SOL_PRICE_USD
      ).toLocaleString()})`
    );
    console.log(
      `   \n   ⚠️  Wash Volume: ${report.summary.washVolume.toFixed(
        2
      )} SOL ($${(
        report.summary.washVolume * CONFIG.SOL_PRICE_USD
      ).toLocaleString()})`
    );
    console.log(
      `       Percentage: ${report.summary.washVolumePercent.toFixed(2)}%`
    );
    console.log(
      `   \n   ✅ Organic Volume: ${report.summary.organicVolume.toFixed(
        2
      )} SOL ($${(
        report.summary.organicVolume * CONFIG.SOL_PRICE_USD
      ).toLocaleString()})`
    );
    console.log(
      `       Percentage: ${report.summary.organicVolumePercent.toFixed(2)}%`
    );
    console.log(`   \n   Unique Addresses: ${report.summary.uniqueAddresses}`);
    console.log(
      `   Wash Traders Identified: ${report.summary.identifiedWashTraders}`
    );
    console.log(
      `   Block Range: ${report.summary.analysisBlockRange.start} - ${report.summary.analysisBlockRange.end}`
    );

    console.log("\n🚨 TOP WASH TRADERS:");
    report.topWashTraders.forEach((trader, i) => {
      console.log(`\n   ${i + 1}. ${trader.address}`);
      console.log(
        `      Volume: ${trader.totalVolume.toFixed(
          2
        )} SOL ($${trader.volumeUSD.toLocaleString()})`
      );
      console.log(
        `      Net Position: ${trader.netPosition.toFixed(4)} SOL (${(
          trader.netPositionRatio * 100
        ).toFixed(3)}%)`
      );
      console.log(`      Transactions: ${trader.transactionCount}`);
      console.log(`      Round-Trip Pairs: ${trader.roundTripCount}`);
      console.log(`      Suspicion Score: ${trader.suspicionScore}/100`);
      console.log(
        `      LP Position: ${
          trader.hasLPPosition ? `✅ ${trader.lpDetails}` : "❌ None detected"
        }`
      );
      console.log(
        `      Est. AERO Rewards: $${trader.estimatedAeroRewards.toFixed(2)}`
      );
      console.log(
        `      Est. Gas Cost: $${trader.estimatedGasCost.toFixed(2)}`
      );
      console.log(
        `      Est. Net Profit: $${trader.estimatedNetProfit.toFixed(
          2
        )} ($${trader.hourlyProfit.toFixed(2)}/hr)`
      );
      console.log(`      ROI: ${trader.roi.toFixed(0)}%`);

      if (trader.topPairs && trader.topPairs.length > 0) {
        console.log(
          `      \n      📊 Sample Transaction Pairs (showing ${Math.min(
            3,
            trader.topPairs.length
          )} of ${trader.roundTripCount}):`
        );
        trader.topPairs.slice(0, 3).forEach((pair, idx) => {
          console.log(`         \n         Pair ${idx + 1}:`);
          console.log(
            `         ├─ Buy:  ${pair.buy.value.toFixed(4)} SOL at ${new Date(
              pair.buy.timestamp
            ).toLocaleTimeString()}`
          );
          console.log(
            `         │  Tx: https://basescan.org/tx/${pair.buy.txHash}`
          );
          console.log(
            `         └─ Sell: ${pair.sell.value.toFixed(4)} SOL at ${new Date(
              pair.sell.timestamp
            ).toLocaleTimeString()}`
          );
          console.log(
            `            Tx: https://basescan.org/tx/${pair.sell.txHash}`
          );
          console.log(
            `            ⏱️  Time: ${Math.floor(
              pair.timeDiff / 60
            )}m ${Math.floor(
              pair.timeDiff % 60
            )}s | 📊 Diff: ${pair.amountDiff.toFixed(2)}% | 💰 Net: ${
              pair.netProfit > 0 ? "+" : ""
            }${pair.netProfit.toFixed(4)} SOL`
          );
        });
      }
    });

    console.log("\n📋 METHODOLOGY:");
    console.log("   Wash traders identified by:");
    console.log(
      "   • High transaction volume with minimal net position change (<5%)"
    );
    console.log("   • Repetitive buy-sell patterns (round trips)");
    console.log("   • Quick turnaround times between transactions");
    console.log("   • Holding LP positions (V3 NFTs or V2 tokens)");
    console.log(
      "   • Trading primarily with same counterparties (pool addresses)"
    );

    console.log("\n📊 VOLUME CALCULATION:");
    console.log("   • Total Volume = Sum of all token transfers");
    console.log(
      "   • Wash Volume = Transfers involving identified wash traders"
    );
    console.log("   • Organic Volume = All other transfers (regular users)");

    console.log("\n" + "=".repeat(70) + "\n");
  }
}

async function runAnalysis(blockRange?: {
  from: number;
  to: number;
}): Promise<AnalysisReport> {
  const analyzer = new VolumeAnalyzer();

  try {
    await analyzer.initialize();

    if (blockRange) {
      await analyzer.getTokenTransfers(blockRange.from, blockRange.to, 100);
    } else {
      await analyzer.getTokenTransfers(undefined, undefined, 100);
    }

    analyzer.analyzeAddresses();
    const washTraders = analyzer.identifyWashTraders();

    const washTraderAddresses = new Set(
      washTraders.map((w) => w.address.toLowerCase())
    );
    const organicTraders = analyzer.identifyOrganicTraders(washTraderAddresses);

    if (washTraders.length > 0) {
      const topAddresses = washTraders.slice(0, 20).map((w) => w.address);
      const lpPositions = await analyzer.checkLPPositions(topAddresses);

      washTraders.forEach((trader) => {
        const positionInfo = lpPositions.get(trader.address);
        trader.hasLPPosition = positionInfo?.hasPosition || false;
        trader.lpDetails = positionInfo?.details || "Not checked";
      });
    }

    const profitability = analyzer.calculateProfitability(washTraders);
    const report = analyzer.generateReport(
      washTraders,
      profitability,
      organicTraders
    );
    analyzer.printReport(report);

    if (organicTraders.length > 0) {
      console.log("\n" + "=".repeat(70));
      console.log("✅ TOP ORGANIC TRADERS (for comparison):");
      console.log("=".repeat(70) + "\n");

      organicTraders.slice(0, 10).forEach((trader, i) => {
        const netRatio = ((trader.netPosition / trader.volume) * 100).toFixed(
          2
        );
        console.log(`   ${i + 1}. ${trader.address}`);
        console.log(
          `      Volume: ${trader.volume.toFixed(2)} SOL ($${(
            trader.volume * CONFIG.SOL_PRICE_USD
          ).toLocaleString()})`
        );
        console.log(`      Transactions: ${trader.transactionCount}`);
        console.log(
          `      Net Position: ${trader.netPosition.toFixed(
            4
          )} SOL (${netRatio}%)`
        );
        console.log(
          `      Profile: ${
            parseInt(netRatio) > 50
              ? "🔴 Likely buyer/seller"
              : parseInt(netRatio) > 10
              ? "🟡 Mixed activity"
              : "🟢 Low net change"
          }`
        );
        console.log("");
      });
    }

    return report;
  } catch (error: any) {
    console.error("❌ Analysis failed:", error.message);
    throw error;
  }
}

export { VolumeAnalyzer, runAnalysis };
export type { AnalysisReport, WashTrader, ProfitabilityResult };
