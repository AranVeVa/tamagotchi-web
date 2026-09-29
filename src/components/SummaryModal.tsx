import type { Summary } from '../utils/constants';

interface SummaryModalProps {
    open: boolean;
    summary: Summary | null;
    petName: string;
    onRestart: () => void;
}

export default function SummaryModal({ open, summary, petName, onRestart }: SummaryModalProps) {
    if (!open || !summary) return null;

    const { score, ghost, message, stats } = summary;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
                <div className="mb-4 text-center">
                    <div className="text-6xl">{ghost ? '👻' : '🏆'}</div>
                    <h2 className="mt-3 text-2xl font-black">
                        {ghost ? `${petName} es un fantasma` : `¡${petName} sobrevivió!`}
                    </h2>
                    <p className="mt-1 text-sm text-slate-400">{message}</p>
                </div>

                <div className="mb-4 space-y-2 rounded-2xl bg-slate-950/50 p-4">
                    <Row label="Hambre final" value={`${Math.round(stats.hambre)}%`} />
                    <Row label="Diversión final" value={`${Math.round(stats.diversion)}%`} />
                    <Row label="Higiene final" value={`${Math.round(stats.higiene)}%`} />
                    <div className="border-t border-white/10 pt-2">
                        <Row label="Puntuación" value={`${score}/100`} highlight />
                    </div>
                </div>

                <button
                    onClick={onRestart}
                    className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3 text-lg font-bold text-slate-950 transition hover:brightness-110"
                >
                    Jugar de nuevo
                </button>
            </div>
        </div>
    );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
    return (
        <div className="flex justify-between text-sm">
            <span className="text-slate-400">{label}</span>
            <span className={highlight ? 'font-bold text-emerald-300' : 'font-mono text-slate-200'}>{value}</span>
        </div>
    );
}