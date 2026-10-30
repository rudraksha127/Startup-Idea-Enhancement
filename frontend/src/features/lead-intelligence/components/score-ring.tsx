interface ScoreRingProps {
  label: string;
  score: number;
  color?: string;
  subtext?: string;
}

export function ScoreRing({ label, score, color = "#0da66c", subtext }: ScoreRingProps) {
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="p-4 bg-white rounded-xl border border-gray-200/80 shadow-2xs flex flex-col items-center justify-between text-center">
      <span className="text-xs font-bold text-gray-700 mb-2 truncate w-full">{label}</span>
      <div className="relative w-16 h-16 flex items-center justify-center my-1">
        <svg className="w-16 h-16 -rotate-90 transform" viewBox="0 0 64 64">
          <circle
            cx="32"
            cy="32"
            r={radius}
            stroke="#f1f2ee"
            strokeWidth="5"
            fill="transparent"
          />
          <circle
            cx="32"
            cy="32"
            r={radius}
            stroke={color}
            strokeWidth="5"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <span className="absolute font-serif text-sm font-bold text-[#101413]">
          {score}%
        </span>
      </div>
      <span className="text-[10px] text-gray-400 mt-1 font-medium">{subtext || "Calculated"}</span>
    </div>
  );
}

