import { EVENT_TYPES } from '../utils/constants';
import type { ActiveEvent } from '../utils/constants';

interface EventToastProps {
    event: ActiveEvent | null;
    simHour: number;
    petName: string;
}

export default function EventToast({ event, simHour, petName }: EventToastProps) {
    if (!event) return <div className="h-[72px] rounded-2xl border border-dashed border-white/5 bg-slate-900/30" />;
    const isPlay = event.type === EVENT_TYPES.PLAY;
    return (
        <div className={`rounded-2xl border p-3 text-sm ${isPlay ? 'border-sky-400/30 bg-sky-500/10 text-sky-200' : 'border-fuchsia-400/30 bg-fuchsia-500/10 text-fuchsia-200'}`}>
            <p className="font-semibold">
                {isPlay ? `🎾 ¡${petName} quiere jugar!` : `🚽 ¡${petName} necesita ir al baño!`}
            </p>
            <p className="text-[10px] opacity-70">Expira en la hora simulada {event.expiresAt}</p>
        </div>
    );
}