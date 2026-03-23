export default function SystemStatusCard({ status, issue, severity }) {
    const isHealthy = status === 'healthy'
    const issueLabels = {
        high_cpu: 'HIGH CPU',
        memory_spike: 'MEMORY SPIKE',
        service_timeout: 'SVC TIMEOUT',
    }
    const sevColor = { low: 'text-yellow-400 border-yellow-500', medium: 'text-orange-400 border-orange-500', high: 'text-[#CC0000] border-[#CC0000]' }

    return (
        <div className={`relative p-6 bg-[#111111] border-2 transition-all duration-500 ${isHealthy ? 'border-white/10' : 'border-[#CC0000]'
            }`}>
            {/* Corner cut accent — top-right */}
            <div className={`absolute top-0 right-0 w-0 h-0 border-t-[28px] border-r-[28px] ${isHealthy ? 'border-t-white/5 border-r-white/5' : 'border-t-[#CC0000] border-r-[#CC0000]'
                }`} />

            <p className="text-[10px] font-bold text-white/25 uppercase tracking-[0.25em] mb-5">
        // SYSTEM STATUS
            </p>

            <div className="flex items-end justify-between">
                <div>
                    <h2 className={`text-8xl font-black tracking-tighter leading-none select-none ${isHealthy ? 'text-white' : 'text-[#CC0000]'
                        }`}>
                        {isHealthy ? 'OK' : 'ERR'}
                    </h2>
                    <p className="text-xs text-white/30 font-medium mt-2 tracking-widest uppercase">
                        {isHealthy ? 'All systems nominal' : 'Anomaly detected — action required'}
                    </p>
                </div>

                {/* Status block */}
                <div className={`w-12 h-12 flex items-center justify-center font-black text-xl border-2 select-none ${isHealthy ? 'border-white/10 text-white/30' : 'border-[#CC0000] bg-[#CC0000] text-white'
                    }`}>
                    {isHealthy ? '✓' : '!'}
                </div>
            </div>

            {/* Divider */}
            <div className="flex gap-2 mt-5 pt-4 border-t border-white/8 flex-wrap">
                {issue ? (
                    <>
                        <span className="px-2 py-0.5 bg-[#CC0000]/10 text-[#CC0000] border border-[#CC0000]/40 text-[11px] font-bold tracking-widest uppercase">
                            {issueLabels[issue] || issue}
                        </span>
                        {severity && (
                            <span className={`px-2 py-0.5 border text-[11px] font-bold tracking-widest uppercase ${sevColor[severity]}`}>
                                SEV:{severity.toUpperCase()}
                            </span>
                        )}
                    </>
                ) : (
                    <span className="px-2 py-0.5 bg-white/5 text-white/25 border border-white/10 text-[11px] font-bold tracking-widest uppercase">
                        NO ISSUES
                    </span>
                )}
            </div>
        </div>
    )
}
