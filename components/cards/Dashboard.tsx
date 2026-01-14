import { useEffect, useState } from "react";
import { useAnalyseData } from "@/hooks/useAnalyseData";
import { useCacheStore } from "@/store/cacheStore";
import { WashGaugeCard } from "./GaugeCard";
import { OverviewCard } from "./OverviewCard";
import KeyAddressesBreakdown from "./AddressesCard";
import { useThemeStore } from "@/store/themeStore";
import WashTradersList from "./WashTraderList";
import OrganicTradersList from "./OrganicTraderList";
import StatusBadge from "@/components/StatusBadge";
import { DashboardSkeleton } from "@/components/ui/SkeletonCards";
import { AnalysisReport } from "@/types";
import NoteBadge from "../NoteBadge";

type StatusType = "updating" | "stale" | "hidden" | "cached-data" | "demo-data";
type NoteType = "available" | "hidden";

export const Dashboard = () => {
  const {
    report,
    runAnalysisBackground,
    isBackgroundLoading,
    error: hookError,
  } = useAnalyseData();
  const { isDark } = useThemeStore();
  const { getCachedAnalysis, cacheMetadata, isDataStale } = useCacheStore();

  const [displayedReport, setDisplayedReport] = useState<AnalysisReport | null>(
    null
  );
  const [statusBadge, setStatusBadge] = useState<StatusType>("hidden");
  const [noteBadge, setNoteBadge] = useState<NoteType>("hidden");
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);
  const [hasTriggeredBackground, setHasTriggeredBackground] = useState(false);

  // On mount: Load cached data and trigger background refresh
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Check if we have cached data
        const cachedData = getCachedAnalysis();

        if (cachedData) {
          // We have cached data - show it immediately
          console.log("[Dashboard] Found cached data, displaying it");
          setDisplayedReport(cachedData);
          setNoteBadge("available");

          // Check if it's stale
          const stale = isDataStale();
          if (stale) {
            console.log("[Dashboard] Cached data is stale, will refresh");
            setStatusBadge("stale");
          }

          // Trigger background refresh without blocking UI
          if (!hasTriggeredBackground) {
            console.log("[Dashboard] Triggering background analysis");
            setStatusBadge("updating");
            runAnalysisBackground();
            setHasTriggeredBackground(true);
          }
        } else {
          // No cached data - show skeleton and trigger analysis
          console.log("[Dashboard] No cached data found, showing skeleton");
          setStatusBadge("updating");

          if (!hasTriggeredBackground) {
            runAnalysisBackground();
            setHasTriggeredBackground(true);
          }
        }
      } catch (error) {
        console.error("[Dashboard] Error during initialization:", error);
      }
    };

    initializeData();
  }, []);

  // When fresh data arrives from background analysis, update display
  useEffect(() => {
    // Check if report has actual data (not just empty object)
    const fetchData = async () => {
      const hasData =
        report &&
        (report.topWashTraders?.length > 0 || report.summary.totalVolume > 0);

      if (hasData) {
        console.log("[Dashboard] Fresh data received, updating display", {
          traders: report.topWashTraders?.length,
          volume: report.summary.totalVolume,
          isBackgroundLoading,
        });
        setDisplayedReport(report);
        setNoteBadge("available");
        if (!isBackgroundLoading && !hookError) {
          setStatusBadge("hidden");
        }
      }
    };
    fetchData();
  }, [report, isBackgroundLoading, hookError]);

  // Track when background loading starts/stops
  useEffect(() => {
    if (isBackgroundLoading) {
      setStatusBadge("updating");
    }
  }, [isBackgroundLoading]);

  // Store last updated timestamp when cache metadata changes
  useEffect(() => {
    if (cacheMetadata.lastUpdatedAt) {
      setLastUpdatedAt(cacheMetadata.lastUpdatedAt);
    }
  }, [cacheMetadata]);

  // Track error messages from hook and map to badge status
  useEffect(() => {
    if (hookError) {
      // Check if report has actual data
      const hasData =
        report &&
        (report.topWashTraders?.length > 0 || report.summary.totalVolume > 0);

      // Map error message to appropriate badge status
      if (hookError.includes("cached data")) {
        console.log("[Dashboard] Showing cached data warning");
        setStatusBadge("cached-data");
        if (hasData) {
          setDisplayedReport(report);
        }
      } else if (hookError.includes("demo data")) {
        console.log("[Dashboard] Showing demo data warning");
        setStatusBadge("demo-data");
        setNoteBadge("available");
        if (hasData) {
          console.log(
            "[Dashboard] Setting displayed report with demo data",
            report
          );
          setDisplayedReport(report);
        }
      }
    }
  }, [hookError, report]);

  // Show skeleton if we don't have any data yet
  if (!displayedReport) {
    return (
      <div className="w-full h-auto">
        <div className="py-2 px-3">
          <StatusBadge status={statusBadge} lastUpdatedAt={lastUpdatedAt} />
        </div>
        <div className="py-2 px-3 mt-4">
          <DashboardSkeleton />
        </div>
      </div>
    );
  }

  // Display with fade transition
  return (
    <div className="w-full h-auto transition-opacity duration-300">
      {/* Status Badge */}
      <div className="py-2 px-3 w-12">
        <StatusBadge status={statusBadge} lastUpdatedAt={lastUpdatedAt} />
      </div>
      <div className="py-2 px-3">
        <NoteBadge status={noteBadge} data={displayedReport?.methodology} />
      </div>

      {/* Loading Overlay - Show skeleton on top while fetching */}
      {isBackgroundLoading && displayedReport && (
        <div className="py-2 px-3 opacity-40 pointer-events-none">
          <DashboardSkeleton />
        </div>
      )}

      {/* Main Content */}
      <div className="py-2 w-full gap-2 h-auto mt-2 px-3 flex transition-opacity duration-300">
        <div className="h-auto w-[73%]">
          <OverviewCard
            title="Overview"
            totalVolume={displayedReport?.summary.totalVolume || 0}
            organicVolume={displayedReport?.summary.organicVolume || 0}
            organicVolumePercent={displayedReport?.summary.organicVolumePercent}
            washVolumePercent={displayedReport?.summary.washVolumePercent}
            washVolume={displayedReport?.summary.washVolume || 0}
            totalTransfers={displayedReport?.summary.totalTransfers || 0}
            totalAddressCount={
              displayedReport?.summary.identifiedWashTraders || 0
            }
            data={displayedReport}
            isDark={isDark}
          />
        </div>
        <div className="w-[27%]">
          <KeyAddressesBreakdown
            uniqueAddresses={displayedReport?.summary.uniqueAddresses || 0}
            identifiedWashTraders={
              displayedReport?.summary.identifiedWashTraders || 0
            }
          />
        </div>
      </div>

      <div className="py-2 flex px-3  w-full items-center justify-between">
        <WashGaugeCard
          isDark={isDark}
          isOrganic
          washVolume={displayedReport?.summary.washVolume || 0}
          organicVolume={displayedReport?.summary.organicVolume || 0}
          netVolume={displayedReport?.summary.totalVolume || 0}
          washVolumePercent={displayedReport?.summary.washVolumePercent || 0}
          organicVolumePercent={
            displayedReport?.summary.organicVolumePercent || 0
          }
          startBlock={displayedReport?.summary.analysisBlockRange?.start || ""}
          endBlock={displayedReport?.summary.analysisBlockRange?.end || ""}
        />
      </div>

      <div className="py-2 flex px-3  w-full items-center justify-between">
        <OrganicTradersList report={displayedReport} />
      </div>

      <div className="py-2 flex px-3  w-full items-center justify-between">
        <WashTradersList report={displayedReport} />
      </div>
    </div>
  );
};
