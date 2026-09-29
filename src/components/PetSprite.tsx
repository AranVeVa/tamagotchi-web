import type { Mood } from '../utils/constants';

interface PetSpriteProps {
    mood: Mood;
    name: string;
}

export default function PetSprite({ mood, name }: PetSpriteProps) {
    const emoji = mood === 'happy' ? '😊' : mood === 'sad' ? '😢' : mood === 'ghost' ? '👻' : '😐';
    return (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-slate-900/70 p-6">
            <div className={`text-7xl ${mood === 'ghost' ? 'animate-pulse' : 'animate-float'}`} aria-hidden>
                {emoji}
            </div>
            <p className="mt-3 text-sm font-semibold text-slate-300">{name}</p>
            <p className="text-[10px] uppercase tracking-widest text-slate-500">{mood}</p>
        </div>
    );
}