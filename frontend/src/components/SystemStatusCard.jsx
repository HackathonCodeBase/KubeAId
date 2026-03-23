/* ─── System Status Card ──────────────────────────────────────── */
export default function SystemStatusCard({ status, issue, severity }) {
    const isHealthy = status === 'healthy'

    const severityColors = {
        low: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10',
        medium: 'text-orange-400 border-orange-500/30 bg-orange-500/10',
        high: 'text-red-400 border-red-500/30 bg-red-500/10',
    }

    const issueLabels = {
        high_cpu: 'High CPU Usage',
        memory_spike: 'Memory Spike',
        service_timeout: 'Service Timeout',
    }

    return (
        <div
            className={`rounded-2xl p-6 border transition-all duration-500 ${isHealthy
                    ? 'bg-emerald-500/5 border-emerald-500/20'
                    : 'bg-red-500/5 border-red-500/20 shadow-lg shadow-red-500/10'
                }`}
        >
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">System Status</p>

            <div className="flex items-center gap-4 mb-4">
                {/* Animated status icon */}
                <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl ${isHealthy ? 'bg-emerald-500/20' : 'bg-red-500/20'
                        }`}
                >
                    {isHealthy ? '✅' : '🚨'}
                </div>
                <div>
                    <h2
                        className={`text-2xl font-black tracking-tight ${isHealthy ? 'text-emerald-400' : 'text-red-400'}`}
                    >
                        {isHealthy ? 'HEALTHY' : 'CRITICAL'}
                    </h2>
                    <p className="text-gray-500 text-sm mt-0.5">
                        {isHealthy ? 'All systems nominal' : 'Anomaly detected'}
                    </p>
                </div>
            </div>

            {/* Issue + severity badges */}
            {!isHealthy && issue && (
                <div className="flex flex-wrap gap-2 mt-2">
                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white text-xs font-semibold">
                        {issueLabels[issue] || issue}
                    </span>
                    {severity && (
                        <span className={`px-3 py-1 rounded-full border text-xs font-bold uppercase ${severityColors[severity]}`}>
                            {severity} severity
                        </span>
                    )}
                </div>
            )}

            {isHealthy && !issue && (
                <div className="flex gap-2 mt-2">
                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                        No Issues Detected
                    </span>
                </div>
            )}
        </div>
    )
}
