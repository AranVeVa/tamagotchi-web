interface ActionsProps {
    onAction: {
        feed: () => void;
        play: () => void;
        clean: () => void;
    };
    needs: {
        feed: boolean;
        play: boolean;
        clean: boolean;
    };
    disabled: boolean;
}

export default function Actions({ onAction, needs, disabled }: ActionsProps) {
    return (
        <div className="grid grid-cols-3 gap-2">
            <button
                onClick={onAction.feed}
                disabled={disabled}
                className={`relative rounded-xl border px-3 py-3 text-sm font-semibold transition ${needs.feed
                        ? 'border-amber-400/60 bg-amber-500/10 text-amber-200 hover:bg-amber-500/20'
                        : 'border-white/10 bg-slate-900/70 text-slate-300 hover:border-emerald-400/40 hover:text-emerald-200'
                    } disabled:opacity-50`}
            >
                🍖 Alimentar
                {needs.feed && <span className="absolute -right-1 -top-1 flex h-3 w-3 rounded-full bg-amber-400" />}
            </button>
            <button
                onClick={onAction.play}
                disabled={disabled}
                className={`relative rounded-xl border px-3 py-3 text-sm font-semibold transition ${needs.play
                        ? 'border-sky-400/60 bg-sky-500/10 text-sky-200 hover:bg-sky-500/20'
                        : 'border-white/10 bg-slate-900/70 text-slate-300 hover:border-emerald-400/40 hover:text-emerald-200'
                    } disabled:opacity-50`}
            >
                🎾 Jugar
                {needs.play && <span className="absolute -right-1 -top-1 flex h-3 w-3 rounded-full bg-sky-400" />}
            </button>
            <button
                onClick={onAction.clean}
                disabled={disabled}
                className={`relative rounded-xl border px-3 py-3 text-sm font-semibold transition ${needs.clean
                        ? 'border-fuchsia-400/60 bg-fuchsia-500/10 text-fuchsia-200 hover:bg-fuchsia-500/20'
                        : 'border-white/10 bg-slate-900/70 text-slate-300 hover:border-emerald-400/40 hover:text-emerald-200'
                    } disabled:opacity-50`}
            >
                🚽 Baño
                {needs.clean && <span className="absolute -right-1 -top-1 flex h-3 w-3 rounded-full bg-fuchsia-400" />}
            </button>
        </div>
    );
}