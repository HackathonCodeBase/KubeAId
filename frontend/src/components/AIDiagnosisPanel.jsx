/* ─── AI Diagnosis Panel ──────────────────────────────────────── */

export default function AIDiagnosisPanel({ diagnosis, loading }) {
    if (loading) {
        return (
            <div className="rounded-2xl p-6 bg-violet-500/5 border border-violet-500/20 flex flex-col items-center justify-center min-h-[180px] gap-3">
                <div className="w-8 h-8 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
                <p className="text-violet-400 text-sm font-medium">AI is analysing system state…</p>
            </div>
        )
    }

    if (!diagnosis) {
        return (
            <div className="rounded-2xl p-6 bg-white/3 border border-white/10 flex flex-col items-center justify-center min-h-[180px] gap-2 text-center">
                <span className="text-3xl">🤖</span>
                <p className="text-gray-500 text-sm">Simulate a failure to get AI diagnosis</p>
            </div>
        )
    }

    return (
        <div className="rounded-2xl p-6 bg-violet-500/5 border border-violet-500/20 space-y-4">
            <div className="flex items-center gap-2">
                <span className="text-violet-400 text-lg">🤖</span>
                <p className="text-xs font-semibold text-violet-400 uppercase tracking-widest">AI Diagnosis</p>
            </div>

            {/* Cause */}
            <div className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-1">
                <p className="text-xs font-bold text-orange-400 uppercase tracking-widest">Root Cause</p>
                <p className="text-gray-200 text-sm leading-relaxed">{diagnosis.cause}</p>
            </div>

            {/* Recommended Fix */}
            <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/20 p-4 space-y-1">
                <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Recommended Fix</p>
                <p className="text-gray-200 text-sm leading-relaxed">{diagnosis.fix}</p>
            </div>

            {/* Reasoning */}
            <div className="rounded-xl bg-white/3 border border-white/10 p-4 space-y-1">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Reasoning</p>
                <p className="text-gray-400 text-sm leading-relaxed">{diagnosis.reasoning}</p>
            </div>
        </div>
    )
}
