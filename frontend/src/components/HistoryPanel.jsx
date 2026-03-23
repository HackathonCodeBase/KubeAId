export default function HistoryPanel({ history }) {
    const eventStyle = {
        failure_injected: { label: 'FAILURE INJECTED', color: 'text-[#CC0000] border-[#CC0000]/30 bg-[#CC0000]/5' },
        auto_fix_applied: { label: 'FIX APPLIED', color: 'text-white/60 border-white/10 bg-white/3' },
    }

    return (
        <div className="bg-[#111111] border border-orange-500/20 h-full flex flex-col">
      {/* Header bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-orange-500/10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-1 h-4 bg-orange-500" />
          <p className="text-[10px] font-bold text-orange-500 uppercase tracking-[0.25em]">// INCIDENT HISTORY</p>
        </div>
        <p className="text-[10px] font-bold text-orange-500/50">{history.length} / 5</p>
      </div>

            <div className="divide-y divide-white/6">
                {history.length === 0 && (
                    <p className="px-6 py-8 text-center text-[10px] text-white/15 uppercase tracking-[0.2em]">
                        No incidents recorded
                    </p>
                )}

                {history.map((entry, i) => {
                    const style = eventStyle[entry.event] || { label: entry.event, color: 'text-white/40 border-white/10 bg-white/3' }
                    const ts = new Date(entry.timestamp).toLocaleTimeString()

                    return (
                        <div key={i} className="px-6 py-4 flex gap-4 items-start">
                            {/* Index */}
                            <span className="text-[10px] font-mono text-white/15 mt-0.5 shrink-0 w-5">
                                {String(i + 1).padStart(2, '0')}
                            </span>

                            <div className="flex-1 min-w-0 space-y-1.5">
                                {/* Event tag + timestamp */}
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest border ${style.color}`}>
                                        {style.label}
                                    </span>
                                    <span className="text-[10px] text-white/20 font-mono">{ts}</span>
                                </div>

                                {/* Detail */}
                                <p className="text-sm text-white/55 leading-snug">{entry.detail}</p>

                                {/* Snapshot */}
                                <div className="flex gap-3 text-[10px] font-mono text-white/20">
                                    <span>CPU {entry.snapshot?.cpu}%</span>
                                    <span>MEM {entry.snapshot?.memory}%</span>
                                    <span className={entry.snapshot?.status === 'healthy' ? 'text-white/30' : 'text-[#CC0000]/50'}>
                                        {entry.snapshot?.status?.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
