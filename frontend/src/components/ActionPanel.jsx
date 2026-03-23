/* ─── Action Panel — Simulate / Fix buttons + logs ───────────── */

export default function ActionPanel({ onSimulate, onFix, onReset, logs, action, simulating, fixing }) {
    return (
        <div className="rounded-2xl p-6 bg-white/3 border border-white/10 space-y-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Actions</p>

            {/* Buttons */}
            <div className="flex flex-wrap gap-3">
                <button
                    onClick={onSimulate}
                    disabled={simulating}
                    className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm
            bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/20
            hover:shadow-orange-500/40 hover:scale-[1.02] active:scale-[0.98]
            transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                >
                    {simulating ? (
                        <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Simulating…</>
                    ) : (
                        <><span>⚡</span> Simulate Failure</>
                    )}
                </button>

                <button
                    onClick={onFix}
                    disabled={fixing}
                    className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm
            bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20
            hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-[0.98]
            transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                >
                    {fixing ? (
                        <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Fixing…</>
                    ) : (
                        <><span>🔧</span> Auto Fix</>
                    )}
                </button>

                <button
                    onClick={onReset}
                    className="px-4 py-3 rounded-xl font-semibold text-sm text-gray-400 border border-white/10 bg-white/3
            hover:bg-white/8 hover:text-white hover:scale-[1.02] active:scale-[0.98]
            transition-all duration-200"
                >
                    ↺ Reset
                </button>
            </div>

            {/* Last action taken */}
            {action && (
                <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/20 p-3 flex gap-2 items-start">
                    <span className="text-emerald-400 mt-0.5">✓</span>
                    <p className="text-emerald-300 text-sm leading-relaxed">{action}</p>
                </div>
            )}

            {/* Error logs */}
            {logs && logs.length > 0 && (
                <div className="rounded-xl bg-red-500/5 border border-red-500/20 p-4 space-y-2">
                    <p className="text-xs font-bold text-red-400 uppercase tracking-widest mb-2">Error Logs</p>
                    {logs.map((log, i) => (
                        <p key={i} className="text-red-300 text-xs font-mono bg-red-500/5 rounded px-2 py-1">{log}</p>
                    ))}
                </div>
            )}

            {logs && logs.length === 0 && (
                <p className="text-gray-600 text-xs text-center">No active error logs</p>
            )}
        </div>
    )
}
