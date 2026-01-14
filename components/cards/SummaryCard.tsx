export const SummaryCard = ({
  title,
  value,
  isDark,
}: {
  title: string;
  value: string | number;
  isDark: boolean;
}) => {
  return (
    <div
      className={`rounded-lg p-4 transition-colors ${
        isDark ? "bg-gray-800" : "bg-white"
      } shadow-sm`}
    >
      <div className="flex items-center justify-between mb-1">
        <span
          className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}
        >
          {title}
        </span>
        <button className={`text-gray-400 hover:text-gray-600`}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="3" r="1" fill="currentColor" />
            <circle cx="8" cy="8" r="1" fill="currentColor" />
            <circle cx="8" cy="13" r="1" fill="currentColor" />
          </svg>
        </button>
      </div>

      <div
        className={`text-2xl font-semibold mb-1 ${
          isDark ? "text-white" : "text-gray-900"
        }`}
      >
        {value}
      </div>
    </div>
  );
};
