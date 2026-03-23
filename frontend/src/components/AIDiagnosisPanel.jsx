export default function AIDiagnosisPanel({ diagnosis, loading }) {
    if (loading) {
        return (
            <div className="p-6 bg-[#111111] border border-white/10 flex flex-col items-center justify-center min-h-[200px] gap-3">
                <div className="w-6 h-6 border-2 border-[#CC0000] border-t-transparent animate-spin" />
                <p className="text-[11px] text-white/30 uppercase tracking-[0.2em]">AI PROCESSING…</p>
            </div>
        )
    }

    if (!diagnosis) {
        return (
            <div className="p-6 bg-[#111111] border border-white/10 flex flex-col items-center justify-center min-h-[200px] gap-2">
                <div className="w-8 h-8 border border-white/10 flex items-center justify-center text-white/20 text-lg">⬡</div>
                <p className="text-[11px] text-white/20 uppercase tracking-[0.2em]">Awaiting failure event</p>
            </div>
        )
    }

    return (
        <div className="bg-[#111111] border border-white/10">
            {/* Header bar */}
            <div className="flex items-center gap-3 px-6 py-3 border-b border-white/8">
                <div className="w-1 h-4 bg-[#CC0000]" />
                <p className="text-[10px] font-bold text-white/35 uppercase tracking-[0.25em]">// AI DIAGNOSIS</p>
            </div>

            <div className="p-6 space-y-0 divide-y divide-white/6">
                {/* Root Cause */}
                <div className="pb-4">
                    <p className="text-[9px] font-bold text-[#CC0000] uppercase tracking-[0.2em] mb-2">ROOT CAUSE</p>
                    <p className="text-white/75 text-sm leading-relaxed">{diagnosis.cause}</p>
                </div>

                {/* Fix */}
                <div className="py-4">
                    <p className="text-[9px] font-bold text-white/40 uppercase tracking-[0.2em] mb-2">RECOMMENDED ACTION</p>
                    <p className="text-white/75 text-sm leading-relaxed">{diagnosis.fix}</p>
                </div>

                {/* Reasoning */}
                <div className="pt-4">
                    <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em] mb-2">REASONING</p>
                    <p className="text-white/30 text-sm leading-relaxed">{diagnosis.reasoning}</p>
                </div>
            </div>
        </div>
    )
}
