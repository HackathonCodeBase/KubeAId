function MetricBar({ label, value, threshold }) {
    const warn = value > threshold
    return (
        <div className="space-y-1.5">
            <div className="flex justify-between items-baseline">
                <span className="text-[11px] font-bold text-white/40 uppercase tracking-[0.15em]">{label}</span>
                <span className={`text-3xl font-black font-mono ${warn ? 'text-[#CC0000]' : 'text-white'}`}>
                    {value}<span className="text-base font-bold opacity-50">%</span>
                </span>
            </div>
            {/* Track */}
            <div className="h-[3px] bg-white/8 w-full">
                <div
                    className={`h-full transition-all duration-700 ${warn ? 'bg-[#CC0000]' : 'bg-white'}`}
                    style={{ width: `${Math.min(value, 100)}%` }}
                />
            </div>
            <div className="flex justify-between">
                <span className="text-[9px] text-white/15 uppercase tracking-widest">0%</span>
                <span className={`text-[9px] uppercase tracking-widest ${warn ? 'text-[#CC0000]/60' : 'text-white/15'}`}>
                    {warn ? `▲ ABOVE ${threshold}% THRESHOLD` : `THRESHOLD ${threshold}%`}
                </span>
                <span className="text-[9px] text-white/15 uppercase tracking-widest">100%</span>
            </div>
        </div>
    )
}

function MiniChart({ history }) {
    if (!history || history.length === 0) return null
    return (
        <div className="pt-4 border-t border-white/8">
            <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.25em] mb-3">// CPU HISTORY</p>
            <div className="flex items-end gap-[3px] h-10">
                {history.map((val, i) => (
                    <div
                        key={i}
                        className={`flex-1 transition-all duration-500 ${val > 80 ? 'bg-[#CC0000]' : 'bg-white/20'}`}
                        style={{ height: `${(val / 100) * 40}px` }}
                        title={`${val}%`}
                    />
                ))}
            </div>
        </div>
    )
}

export default function MetricsPanel({ cpu, memory, cpuHistory }) {
    return (
        <div className="p-6 bg-[#111111] border border-white/10 space-y-5">
            <p className="text-[10px] font-bold text-white/25 uppercase tracking-[0.25em]">// LIVE METRICS</p>
            <MetricBar label="CPU Usage" value={cpu} threshold={80} />
            <MetricBar label="Memory" value={memory} threshold={75} />
            <MiniChart history={cpuHistory} />
        </div>
    )
}
