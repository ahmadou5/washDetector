import { useState } from "react";
import { useThemeStore } from "@/store/themeStore";

const KeyAddressesBreakdown = ({
  uniqueAddresses,
  identifiedWashTraders,
}: {
  uniqueAddresses: number;
  identifiedWashTraders: number;
}) => {
  const { isDark } = useThemeStore();
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  const organicTraders = uniqueAddresses - identifiedWashTraders;

  // Calculate percentages
  const washPercent =
    ((identifiedWashTraders / uniqueAddresses) * 100).toFixed(0) || 0;
  const organicPercent =
    ((organicTraders / uniqueAddresses) * 100).toFixed(0) || 0;

  const categories = [
    {
      label: "Organic",
      count: organicTraders,
      percentage: organicPercent,
      gradient: "from-green-500 to-green-600",
      glowColor: "rgba(34, 197, 94, 0.5)",
      textColor: isDark ? "text-green-500" : "text-green-500",
      bgLight: "bg-green-500/10",
    },
    {
      label: "Wash",
      count: identifiedWashTraders,
      percentage: washPercent,
      gradient: "from-red-500 to-red-600",
      glowColor: "rgba(239, 68, 68, 0.5)",
      textColor: isDark ? "text-red-400" : "text-red-600",
      bgLight: "bg-red-500/10",
    },
  ];

  return (
    <div
      className={`rounded-2xl py-5 px-4 transition-all w-full relative overflow-hidden ${
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

      <div className="relative z-10">
        {/* Total Count */}
        <div className="mb-2">
          <span
            className={`text-4xl font-bold ${
              isDark ? "text-green-500" : "text-green-500"
            }`}
          >
            {uniqueAddresses}
          </span>
          <span
            className={`ml-1 text-lg ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}
          >
            addresses
          </span>
        </div>

        {/* Enhanced Bar Chart */}
        <div
          className="flex items-end gap-4 mb-0 w-[55%] ml-auto"
          style={{ height: "100px" }}
        >
          {categories.map((category, index) => {
            const maxHeight = 100;
            const barHeight = (category.count / uniqueAddresses) * maxHeight;
            const isHovered = hoveredBar === index;

            return (
              <div
                key={index}
                className="flex-1 flex flex-col items-center justify-end"
                onMouseEnter={() => setHoveredBar(index)}
                onMouseLeave={() => setHoveredBar(null)}
              >
                {/* Percentage Label */}
                <div
                  className={`text-3xl font-bold mb-3 transition-all ${
                    isDark ? "text-white" : "text-gray-900"
                  } ${isHovered ? "scale-110" : "scale-100"}`}
                >
                  {category.percentage}%
                </div>

                {/* Bar Container */}
                <div className="relative w-full">
                  {/* Glow Effect */}
                  {isHovered && (
                    <div
                      className={`absolute inset-0 bg-gradient-to-t ${category.gradient} blur-xl opacity-50 rounded-t-2xl transition-all duration-300`}
                      style={{
                        height: `${barHeight + 15}px`,
                        bottom: 0,
                      }}
                    ></div>
                  )}

                  {/* Main Bar */}
                  <div
                    className={`relative w-full bg-gradient-to-t ${category.gradient} rounded-t-2xl transition-all duration-500 cursor-pointer shadow-xl`}
                    style={{
                      height: `${barHeight}px`,
                      minHeight: "50px",
                      transform: isHovered ? "scale(1.05)" : "scale(1)",
                    }}
                  >
                    {/* Shine Effect */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent rounded-t-2xl"></div>

                    {/* Count Badge */}
                    <div
                      className={`absolute top-4 left-1/2 transform -translate-x-1/2 px-2 py-1 rounded-full font-bold text-white shadow-lg transition-all ${
                        isHovered ? "scale-110" : "scale-100"
                      }`}
                      style={{
                        background: "rgba(0, 0, 0, 0.3)",
                        backdropFilter: "blur(8px)",
                      }}
                    >
                      {category.count}
                    </div>

                    {/* Bottom Glow Line */}
                    <div
                      className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${category.gradient} blur-sm`}
                    ></div>
                  </div>
                </div>

                {/* Label */}
                <div
                  className={`mt-2 text-center text-base font-semibold transition-all ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  } ${isHovered ? "scale-105" : "scale-100"}`}
                >
                  {category.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default KeyAddressesBreakdown;
