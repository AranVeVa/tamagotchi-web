import { useState } from 'react';
import Actions from './components/Actions';
import Clock from './components/Clock';
import EventToast from './components/EventToast';
import PetSprite from './components/PetSprite';
import StatusBars from './components/StatusBars';
import SummaryModal from './components/SummaryModal';
import useTamagotchi from './hooks/useTamagotchi';
import { EVENT_TYPES, NEEDS_FOOD_THRESHOLD, TOTAL_SIM_HOURS } from './utils/constants';
import type { GameState, LogEntry } from './utils/constants';

const TONE: Record<LogEntry['tone'], string> = {
    info: 'text-slate-300',
    good: 'text-emerald-300 bg-emerald-500/5',
    warning: 'text-amber-300 bg-amber-500/5',
    bad: 'text-rose-300 bg-rose-500/10',
};

export default function App() {
    const { state, actions } = useTamagotchi();

    if (state.phase === 'setup') {
        return <StartScreen onStart={actions.start} />;
    }

    return <GameScreen state={state} actions={actions} />;
}

function StartScreen({ onStart }: { onStart: (name: string) => void }) {
    const [name, setName] = useState('');
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onStart(name);
    };
    return (
        <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col items-center justify-center gap-6 p-6">
            <div className="animate-float text-7xl" aria-hidden>🥚</div>
            <header className="space-y-2 text-center">
                <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                    Tamagotchi <span className="text-emerald-400">Web</span>
                </h1>
                <p className="text-sm text-slate-400">
                    Cuida a tu mascota durante 24 horas simuladas. Cada 6 segundos reales pasa 1 hora
                    simulada, así que la partida completa dura 144 segundos.
                </p>
            </header>
            <form onSubmit={handleSubmit} className="w-full space-y-3">
                <label htmlFor="petName" className="block text-xs uppercase tracking-widest text-slate-400">
                    ¿Cómo se llamará tu mascota?
                </label>
                <input
                    id="petName"
                    name="petName"
                    type="text"
                    maxLength={20}
                    autoComplete="off"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Chispa, Michi, Dino…"
                    className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-lg text-slate-100 outline-none transition focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20"
                />
                <button
                    type="submit"
                    className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3 text-lg font-bold text-slate-950 transition hover:brightness-110 active:scale-[0.99]"
                >
                    ¡Comenzar a cuidar!
                </button>
            </form>
            <Rules />
        </main>
    );
}

function Rules() {
    return (
        <section className="w-full rounded-2xl border border-white/10 bg-slate-900/60 p-4 text-xs text-slate-400">
            <h2 className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-300">Reglas del reto</h2>
            <ul className="list-inside list-disc space-y-1">
                <li>Cada 6 h simuladas la mascota pide comida.</li>
                <li>2 peticiones de comida ignoradas seguidas → 👻 fantasma.</li>
                <li>3 alimentaciones seguidas sin que tenga hambre → 👻 fantasma.</li>
                <li>Aparecen eventos aleatorios: quiere jugar o necesita ir al baño.</li>
                <li>Al llegar a las 24 h simuladas verás tu resumen y puntuación.</li>
            </ul>
        </section>
    );
}

function GameScreen({ state, actions }: { state: GameState; actions: ReturnType<typeof useTamagotchi>['actions'] }) {
    const mood = state.mood;
    const needs = {
        feed: state.foodRequestActive || state.stats.hambre >= NEEDS_FOOD_THRESHOLD,
        play: state.activeEvent?.type === EVENT_TYPES.PLAY,
        clean: state.activeEvent?.type === EVENT_TYPES.BATHROOM,
    };
    const isOver = state.phase !== 'playing';

    return (
        <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-4 p-4 sm:p-6">
            <header className="flex items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl font-black tracking-tight sm:text-2xl">
                        {state.petName}
                        <span className="ml-2 text-xs font-normal uppercase tracking-widest text-slate-500">Tamagotchi</span>
                    </h1>
                    <p className="text-xs text-slate-500">
                        Día 1 · Hora simulada {state.simHour} de {TOTAL_SIM_HOURS}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={actions.reset}
                    className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-rose-400/50 hover:text-rose-300"
                >
                    Reiniciar
                </button>
            </header>

            <Clock simHour={state.simHour} elapsedMs={state.elapsedMs} />

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_1.2fr]">
                <PetSprite mood={mood} name={state.petName} />
                <div className="flex flex-col gap-3">
                    <EventToast event={state.activeEvent} simHour={state.simHour} petName={state.petName} />
                    <StatusBars stats={state.stats} />
                </div>
            </section>

            <Actions
                onAction={{ feed: actions.feed, play: actions.play, clean: actions.clean }}
                needs={needs}
                disabled={isOver}
            />

            <section className="rounded-2xl border border-white/10 bg-slate-900/70 p-3">
                <h2 className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                    Diario de {state.petName}
                </h2>
                <ul className="max-h-48 space-y-1 overflow-y-auto pr-1">
                    {state.log.slice(0, 14).map((entry) => (
                        <li
                            key={entry.id}
                            className={`rounded-lg px-2 py-1 text-xs leading-relaxed ${TONE[entry.tone]}`}
                        >
                            <span className="mr-1 font-mono text-[10px] text-slate-500">
                                [{String(entry.hour).padStart(2, '0')}:00]
                            </span>
                            {entry.text}
                        </li>
                    ))}
                </ul>
            </section>

            <SummaryModal
                open={Boolean(state.summary)}
                summary={state.summary}
                petName={state.petName}
                onRestart={actions.reset}
            />
        </main>
    );
}