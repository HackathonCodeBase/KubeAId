export default function Header({ status }) {
    const isHealthy = status === 'healthy'
    return (
        <header className="flex items-center justify-between px-8 py-4 bg-[#0d0d0d] border-b border-[#CC0000]/30 sticky top-0 z-50">
            <div className="flex items-center gap-4">
                {/* Sharp logo block */}
                <div className="w-7 h-7 bg-[#CC0000] flex items-center justify-center">
                    <span className="text-white font-black text-xs tracking-tighter">K</span>
                </div>
                <span className="font-black text-lg text-white tracking-tighter">KUBEAID</span>
                <div className="hidden sm:block w-px h-4 bg-white/15" />
                <span className="hidden sm:block text-[10px] text-white/25 font-medium tracking-[0.2em] uppercase">
                    AI Self-Healing
                </span>
            </div>

            <div className={`flex items-center gap-2 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.15em] border ${isHealthy
                ? 'border-white/15 text-white/35'
                : 'border-[#CC0000] text-[#CC0000] shadow-sm shadow-red-900/40'
                }`}>
                <span className={`w-1.5 h-1.5 ${isHealthy ? 'bg-white/30' : 'bg-[#CC0000] animate-pulse'}`} />
                {isHealthy ? 'SYSTEM NOMINAL' : 'CRITICAL ALERT'}
            </div>
        </header>
    )
}
