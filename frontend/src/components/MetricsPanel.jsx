/* ─── Metrics Panel — CPU & Memory with mini bar chart ───────── */

/* Single metric gauge bar */
function MetricBar({ label, value, threshold, icon }) {
    const isWarning = value > threshold
    const color = isWarning
        ? 'bg-gradient-to-r from-orange-500 to-red-500'
        : 'bg-gradient-to-r from-cyan-500 to-blue-500'
    const textColor = isWarning ? 'text-red-400' : 'text-cyan-400'

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm font-medium flex items-center gap-1.5">
                    <span>{icon}</span> {label}
                </span>
                <span className={`text-lg font-black font-mono ${textColor}`}>{value}%</span>
            </div>
            <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-700 ${color}`}
                    style={{ width: `${Math.min(value, 100)}%` }}
                />
            </div>
            <p className="text-xs text-gray-600">Threshold: {threshold}%</p>
        </div>
    )
}

/* Mini historical bars for the "before vs after" chart */
function MiniChart({ history }) {
    if (!history || history.length === 0) return null

    return (
        <div className="mt-5 pt-4 border-t border-white/10">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">CPU History</p>
            <div className="flex items-end justify-start gap-1.5 h-12">
                {history.map((val, i) => (
                    <div key={i} className="flex flex-col items-center gap-0.5 flex-1 max-w-[24px]">
                        <div
                            className={`w-full rounded-sm transition-all duration-500 ${val > 80 ? 'bg-red-500' : 'bg-cyan-500/60'
                                }`}
                            style={{ height: `${(val / 100) * 48}px` }}
                            title={`${val}%`}
                        />
                    </div>
                ))}
                <span className="text-[10px] text-gray-600 ml-1 self-end">recent →</span>
            </div>
        </div>
    )
}

export default function MetricsPanel({ cpu, memory, cpuHistory }) {
    return (
        <div className="rounded-2xl p-6 bg-white/3 border border-white/10 space-y-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Live Metrics</p>

            <MetricBar label="CPU Usage" value={cpu} threshold={80} icon="🖥️" />
            <MetricBar label="Memory Usage" value={memory} threshold={75} icon="🧠" />

            <MiniChart history={cpuHistory} />
        </div>
    )
}
