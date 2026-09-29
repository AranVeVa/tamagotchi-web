interface ClockProps {
    simHour: number;
    elapsedMs: number;
}

export default function Clock({ simHour, elapsedMs }: ClockProps) {
    const totalMs = 24 * 6000;
    const progress = Math.min(100, (elapsedMs / totalMs) * 100);
    const hours = simHour;
    const minutes = Math.floor((elapsedMs % 6000) / 100);

    return (
        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-3">
            <div className="mb-1 flex items-center justify-between text-xs uppercase tracking-widest text-slate-400">
                <span>Reloj simulado</span>
                <span className="font-mono text-slate-200">
                    {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}
                </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 transition-all"
                    style={{ width: `${progress}%` }}
                />
            </div>
            <p className="mt-1 text-right text-[10px] text-slate-500">
                {(elapsedMs / 1000).toFixed(1)}s reales / 144s
            </p>
        </div>
    );
}