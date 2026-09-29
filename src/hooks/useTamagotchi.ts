import { useCallback, useEffect, useRef, useState } from 'react';
import {
    EVENT_TYPES,
    TOTAL_SIM_HOURS,
    REAL_MS_PER_SIM_HOUR,
    INITIAL_STATS,
    FOOD_REQUEST_HOURS,
    MAX_IGNORED_FOOD_REQUESTS,
    MAX_OVERFEEDS,
    STATS_DECAY,
} from '../utils/constants';
import type {
    GameState,
    LogEntry,
    Stats,
    Summary,
    Mood,
} from '../utils/constants';

const createInitialStats = (): Stats => ({ ...INITIAL_STATS });

const initialState: GameState = {
    petName: '',
    phase: 'setup',
    simHour: 0,
    elapsedMs: 0,
    stats: createInitialStats(),
    foodRequestActive: false,
    ignoredFoodRequests: 0,
    overfeeds: 0,
    activeEvent: null,
    log: [],
    summary: null,
    mood: 'happy',
};

let logId = 0;
const addLog = (log: LogEntry[], hour: number, text: string, tone: LogEntry['tone'] = 'info'): LogEntry[] => {
    const entry: LogEntry = { id: ++logId, hour, text, tone };
    return [entry, ...log].slice(0, 50);
};

export default function useTamagotchi() {
    const [state, setState] = useState<GameState>(initialState);
    const intervalRef = useRef<number | null>(null);
    const startTimeRef = useRef<number | null>(null);

    const start = useCallback((name: string) => {
        const petName = name.trim() || 'Mascota';
        startTimeRef.current = Date.now();
        setState({
            ...initialState,
            petName,
            phase: 'playing',
            log: addLog([], 0, `¡${petName} ha nacido! Cuídalo bien.`, 'good'),
        });
    }, []);

    const reset = useCallback(() => {
        setState(initialState);
        startTimeRef.current = null;
    }, []);

    useEffect(() => {
        if (state.phase !== 'playing') return;

        intervalRef.current = window.setInterval(() => {
            const now = Date.now();
            const elapsed = now - (startTimeRef.current ?? now);
            const simHour = Math.min(Math.floor(elapsed / REAL_MS_PER_SIM_HOUR), TOTAL_SIM_HOURS);

            setState((prev) => {
                if (prev.phase !== 'playing') return prev;
                if (simHour === prev.simHour && elapsed - prev.elapsedMs < 100) return prev;

                let newState: GameState = { ...prev, elapsedMs: elapsed, simHour };

                if (simHour > prev.simHour) {
                    const hoursPassed = simHour - prev.simHour;
                    for (let h = 0; h < hoursPassed; h++) {
                        const currentHour = prev.simHour + h + 1;
                        newState = processSimHour(newState, currentHour);
                        if (newState.phase !== 'playing') break;
                    }
                }

                if (simHour >= TOTAL_SIM_HOURS && newState.phase === 'playing') {
                    newState = finishGame(newState);
                }

                newState.mood = computeMood(newState);
                return newState;
            });
        }, 100);

        return () => {
            if (intervalRef.current) window.clearInterval(intervalRef.current);
        };
    }, [state.phase]);

    function processSimHour(state: GameState, hour: number): GameState {
        let s = { ...state, simHour: hour };
        let log = s.log;
        const stats = { ...s.stats };

        stats.hambre = Math.min(100, stats.hambre + STATS_DECAY.hambre);
        stats.diversion = Math.max(0, stats.diversion - STATS_DECAY.diversion);
        stats.higiene = Math.max(0, stats.higiene - STATS_DECAY.higiene);

        if (!s.activeEvent && Math.random() < 0.4) {
            const type = Math.random() < 0.5 ? EVENT_TYPES.PLAY : EVENT_TYPES.BATHROOM;
            s.activeEvent = { type, expiresAt: hour + 3 };
            log = addLog(
                log,
                hour,
                type === EVENT_TYPES.PLAY
                    ? `¡${s.petName} quiere jugar!`
                    : `¡${s.petName} necesita ir al baño!`,
                'warning'
            );
        }

        if (s.activeEvent && hour >= s.activeEvent.expiresAt) {
            const penalty = 15;
            if (s.activeEvent.type === EVENT_TYPES.PLAY) {
                stats.diversion = Math.max(0, stats.diversion - penalty);
                log = addLog(log, hour, `${s.petName} se aburrió porque no jugaste con él.`, 'bad');
            } else {
                stats.higiene = Math.max(0, stats.higiene - penalty);
                log = addLog(log, hour, `${s.petName} se hizo pipí porque no lo llevaste al baño.`, 'bad');
            }
            s.activeEvent = null;
        }

        if (hour % FOOD_REQUEST_HOURS === 0 && hour > 0 && hour < TOTAL_SIM_HOURS) {
            if (s.foodRequestActive) {
                s.ignoredFoodRequests += 1;
                if (s.ignoredFoodRequests >= MAX_IGNORED_FOOD_REQUESTS) {
                    log = addLog(log, hour, `¡${s.petName} se ha convertido en fantasma por falta de comida!`, 'bad');
                    return { ...s, stats, log, phase: 'ghost', summary: buildSummary(s, true) };
                } else {
                    log = addLog(log, hour, `¡${s.petName} sigue con hambre! Si no lo alimentas, se convertirá en fantasma.`, 'bad');
                }
            } else {
                s.ignoredFoodRequests = 0;
                log = addLog(log, hour, `¡${s.petName} tiene hambre! Dale de comer.`, 'warning');
            }
            s.foodRequestActive = true;
        }

        s.stats = stats;
        s.log = log;
        s.mood = computeMood(s);
        return s;
    }

    function finishGame(state: GameState): GameState {
        const summary = buildSummary(state, false);
        return { ...state, phase: 'finished', summary };
    }

    function buildSummary(state: GameState, ghost: boolean): Summary {
        const { stats, ignoredFoodRequests, overfeeds, simHour } = state;
        const avg = (stats.hambre + stats.diversion + stats.higiene) / 3;
        let score = Math.round(avg);
        if (ghost) score = Math.max(0, score - 50);
        if (simHour >= TOTAL_SIM_HOURS) score += 20;
        score = Math.min(100, Math.max(0, score));

        const message = ghost
            ? `¡${state.petName} se convirtió en fantasma! No lo cuidaste bien.`
            : `¡${state.petName} sobrevivió las 24 horas! Puntuación: ${score}/100`;

        return {
            score,
            stats: { ...stats },
            ghost,
            message,
            ignoredFoodRequests,
            overfeeds,
        };
    }

    function computeMood(state: GameState): Mood {
        if (state.phase === 'ghost') return 'ghost';
        const wellBeing =
            (100 - state.stats.hambre + state.stats.diversion + state.stats.higiene) / 3;
        if (wellBeing > 70) return 'happy';
        if (wellBeing > 40) return 'neutral';
        return 'sad';
    }

    const feed = useCallback(() => {
        setState((prev) => {
            if (prev.phase !== 'playing') return prev;
            let log = prev.log;
            const stats = { ...prev.stats };
            const wasNeeded = prev.foodRequestActive;

            stats.hambre = Math.max(0, stats.hambre - 40);
            stats.diversion = Math.min(100, stats.diversion + 5);
            stats.higiene = Math.max(0, stats.higiene - 5);

            if (wasNeeded) {
                log = addLog(log, prev.simHour, `¡Ñam! ${prev.petName} comió feliz.`, 'good');
                return {
                    ...prev,
                    stats,
                    log,
                    foodRequestActive: false,
                    ignoredFoodRequests: 0,
                    overfeeds: 0,
                };
            } else {
                const newOverfeeds = prev.overfeeds + 1;
                log = addLog(log, prev.simHour, `Le diste comida a ${prev.petName} pero no tenía hambre...`, 'warning');
                if (newOverfeeds >= MAX_OVERFEEDS) {
                    log = addLog(log, prev.simHour, `¡${prev.petName} explotó por sobrealimentación! Se convirtió en fantasma.`, 'bad');
                    return {
                        ...prev,
                        stats,
                        log,
                        phase: 'ghost',
                        overfeeds: newOverfeeds,
                        summary: buildSummary({ ...prev, stats }, true),
                    };
                }
                return { ...prev, stats, log, overfeeds: newOverfeeds };
            }
        });
    }, []);

    const play = useCallback(() => {
        setState((prev) => {
            if (prev.phase !== 'playing') return prev;
            let log = prev.log;
            const stats = { ...prev.stats };
            const wasEvent = prev.activeEvent?.type === EVENT_TYPES.PLAY;

            stats.diversion = Math.min(100, stats.diversion + 30);
            stats.hambre = Math.min(100, stats.hambre + 10);
            stats.higiene = Math.max(0, stats.higiene - 5);

            if (wasEvent) {
                log = addLog(log, prev.simHour, `¡${prev.petName} se divirtió muchísimo jugando!`, 'good');
                return { ...prev, stats, log, activeEvent: null };
            } else {
                log = addLog(log, prev.simHour, `Jugaste con ${prev.petName}.`, 'info');
                return { ...prev, stats, log };
            }
        });
    }, []);

    const clean = useCallback(() => {
        setState((prev) => {
            if (prev.phase !== 'playing') return prev;
            let log = prev.log;
            const stats = { ...prev.stats };
            const wasEvent = prev.activeEvent?.type === EVENT_TYPES.BATHROOM;

            stats.higiene = Math.min(100, stats.higiene + 40);
            stats.diversion = Math.max(0, stats.diversion - 5);
            stats.hambre = Math.min(100, stats.hambre + 5);

            if (wasEvent) {
                log = addLog(log, prev.simHour, `¡${prev.petName} se sintió aliviado después de ir al baño!`, 'good');
                return { ...prev, stats, log, activeEvent: null };
            } else {
                log = addLog(log, prev.simHour, `Llevaste a ${prev.petName} al baño.`, 'info');
                return { ...prev, stats, log };
            }
        });
    }, []);

    return { state, actions: { start, reset, feed, play, clean } };
}