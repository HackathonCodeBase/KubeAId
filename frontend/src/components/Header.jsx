export default function Header({ status }) {
  const isHealthy = status === "healthy";
  return (
    <header className="flex items-center justify-between px-8 py-4 bg-[#0d0d0d] border-b border-[#CC0000]/30 sticky top-0 z-50">
      <div className="flex items-center gap-4">
        {/* Cyberpunk KubeAid Logo */}
        <div className="w-10 h-10 flex items-center justify-center">
          <svg
            viewBox="0 0 120 120"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
            <defs>
              <linearGradient
                id="kGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop
                  offset="0%"
                  style={{ stopColor: "#CC0000", stopOpacity: 1 }}
                />
                <stop
                  offset="100%"
                  style={{ stopColor: "#F97316", stopOpacity: 1 }}
                />
              </linearGradient>
              <linearGradient
                id="glowGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop
                  offset="0%"
                  style={{ stopColor: "#CC0000", stopOpacity: 0.8 }}
                />
                <stop
                  offset="100%"
                  style={{ stopColor: "#F97316", stopOpacity: 0.4 }}
                />
              </linearGradient>
            </defs>

            {/* Background hexagon */}
            <polygon
              points="60,15 95,37.5 95,82.5 60,105 25,82.5 25,37.5"
              fill="#111111"
              stroke="#CC0000"
              strokeWidth="1.5"
              opacity="0.8"
            />

            {/* Main K structure */}
            <path
              d="M45 35 L45 85 M45 60 L65 35 M45 60 L65 85"
              stroke="url(#kGradient)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />

            {/* AI Circuit nodes */}
            <circle cx="75" cy="35" r="3" fill="#F97316" />
            <circle cx="85" cy="50" r="2.5" fill="#CC0000" opacity="0.9" />
            <circle cx="75" cy="60" r="3" fill="#F97316" />
            <circle cx="85" cy="70" r="2.5" fill="#CC0000" opacity="0.9" />
            <circle cx="75" cy="85" r="3" fill="#F97316" />

            {/* Circuit connections */}
            <path
              d="M65 35 L72 35 M65 85 L72 85"
              stroke="#CC0000"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.7"
            />

            {/* Glow effect */}
            <path
              d="M45 35 L45 85 M45 60 L65 35 M45 60 L65 85"
              stroke="url(#glowGradient)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              opacity="0.3"
            />
          </svg>
        </div>
        <span className="font-black text-lg text-white tracking-tighter">
          KUBEAID
        </span>
        <div className="hidden sm:block w-px h-4 bg-white/15" />
        <span className="hidden sm:block text-[10px] text-white/25 font-medium tracking-[0.2em] uppercase">
          AI Self-Healing
        </span>
      </div>

      <div
        className={`flex items-center gap-2 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.15em] border ${
          isHealthy
            ? "border-white/15 text-white/35"
            : "border-[#CC0000] text-[#CC0000] shadow-sm shadow-red-900/40"
        }`}
      >
        <span
          className={`w-1.5 h-1.5 ${isHealthy ? "bg-white/30" : "bg-[#CC0000] animate-pulse"}`}
        />
        {isHealthy ? "SYSTEM NOMINAL" : "CRITICAL ALERT"}
      </div>
    </header>
  );
}
