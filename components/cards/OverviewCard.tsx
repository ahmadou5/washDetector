import { useSolanaPrice } from "@/hooks/useNativePrice";
import { AnalysisReport } from "@/types";

export const OverviewCard = ({
  title,
  totalVolume,
  washVolume,
  washVolumePercent,
  organicVolumePercent,
  organicVolume,
  totalTransfers,
  isDark,
}: {
  title: string;
  totalVolume: number;
  washVolume: number;
  washVolumePercent?: number;
  organicVolumePercent?: number;
  organicVolume: number;
  totalTransfers: number;
  data: AnalysisReport | null;
  totalAddressCount: number;
  isDark: boolean;
}) => {
  const { price } = useSolanaPrice();
  return (
    <div
      className={`rounded-2xl py-5 px-4 transition-colors relative w-auto ${
        isDark
          ? "bg-gradient-to-br from-gray-800 to-gray-900"
          : "bg-gradient-to-br from-gray-100 to-gray-200"
      } shadow-xl`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle, ${
              isDark ? "#fff" : "#000"
            } 1px, transparent 1px)`,
            backgroundSize: "20px 20px",
          }}
        ></div>
      </div>
      <div className="flex items-center ml-3 mr-3s justify-between mb-0">
        <span
          className={`text-lg ${isDark ? "text-gray-200" : "text-gray-600"}`}
        >
          {title}
        </span>
      </div>
      <div className=" flex py-3 px-0">
        <DataCard
          value={"Net Flow"}
          netVolume={totalVolume}
          isDark={isDark}
          netPercent={0}
          isAll={true}
          solanaPrice={price || 0}
          isFirst
          isWithVolume
        />

        <DataCard
          isFirst={false}
          netVolume={organicVolume}
          value={"Organic Volume"}
          isOrganic
          isWithVolume
          solanaPrice={price || 0}
          isDark={isDark}
          netPercent={organicVolumePercent}
        />
        <DataCard
          value={"Wash Volume"}
          netVolume={washVolume}
          isDark={isDark}
          isFirst={false}
          isWash
          isWithVolume
          solanaPrice={price || 0}
          netPercent={washVolumePercent}
        />
        <DataCard
          isFirst={false}
          netVolume={totalTransfers}
          isOrganic
          isWithVolume={false}
          isDark={isDark}
          netPercent={0}
          value={"Total Transfer count"}
        />
      </div>
    </div>
  );
};

const DataCard = ({
  isFirst,
  isDark,
  isWithVolume,
  isOrganic,
  isWash,
  isAll,
  netVolume,
  solanaPrice,
  netPercent,
  value,
}: {
  isFirst: boolean;
  isDark: boolean;
  isWithVolume?: boolean;
  isOrganic?: boolean;
  isWash?: boolean;
  isAll?: boolean;
  netVolume: number;
  solanaPrice?: number;
  netPercent?: number;
  value: string;
}) => {
  return (
    <div
      className={`ml-1 mr-1 px-0 ${
        isFirst ? "" : "border-l px-3 border-gray-600"
      }`}
    >
      <div
        className={`text-2xl ml-2 mr-2 
           font-semibold flex  mb-1 ${
             isAll ? (isDark ? "text-white" : "text-gray-900") : ""
           }  ${isWash && "text-red-400"} ${isOrganic && "text-green-500"} $`}
      >
        {`${netVolume.toLocaleString()}`}
        <p
          className={`text-xl ml-1 mr-1 flex mb-1 ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          {isWithVolume ? "SOL" : "txns"}
        </p>
      </div>

      <div
        className={`text-base ml-2 mr-2 flex mb-1 ${
          isDark ? "text-white" : "text-gray-900"
        }`}
      >
        {isWithVolume && solanaPrice && (
          <>
            <p>$</p>
            {(netVolume * solanaPrice).toLocaleString()}
            <p className="ml-1 mr-1 text-xl font-light">USD</p>
          </>
        )}
      </div>

      <div
        className={`text-base ml-2 mr-2 ${
          isWithVolume ? "2" : "mt-8"
        } flex mb-1 ${isDark ? "text-white" : "text-gray-900"}`}
      >
        {value}
        {netPercent !== 0 && (
          <p className="flex items-end justify-end ml-4 mr-2">{`${netPercent?.toLocaleString()}%`}</p>
        )}
      </div>
    </div>
  );
};

// Unused component - commented out
/*
// const DataCard2 = ({
  isFirst,
  isDark,
  isOrganic,
  isWash,
  isAll,
  totalAddresses,
  isWithVolume,
  organicTraders,
  washTraders,
  value,
}: {
  isFirst: boolean;
  isDark: boolean;
  isWithVolume?: boolean;
  isOrganic?: boolean;
  isWash?: boolean;
  isAll?: boolean;
  totalAddresses: number;
  organicTraders?: number;
  washTraders?: number;
  value: string;
}) => {
  if (!washTraders)
    return (
      <div
        className={`ml-1 mr-1 px-0 ${
          isFirst ? "" : "border-l px-3 border-gray-600"
        }`}
      >
        <div
          className={`text-2xl ml-2 mr-2 
           font-semibold flex  mb-1 ${
             isAll ? (isDark ? "text-white" : "text-gray-900") : ""
           }  ${isWash && "text-amber-300"} ${isOrganic && "text-green-500"} $`}
        >
          {`${
            isOrganic && washTraders
              ? totalAddresses - washTraders
              : washTraders?.toLocaleString()
          }`}
          <p
            className={`text-xl ml-1 mr-1 flex mb-1 ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            {"Traders"}
          </p>
        </div>

        <p
          className={`text-base ml-2 mr-2 flex mb-1 ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          {isWithVolume && (
            <>
              <p>$</p>
              {(4 * 141).toLocaleString()}
              <p className="ml-1 mr-1 text-xl font-light">USD</p>
            </>
          )}
        </p>

        <div
          className={`text-base ml-2 mr-2 flex mb-1 ${
            isWithVolume ? "2" : "mt-8"
          } ${isDark ? "text-white" : "text-gray-900"}`}
        >
          {value}
        </div>
      </div>
    );
// };
*/
