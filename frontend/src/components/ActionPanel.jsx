import { useState } from 'react'

export default function ActionPanel({ onSimulate, onFix, onReset, logs, action, simulating, fixing, currentIssue, confidence, autoHeal, onToggleAutoHeal }) {
    const [simType, setSimType] = useState('random')

    return (
        <div className="bg-[#111111] border border-orange-500/20 h-full">
            {/* Header bar */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-orange-500/10">
                <div className="flex items-center gap-3">
                    <div className="w-1 h-4 bg-orange-500" />
                    <p className="text-[10px] font-bold text-orange-500 uppercase tracking-[0.25em]">// CONTROLS</p>
                </div>

                {/* Auto-Heal Toggle */}
                <button
                    onClick={onToggleAutoHeal}
                    className={`flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] border transition-all duration-300 ${autoHeal
                            ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-400'
                            : 'bg-transparent border-white/15 text-white/30 hover:border-white/30'
                        }`}
                >
                    <div className={`w-7 h-3.5 rounded-full relative transition-all duration-300 ${autoHeal ? 'bg-emerald-500' : 'bg-white/15'}`}>
                        <div className={`absolute top-0.5 w-2.5 h-2.5 rounded-full bg-white transition-all duration-300 ${autoHeal ? 'left-3.5' : 'left-0.5'}`} />
                    </div>
                    {autoHeal ? 'AUTO-HEAL ON' : 'MANUAL'}
                </button>
            </div>

            <div className="p-6 space-y-5">
                {/* Auto-Heal Active Banner */}
                {autoHeal && (
                    <div className="flex items-center gap-3 px-4 py-3 bg-emerald-500/10 border border-emerald-500/30">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <p className="text-[11px] text-emerald-400 font-bold uppercase tracking-[0.15em]">
                            AI is autonomously detecting and healing anomalies
                        </p>
                    </div>
                )}

                {/* Manual Controls (dimmed when autoHeal is on) */}
                <div className={`space-y-3 transition-opacity duration-300 ${autoHeal ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                    <select
                        value={simType}
                        onChange={(e) => setSimType(e.target.value)}
                        disabled={simulating || fixing || autoHeal}
                        className="w-full bg-[#0d0d0d] text-white font-bold text-[11px] uppercase tracking-[0.15em] border border-white/20 px-3 py-3 outline-none hover:border-white/40 cursor-pointer transition-colors disabled:opacity-40 appearance-none text-center"
                    >
                        <option value="random">RANDOM ANOMALY</option>
                        <option value="predictive_degradation">[SLOW] PREDICTIVE DEGRADATION</option>
                        <option value="crashloopbackoff">[HIGH] CRASHLOOPBACKOFF</option>
                        <option value="config_error">[HIGH] CONFIG ERROR</option>
                        <option value="high_cpu">[HIGH] CPU OVERLOAD</option>
                        <option value="memory_spike">[HIGH] MEMORY SPIKE</option>
                        <option value="image_pull_error">[MED] IMAGE PULL ERROR</option>
                        <option value="memory_leak">[MED] MEMORY LEAK</option>
                        <option value="service_timeout">[MED] SVC TIMEOUT</option>
                    </select>

                    {/* Buttons */}
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => onSimulate(simType === 'random' ? null : simType)}
                            disabled={simulating || autoHeal}
                            className="flex-1 min-w-[130px] flex items-center justify-center gap-2 px-4 py-3
              bg-[#CC0000] text-white font-bold text-xs uppercase tracking-[0.15em]
              hover:bg-red-700 active:scale-[0.98] transition-all duration-150
              disabled:opacity-40 disabled:cursor-not-allowed border border-[#CC0000]"
                        >
                            {simulating
                                ? <><div className="w-3 h-3 border-2 border-white border-t-transparent animate-spin" /> SIMULATING</>
                                : <>SIMULATE</>}
                        </button>

                        <button
                            onClick={onFix}
                            disabled={fixing || autoHeal}
                            className="flex-1 min-w-[130px] flex items-center justify-center gap-2 px-4 py-3
              bg-white text-black font-bold text-xs uppercase tracking-[0.15em]
              hover:bg-white/85 active:scale-[0.98] transition-all duration-150
              disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {fixing
                                ? <><div className="w-3 h-3 border-2 border-black border-t-transparent animate-spin" /> FIXING</>
                                : (currentIssue === 'predictive_degradation' ? <>PRE-EMPTIVE FIX</> : <>AUTO FIX</>)}
                        </button>

                        <button
                            onClick={onReset}
                            className="px-4 py-3 text-orange-500/70 border border-orange-500/20 font-bold text-xs uppercase tracking-[0.15em]
              hover:bg-orange-500/10 hover:border-orange-500/50 active:scale-[0.98] transition-all duration-150"
                        >
                            RESET
                        </button>
                    </div>
                </div>

                {/* Last action */}
                {action && (
                    <div className="border-l-2 border-white/25 pl-3">
                        <p className="text-[9px] text-white/25 uppercase tracking-widest mb-1">LAST ACTION</p>
                        <p className="text-white/55 text-sm">{action}</p>
                        {confidence && (
                            <p className="text-[10px] text-blue-400 uppercase tracking-widest mt-1">
                                AI CONFIDENCE: {(confidence * 100).toFixed(0)}%
                            </p>
                        )}
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
