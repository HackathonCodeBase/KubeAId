export default function ActionPanel({ onSimulate, onFix, onReset, logs, action, simulating, fixing }) {
    return (
        <div className="bg-[#111111] border border-white/10">
            {/* Header bar */}
            <div className="flex items-center gap-3 px-6 py-3 border-b border-white/8">
                <div className="w-1 h-4 bg-white/20" />
                <p className="text-[10px] font-bold text-white/35 uppercase tracking-[0.25em]">// CONTROLS</p>
            </div>

            <div className="p-6 space-y-5">
                {/* Buttons */}
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={onSimulate}
                        disabled={simulating}
                        className="flex-1 min-w-[130px] flex items-center justify-center gap-2 px-4 py-3
              bg-[#CC0000] text-white font-bold text-xs uppercase tracking-[0.15em]
              hover:bg-red-700 active:scale-[0.98] transition-all duration-150
              disabled:opacity-40 disabled:cursor-not-allowed border border-[#CC0000]"
                    >
                        {simulating
                            ? <><div className="w-3 h-3 border-2 border-white border-t-transparent animate-spin" /> SIMULATING</>
                            : <>⚡ SIMULATE</>}
                    </button>

                    <button
                        onClick={onFix}
                        disabled={fixing}
                        className="flex-1 min-w-[130px] flex items-center justify-center gap-2 px-4 py-3
              bg-white text-black font-bold text-xs uppercase tracking-[0.15em]
              hover:bg-white/85 active:scale-[0.98] transition-all duration-150
              disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {fixing
                            ? <><div className="w-3 h-3 border-2 border-black border-t-transparent animate-spin" /> FIXING</>
                            : <>🔧 AUTO FIX</>}
                    </button>

                    <button
                        onClick={onReset}
                        className="px-4 py-3 text-white/30 border border-white/10 font-bold text-xs uppercase tracking-[0.15em]
              hover:text-white hover:border-white/30 active:scale-[0.98] transition-all duration-150"
                    >
                        ↺ RESET
                    </button>
                </div>

                {/* Last action */}
                {action && (
                    <div className="border-l-2 border-white/25 pl-3">
                        <p className="text-[9px] text-white/25 uppercase tracking-widest mb-1">LAST ACTION</p>
                        <p className="text-white/55 text-sm">{action}</p>
                    </div>
                )}

                {/* Error logs */}
                {logs && logs.length > 0 && (
                    <div>
                        <p className="text-[9px] font-bold text-[#CC0000] uppercase tracking-[0.2em] mb-2">// ERROR LOGS</p>
                        <div className="space-y-1">
                            {logs.map((log, i) => (
                                <div key={i} className="flex gap-2 px-3 py-2 bg-[#CC0000]/5 border-l-2 border-[#CC0000]/50">
                                    <span className="text-[#CC0000]/60 text-xs font-mono shrink-0">[{String(i).padStart(2, '0')}]</span>
                                    <p className="text-red-400/80 text-xs font-mono break-all">{log}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {logs && logs.length === 0 && (
                    <p className="text-white/12 text-[10px] uppercase tracking-[0.25em] text-center">NO ACTIVE LOGS</p>
                )}
            </div>
        </div>
    )
}
