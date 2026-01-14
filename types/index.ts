/**
 * Type definitions for Token Farming Analyzer
 */

// Types
export interface Transfer {
  from: string;
  to: string;
  value: number;
  timestamp: Date;
  txHash: string;
  blockNumber: string;
}

export interface TransactionPair {
  buy: Transfer;
  sell: Transfer;
  timeDiff: number; // seconds
  amountDiff: number; // percentage
  netProfit: number;
  isPotentialWashTrade: boolean;
}

export interface AddressStats {
  transfers: Transfer[];
  totalSent: number;
  totalReceived: number;
  netPosition: number;
  transactionCount: number;
  firstActivity: string | Date;
  lastActivity: string | Date;
  uniqueCounterparties: Set<string>;
  transactionPairs: TransactionPair[];
}

export interface WashTrader {
  address: string;
  totalVolume: number;
  netPosition: number;
  netPositionRatio: number;
  transactionCount: number;
  suspicionScore: number;
  indicators: {
    highVolume: boolean;
    lowNetPosition: boolean;
    manyTransactions: boolean;
    repetitivePattern: boolean;
  };
  duration: number;
  hasLPPosition?: boolean;
  lpDetails?: string;
  uniqueCounterparties: number;
  avgTimeBetweenTx: number;
  roundTripCount: number;
  topPairs: TransactionPair[];
}

interface SwapToken {
  id: string;
  created: string;
  updated: string;
  network_id: string;
  token_address: string;
  asset_id: string;
  platform: string;
  name: string;
  symbol: string;
  logo_url: string;
  decimals: number;
  created_timestamp: string | null;
  is_strict: boolean;
  is_pumpfun: boolean;
  is_gold_boosted: boolean | null;
  active: boolean;
  is_leverage: boolean | null;
  rugcheck_status: "good" | "warning" | "danger";
}

export interface assetDashTrendingTokenItem {
  swap_token: SwapToken;
  trending_rank: number;
  price_change_24h: number;
  price_usd: number;
}

export interface assetDashTrendingTokensResponse {
  items: assetDashTrendingTokenItem[];
}

// Interfaces remain unchanged
interface TimeMetrics {
  m5: number;
  m30: number;
  h1: number;
  h4: number;
  h8: number;
  h24: number;
}
export interface assetDashToken {
  token_address: string;
  token_symbol: string;
  token_icon: string;
  token_created: number;
  token_decimals: number;
  price_usd: number;
  market_cap_usd: number;
  total_supply: number;
  price_change_percent: TimeMetrics;
  whale_count: TimeMetrics;
  whale_trades_count: TimeMetrics;
  whale_buys_count: TimeMetrics;
  whale_buy_volume_usd: TimeMetrics;
  whale_sells_count: TimeMetrics;
  whale_sell_volume_usd: TimeMetrics;
  whale_net_flow_usd: TimeMetrics;
  whale_buy_amount: TimeMetrics;
  whale_sell_amount: TimeMetrics;
  whale_net_amount: TimeMetrics;
  whale_holder_retention_percent: TimeMetrics;
  whale_buy_supply_percent: TimeMetrics;
  whale_sell_supply_percent: TimeMetrics;
  whale_net_supply_percent: TimeMetrics;
  volume_usd: TimeMetrics;
  liquidity_usd: number;
  transactions_count: TimeMetrics;
  is_new: boolean;
  is_pump: boolean;
  is_pro: boolean;
  is_bonk: boolean;
  is_believe: boolean;
  is_xstocks: null;
  is_ray: boolean;
  antirug_score: number;
  launchpad: null;
  safety_tier: string;
  score_values: TimeMetrics;
}

export interface ApiResponse<D> {
  success: boolean;
  message: string;
  data?: [] | D;
}

export interface assetDashTokenListResponse {
  items: assetDashToken[];
}

export interface TokenDetails {
  symbol: string;
  name: string;
  icon: string;
  id: string;
  pool_id: string;
  decimals: number;
}

export interface TokenStats {
  market_cap: number;
  price_usd: number;
  volume: number;
  supply: number;
  liquidity: number;
  holders: number;
}

export interface JupiterPriceData {
  createdAt: string;
  liquidity: number;
  usdPrice: number;
  blockId: number;
  decimals: number;
  priceChange24h: number;
}

// Use an index signature because the mint address (key) changes per token
export interface JupiterNativePriceResponse {
  [mintAddress: string]: JupiterPriceData;
}
interface TokenPool {
  sources: string[];
  metrics: {
    m5: { price_variation: number; volume: number; transactions: any };
    m15: { price_variation: number; volume: number; transactions: any };
    h1: { price_variation: number; volume: number; transactions: any };
    h6: { price_variation: number; volume: number; transactions: any };
    h24: { price_variation: number; volume: number; transactions: any };
  };
  ids: string[];
  pooled: {
    token: number;
    native: number;
    nativeTokenName: string;
  };
  created_at: string;
}
export interface assetDashTokenData {
  stats: TokenStats;
  details: TokenDetails;
  pools: TokenPool;
  native_token_price: number;
}

export interface assetDashOHCLV {
  s: string;
  t: number[];
  o: number[];
  h: number[];
  l: number[];
  c: number[];
  v: number[];
}
export interface assetDashNativePriceResponse {
  sol: number;
  moby: number;
}
export interface ProfitabilityResult extends WashTrader {
  volumeUSD: number;
  estimatedAeroRewards: number;
  estimatedGasCost: number;
  estimatedNetProfit: number;
  hourlyProfit: number;
  roi: number;
}

export interface AnalysisReport {
  summary: {
    totalTransfers: number;
    totalVolume: number;
    washVolume: number;
    organicVolume: number;
    washVolumePercent: number;
    organicVolumePercent: number;
    uniqueAddresses: number;
    identifiedWashTraders: number;
    analysisBlockRange: {
      start: string;
      end: string;
    };
  };
  organicTraders?: OrganicTrader[];
  topWashTraders: ProfitabilityResult[];
  methodology: string;
  analysisTimestamp: string;
}

export interface OrganicTrader {
  address: string;
  volume: number;
  transactionCount: number;
  netPosition: number;
}
// Configuration Types
export interface AnalysisConfig {
  buyVolumeTolerance?: number; // Default: 0.05 (5%)
  timeWindowMinutes?: number; // Default: 5
  minTransactionsForClustering?: number; // Default: 3
  spreadAssumption?: number; // Default: 0.005 (0.5%)
  gasPrice?: number; // Default: 0.001 ETH
}

// API Response Types
export interface APIResponse<T> {
  status: number;
  data: T;
  message?: string;
  error?: string;
}

// Blockchain Network Types
export type BlockchainNetwork = "base" | "etherscan" | "polygonscan";

export interface BlockchainNetworkConfig {
  name: string;
  key: BlockchainNetwork;
  apiUrl: string;
  explorer: string;
}

// Data Import Types
export interface DataImportResponse {
  transactions: Transfer[];
  source: string;
  timestamp: string;
  count: number;
}

// Pagination Types
export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// Filter Types
export interface WalletFilter {
  volumeMin?: number;
  volumeMax?: number;
  profitMin?: number;
  profitMax?: number;
  txCountMin?: number;
  classification?: "all" | "organic" | "farmed" | "suspicious";
  searchAddress?: string;
}

// Wash Trading Analysis Types
export interface AnalysisBlockRange {
  start: string;
  end: string;
}

// Export Types
export interface ExportOptions {
  format: "csv" | "json";
  includeTransactions?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
}

// UI State Types
export interface UIState {
  activeTab: "dashboard" | "transactions" | "volume" | "farming" | "aero";
  selectedWallet?: string;
  expandedWallets: Set<string>;
  filters: WalletFilter;
}

// Notification Types
export interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "error";
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Chart Data Types
export interface ChartDataPoint {
  [key: string]: string | number | undefined;
  date?: string;
  name?: string;
}

// Loading State Types
export interface LoadingState {
  isLoading: boolean;
  error?: Error | null;
  progress?: number;
}
