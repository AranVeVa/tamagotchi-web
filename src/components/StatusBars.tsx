import type { Stats } from '../utils/constants';

interface BarProps {
    label: string;
    value: number;
    higherIsBetter?: boolean;
}

const Bar = ({ label, value, higherIsBetter = true }: BarProps) => {
    let color = 'bg-emerald-400';
    if (higherIsBetter) {
        if (value < 30) color = 'bg-rose-400';
        else if (value < 60) color = 'bg-amber-400';
    } else {
        if (value > 70) color = 'bg-rose-400';
        else if (value > 40) color = 'bg-amber-400';
    }

    return (
        <div>
            <div className="mb-1 flex justify-between text-[10px] uppercase tracking-wider text-slate-400">
                <span>{label}</span>
                <span>{Math.round(value)}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${value}%` }} />
            </div>
        </div>
    );
};

export default function StatusBars({ stats }: { stats: Stats }) {
    const felicidad = ((100 - stats.hambre) + stats.diversion + stats.higiene) / 3;
    return (
        <div className="space-y-2 rounded-2xl border border-white/10 bg-slate-900/70 p-3">
            <Bar label="Hambre" value={stats.hambre} higherIsBetter={false} />
            <Bar label="Diversión" value={stats.diversion} />
            <Bar label="Higiene" value={stats.higiene} />
            <Bar label="Felicidad" value={felicidad} />
        </div>
    );
}