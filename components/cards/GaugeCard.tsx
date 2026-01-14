import { useSolanaPrice } from "@/hooks/useNativePrice";

export const WashGaugeCard = ({
  isDark,
  startBlock,
  endBlock,
  netVolume,
  washVolume,
  washVolumePercent,
  organicVolume,
  organicVolumePercent,
}: {
  isDark: boolean;
  startBlock: string;
  endBlock: string;
  netVolume: number;
  organicVolumePercent: number;
  washVolumePercent: number;
  organicVolume: number;
  washVolume: number;
  isOrganic?: boolean;
}) => {
  // Calculate the gauge arc
  const { price } = useSolanaPrice();
  const OrganicPercentage = organicVolumePercent;
  const WashPercentage = washVolumePercent;
  const radius = 80;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius * 0.95; // 270 degrees
  const Ooffset = circumference - (OrganicPercentage / 100) * circumference;
  const Woffset = circumference - (WashPercentage / 100) * circumference;
  return (
    <div
      className={`rounded-2xl w-full  p-6 transition-colors ${
        isDark
          ? "bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700"
          : "bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-200"
      } shadow-xl`}
    >
      {/* Stats Row */}
      <div className="flex justify-between mb-6">
        <div>
          <div
            className={`text-2xl font-bold ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            {startBlock}
          </div>
          <div
            className={`text-xs ${isDark ? "text-gray-500" : "text-gray-500"}`}
          >
            Start Block
          </div>
        </div>
        <div className="text-right">
          <div
            className={`text-2xl font-bold ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            {endBlock}
          </div>
          <div
            className={`text-xs ${isDark ? "text-gray-500" : "text-gray-500"}`}
          >
            End Block
          </div>
        </div>
      </div>

      {/* Gauge Container - Responsive layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-amber-950/0 mb-6">
        <div className="flex justify-center items-center">
          <div className="relative">
          <svg width="320" height="210" viewBox="0 0 220 180">
            {/* Background Arc */}
            <path
              d="M 30 140 A 80 80 0 1 1 190 140"
              fill="none"
              stroke={isDark ? "#374151" : "#E5E7EB"}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />

            {/* Progress Arc */}
            <path
              d="M 30 140 A 80 80 0 1 1 190 140"
              fill="none"
              stroke="rgba(34, 197, 94, 0.9)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={Ooffset}
              style={{
                transition: "stroke-dashoffset 1s ease-in-out",
                transform: "rotate(0deg)",
                transformOrigin: "center",
              }}
            />
          </svg>

          {/* Center Text */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center"
            style={{ marginTop: "60px" }}
          >
            <div className={`text-xl font-bold ${"text-green-500"}`}>
              {OrganicPercentage?.toLocaleString()}%
            </div>
            <div
              className={`text-sm mt-2 ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Organic Volume
            </div>
          </div>
        </div>
       </div>
        <div className="flex justify-center items-center">
          <div className="relative">
          <svg width="320" height="210" viewBox="0 0 220 180">
            {/* Background Arc */}
            <path
              d="M 30 140 A 80 80 0 1 1 190 140"
              fill="none"
              stroke={isDark ? "#374151" : "#E5E7EB"}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />

            {/* Progress Arc */}
            <path
              d="M 30 140 A 80 80 0 1 1 190 140"
              fill="none"
              stroke="rgba(239, 68, 68, 0.9)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={Woffset}
              style={{
                transition: "stroke-dashoffset 1s ease-in-out",
                transform: "rotate(0deg)",
                transformOrigin: "center",
              }}
            />
          </svg>

          {/* Center Text */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center"
            style={{ marginTop: "60px" }}
          >
            <div className={`text-xl font-bold text-red-400`}>
              {WashPercentage.toLocaleString()}%
            </div>
            <div
              className={`text-sm mt-2 ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Wash Volume
            </div>
          </div>
        </div>
       </div>
      </div>

      {/* Bottom Stats */}
      <div
        className={`pt-4 border-t ${
          isDark ? "border-gray-700" : "border-gray-200"
        }`}
      >
        <div className="flex justify-between items-center">
          <div>
            <div
              className={`text-xs ${
                isDark ? "text-gray-500" : "text-gray-500"
              }`}
            >
              Net Trading Volume
            </div>
            <div
              className={`text-lg font-semibold flex ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              {netVolume.toLocaleString()}
              <p
                className={`text-xs ml-1 mr-1 flex mb-1 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                {"SOL"}
              </p>
            </div>
            <div
              className={`text-base flex mb-1 ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              <p>{`$`}</p>
              {(netVolume * price).toLocaleString()}
              <p className="ml-1 mr-1 text-xl font-light">USD</p>
            </div>
          </div>
          <div className="text-center">
            <div
              className={`text-xs ${
                isDark ? "text-gray-500" : "text-gray-500"
              }`}
            >
              Organic Trading Volume
            </div>
            <div
              className={`text-lg flex font-semibold ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              {organicVolume.toLocaleString()}
              <p
                className={`text-xs ml-1 mr-1 flex mb-1 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                {"SOL"}
              </p>
            </div>
            <div
              className={`text-base flex mb-1 ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              {
                <>
                  <p>$</p>
                  {(organicVolume * price).toLocaleString()}
                  <p className="ml-1 mr-1 text-xl font-light">USD</p>
                </>
              }
            </div>
          </div>
          <div className="text-left">
            <div
              className={`text-xs ${
                isDark ? "text-gray-500" : "text-gray-500"
              }`}
            >
              Wash Trading Volume
            </div>
            <div
              className={`text-lg flex font-semibold ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              {washVolume.toLocaleString()}
              <p
                className={`text-xs ml-1 mr-1 flex mb-1 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                {"SOL"}
              </p>
            </div>
            <div
              className={`text-base flex mb-1 ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              {
                <>
                  <p>$</p>
                  {(washVolume * price).toLocaleString()}
                  <p className="ml-1 mr-1 text-xl font-light">USD</p>
                </>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
