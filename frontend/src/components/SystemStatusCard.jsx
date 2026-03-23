export default function SystemStatusCard({ status, issue, severity }) {
    const isHealthy = status === 'healthy'
    const issueLabels = {
        high_cpu: 'HIGH CPU',
        memory_spike: 'MEMORY SPIKE',
        service_timeout: 'SVC TIMEOUT',
        crashloopbackoff: 'CRASH LOOP',
        config_error: 'CONFIG ERR',
        image_pull_error: 'IMG PULL ERR',
        memory_leak: 'MEM LEAK',
        predictive_degradation: 'PREDICTIVE ALERT',
    }
    const sevColor = { low: 'text-yellow-400 border-yellow-500', medium: 'text-orange-400 border-orange-500', high: 'text-[#CC0000] border-[#CC0000]', pre_emptive: 'text-blue-400 border-blue-500' }

    return (
        <div className={`relative p-6 bg-[#111111] border-2 transition-all duration-500 ${isHealthy ? 'border-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.1)]' : 'border-[#CC0000] shadow-[0_0_20px_rgba(204,0,0,0.2)]'
            }`}>
            {/* Header bar */}
            <div className={`flex items-center gap-3 pb-3 border-b ${isHealthy ? 'border-orange-500/10' : 'border-[#CC0000]/20'}`}>
                <div className={`w-1 h-4 ${isHealthy ? 'bg-orange-500' : 'bg-[#CC0000]'}`} />
                <p className={`text-[10px] font-bold uppercase tracking-[0.25em] ${isHealthy ? 'text-orange-500' : 'text-[#CC0000]'}`}>
                    // SYSTEM STATUS
                </p>
            </div>
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
