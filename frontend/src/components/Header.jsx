/* ─── KubeAid Header ──────────────────────────────────────────── */
export default function Header({ status }) {
    return (
        <header className="flex items-center justify-between px-8 py-4 border-b border-white/10 bg-black/30 backdrop-blur-sm sticky top-0 z-50">
            <div className="flex items-center gap-3">
                {/* Logo mark */}
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                    <span className="text-white font-black text-sm">K</span>
                </div>
                <div>
                    <span className="text-white font-bold text-lg tracking-tight">KubeAid</span>
                    <span className="ml-2 text-xs text-gray-500 font-medium">AI Self-Healing</span>
                </div>
            </div>

            {/* Live status pill */}
            <div className="flex items-center gap-2">
                <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${status === 'healthy'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-red-500/10 text-red-400 border-red-500/30 animate-pulse'
                        }`}
                >
                    <span className={`w-1.5 h-1.5 rounded-full ${status === 'healthy' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                    {status === 'healthy' ? 'System Healthy' : 'System Critical'}
                </span>
            </div>
        </header>
    )
}
