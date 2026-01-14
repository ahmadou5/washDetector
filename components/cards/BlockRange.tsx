import React, { useState, forwardRef, useImperativeHandle } from "react";
import { RefreshCw, X, Search, Check } from "lucide-react";
import { useThemeStore } from "@/store/themeStore";
import { useBlockData } from "@/hooks/useBlockData";

interface BlockRangeSelectorProps {
  onUpdate?: (startBlock: number, endBlock: number) => void;
}

export interface Block {
  number: number;
}

export interface BlockRangeSelectorHandle {
  openModal: () => void;
  closeModal: () => void;
  getBlockRange: () => { startBlock: number; endBlock: number };
}

const BlockRangeSelector = forwardRef<
  BlockRangeSelectorHandle,
  BlockRangeSelectorProps
>(({ onUpdate }, ref) => {
  const { isDark } = useThemeStore();
  const { recentBlocks, latestBlock: EndBlock } = useBlockData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [startBlock, setStartBlock] = useState<number>(0);
  const [endBlock, setEndBlock] = useState<number>(0);
  const [isStartDropdownOpen, setIsStartDropdownOpen] = useState(false);
  const [isEndDropdownOpen, setIsEndDropdownOpen] = useState(false);
  const [startSearchQuery, setStartSearchQuery] = useState("");
  const [endSearchQuery, setEndSearchQuery] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  // Fetch real blocks from API on mount
  React.useEffect(() => {
    const fetchBlocks = async () => {
      setEndBlock(EndBlock.number);
    };

    fetchBlocks();
  }, []);

  // Fallback blocks if API fails

  const filteredStartBlocks = recentBlocks.filter((block) =>
    block.number.toString().includes(startSearchQuery)
  );

  const filteredEndBlocks = recentBlocks.filter((block) =>
    block.number.toString().includes(endSearchQuery)
  );

  const handleUpdate = () => {
    setValidationError(null);

    const startNum = startBlock;
    const endNum = endBlock;

    // Validate block range FIRST
    if (isNaN(startNum) || isNaN(endNum) || startNum === 0) {
      setValidationError("Please select valid block numbers");
      return;
    }

    if (startNum >= endNum) {
      setValidationError("Start block must be less than end block");
      return;
    }

    if (endNum - startNum > 10000) {
      setValidationError("Block range cannot exceed 10,000 blocks");
      return;
    }

    console.log("[BlockRangeSelector] Updating analysis with blocks:", {
      startBlock: startNum,
      endBlock: endNum,
    });

    // Trigger analysis with new block range via callback
    if (onUpdate) {
      console.log("[BlockRangeSelector] Calling onUpdate callback");
      onUpdate(startNum, endNum);
    } else {
      console.warn("[BlockRangeSelector] onUpdate callback not provided!");
    }

    // Reset modal state
    setIsModalOpen(false);
    setIsStartDropdownOpen(false);
    setIsEndDropdownOpen(false);
    setStartSearchQuery("");
    setEndSearchQuery("");
    setValidationError(null);
  };

  useImperativeHandle(ref, () => ({
    openModal: () => setIsModalOpen(true),
    closeModal: () => setIsModalOpen(false),
    getBlockRange: () => ({
      startBlock: startBlock,
      endBlock: endBlock,
    }),
  }));

  const handleSelectStartBlock = (blockNumber: number) => {
    setStartBlock(blockNumber);
    setIsStartDropdownOpen(false);
    setStartSearchQuery("");
  };

  const handleSelectEndBlock = (blockNumber: number) => {
    setEndBlock(blockNumber);
    setIsEndDropdownOpen(false);
    setEndSearchQuery("");
  };

  return (
    <>
      <div className="flex justify-center">
        <button
          onClick={() => setIsModalOpen(true)}
          className={`flex items-center gap-3 px-4 py-2 rounded-xl font-semibold ${
            isDark ? "text-white" : "text-gray-900"
          } transition-all ${
            isDark
              ? "bg-gradient-to-br from-gray-800 to-gray-900"
              : "bg-gradient-to-br from-gray-100 to-gray-200"
          } shadow-lg hover:shadow-xl transform hover:scale-105`}
        >
          <RefreshCw className="w-5 h-5" />
          Update Analysis Block Range
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className={`w-full max-w-2xl rounded-2xl shadow-2xl ${
              isDark
                ? "bg-gray-900 border border-gray-800"
                : "bg-white border border-gray-200"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              className={`flex items-center justify-between p-6 border-b ${
                isDark ? "border-gray-800" : "border-gray-200"
              }`}
            >
              <div>
                <h2
                  className={`text-2xl font-bold ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  Update Analysis Block Range
                </h2>
                <p
                  className={`text-sm mt-1 ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Select the start and end blocks for your analysis
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className={`p-2 rounded-lg transition-colors ${
                  isDark
                    ? "hover:bg-gray-800 text-gray-400"
                    : "hover:bg-gray-100 text-gray-600"
                }`}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Validation Error Display */}
            {validationError && (
              <div
                className={`mx-6 mt-4 p-4 rounded-lg border-l-4 ${
                  isDark
                    ? "bg-red-950 border-red-600 text-red-200"
                    : "bg-red-50 border-red-400 text-red-800"
                }`}
              >
                <p className="font-semibold text-sm">⚠️ {validationError}</p>
                <p className="text-xs mt-1 opacity-90">
                  End block must be greater than start block, and range cannot
                  exceed 10,000 blocks
                </p>
              </div>
            )}

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Start Block Selector */}
              <div>
                <label
                  className={`block text-sm font-semibold mb-2 ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Start Block
                </label>
                <div className="relative">
                  <button
                    onClick={() => {
                      setIsStartDropdownOpen(!isStartDropdownOpen);
                      setIsEndDropdownOpen(false);
                    }}
                    className={`w-full px-4 py-3 rounded-lg text-left font-mono transition-all ${
                      isDark
                        ? "bg-gray-800 hover:bg-gray-750 text-white border border-gray-700"
                        : "bg-gray-50 hover:bg-gray-100 text-gray-900 border border-gray-300"
                    }`}
                  >
                    {startBlock}
                  </button>

                  {/* Start Block Dropdown */}
                  {isStartDropdownOpen && (
                    <div
                      className={`absolute z-10 w-full mt-2 rounded-xl shadow-2xl overflow-hidden ${
                        isDark
                          ? "bg-gray-800 border border-gray-700"
                          : "bg-white border border-gray-200"
                      }`}
                    >
                      {/* Search Input */}
                      <div className="p-3 border-b border-gray-700">
                        <div className="relative">
                          <Search
                            className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                              isDark ? "text-gray-400" : "text-gray-500"
                            }`}
                          />
                          <input
                            type="text"
                            placeholder="Search block number..."
                            value={startSearchQuery}
                            onChange={(e) =>
                              setStartSearchQuery(e.target.value)
                            }
                            className={`w-full pl-10 pr-4 py-2 rounded-lg text-sm ${
                              isDark
                                ? "bg-gray-900 text-white border border-gray-700 focus:border-blue-500"
                                : "bg-gray-50 text-gray-900 border border-gray-300 focus:border-blue-500"
                            } outline-none transition-colors`}
                          />
                        </div>
                      </div>

                      {/* Block List */}
                      <div className="max-h-64 overflow-y-auto">
                        {filteredStartBlocks.map((block) => (
                          <button
                            key={block.number}
                            onClick={() => handleSelectStartBlock(block.number)}
                            className={`w-full px-4 py-3 text-left transition-colors flex items-center justify-between ${
                              startBlock === block.number
                                ? isDark
                                  ? "bg-blue-600/20 text-blue-400"
                                  : "bg-blue-50 text-blue-600"
                                : isDark
                                ? "hover:bg-gray-750 text-white"
                                : "hover:bg-gray-50 text-gray-900"
                            }`}
                          >
                            <div>
                              <div className="font-mono font-semibold">
                                {block.number}
                              </div>
                            </div>
                            {startBlock === block.number && (
                              <Check className="w-5 h-5" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* End Block Selector */}
              <div>
                <label
                  className={`block text-sm font-semibold mb-2 ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  End Block
                </label>
                <div className="relative">
                  <button
                    onClick={() => {
                      setIsEndDropdownOpen(!isEndDropdownOpen);
                      setIsStartDropdownOpen(false);
                    }}
                    className={`w-full px-4 py-3 rounded-lg text-left font-mono transition-all ${
                      isDark
                        ? "bg-gray-800 hover:bg-gray-750 text-white border border-gray-700"
                        : "bg-gray-50 hover:bg-gray-100 text-gray-900 border border-gray-300"
                    }`}
                  >
                    {endBlock}
                  </button>

                  {/* End Block Dropdown */}
                  {isEndDropdownOpen && (
                    <div
                      className={`absolute z-10 w-full mt-2 rounded-xl shadow-2xl overflow-hidden ${
                        isDark
                          ? "bg-gray-800 border border-gray-700"
                          : "bg-white border border-gray-200"
                      }`}
                    >
                      {/* Search Input */}
                      <div className="p-3 border-b border-gray-700">
                        <div className="relative">
                          <Search
                            className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                              isDark ? "text-gray-400" : "text-gray-500"
                            }`}
                          />
                          <input
                            type="text"
                            placeholder="Search block number..."
                            value={endSearchQuery}
                            onChange={(e) => setEndSearchQuery(e.target.value)}
                            className={`w-full pl-10 pr-4 py-2 rounded-lg text-sm ${
                              isDark
                                ? "bg-gray-900 text-white border border-gray-700 focus:border-blue-500"
                                : "bg-gray-50 text-gray-900 border border-gray-300 focus:border-blue-500"
                            } outline-none transition-colors`}
                          />
                        </div>
                      </div>

                      {/* Latest Option */}
                      <button
                        onClick={() =>
                          handleSelectEndBlock(recentBlocks[0].number)
                        }
                        className={`w-full px-4 py-3 text-left transition-colors flex items-center justify-between border-b ${
                          isDark
                            ? "border-gray-700 bg-green-600/10 hover:bg-green-600/20"
                            : "border-gray-200 bg-green-50 hover:bg-green-100"
                        }`}
                      >
                        <div>
                          <div
                            className={`font-semibold ${
                              isDark ? "text-green-400" : "text-green-600"
                            }`}
                          >
                            Latest Block
                          </div>
                          <div
                            className={`text-xs font-mono ${
                              isDark ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            {recentBlocks[0].number}
                          </div>
                        </div>
                        <div
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            isDark
                              ? "bg-green-500/20 text-green-400"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          LATEST
                        </div>
                      </button>

                      {/* Block List */}
                      <div className="max-h-64 overflow-y-auto">
                        {filteredEndBlocks.map((block) => (
                          <button
                            key={block.number}
                            onClick={() => handleSelectEndBlock(block.number)}
                            className={`w-full px-4 py-3 text-left transition-colors flex items-center justify-between ${
                              endBlock === block.number
                                ? isDark
                                  ? "bg-blue-600/20 text-blue-400"
                                  : "bg-blue-50 text-blue-600"
                                : isDark
                                ? "hover:bg-gray-750 text-white"
                                : "hover:bg-gray-50 text-gray-900"
                            }`}
                          >
                            <div>
                              <div className="font-mono font-semibold">
                                {block.number}
                              </div>
                            </div>
                            {endBlock === block.number && (
                              <Check className="w-5 h-5" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Block Range Preview */}
              <div
                className={`p-4 rounded-xl ${
                  isDark
                    ? "bg-gray-800 border border-gray-700"
                    : "bg-gray-50 border border-gray-200"
                }`}
              >
                <div
                  className={`text-xs font-semibold mb-2 ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Selected Range
                </div>
                <div
                  className={`text-sm font-mono ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  {startBlock} → {endBlock}
                </div>
                <div
                  className={`text-xs mt-1 ${
                    isDark ? "text-gray-500" : "text-gray-500"
                  }`}
                >
                  {endBlock - startBlock} blocks
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div
              className={`flex items-center justify-end gap-3 p-6 border-t ${
                isDark ? "border-gray-800" : "border-gray-200"
              }`}
            >
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setIsStartDropdownOpen(false);
                  setIsEndDropdownOpen(false);
                  setStartSearchQuery("");
                  setEndSearchQuery("");
                  setValidationError(null);
                }}
                className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${
                  isDark
                    ? "bg-gray-800 hover:bg-gray-750 text-gray-300"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="px-6 py-2.5 rounded-lg font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              >
                Update Analysis
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

BlockRangeSelector.displayName = "BlockRangeSelector";
export default BlockRangeSelector;
