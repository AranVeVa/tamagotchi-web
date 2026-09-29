export const TOTAL_SIM_HOURS = 24;
export const REAL_MS_PER_SIM_HOUR = 6000;
export const FOOD_REQUEST_HOURS = 6;
export const MAX_IGNORED_FOOD_REQUESTS = 2;
export const MAX_OVERFEEDS = 3;
export const NEEDS_FOOD_THRESHOLD = 60;

export const EVENT_TYPES = {
  PLAY: 'PLAY',
  BATHROOM: 'BATHROOM',
} as const;

export type EventType = typeof EVENT_TYPES[keyof typeof EVENT_TYPES];

export interface Stats {
  hambre: number;
  diversion: number;
  higiene: number;
}

export const INITIAL_STATS: Stats = {
  hambre: 20,
  diversion: 80,
  higiene: 80,
};

export const STATS_DECAY = {
  hambre: 6,
  diversion: 8,
  higiene: 6,
};

export type Tone = 'info' | 'good' | 'warning' | 'bad';

export interface LogEntry {
  id: number;
  hour: number;
  text: string;
  tone: Tone;
}

export type Phase = 'setup' | 'playing' | 'ghost' | 'finished';
export type Mood = 'happy' | 'neutral' | 'sad' | 'ghost';

export interface ActiveEvent {
  type: EventType;
  expiresAt: number;
}

export interface Summary {
  score: number;
  stats: Stats;
  ghost: boolean;
  message: string;
  ignoredFoodRequests: number;
  overfeeds: number;
}

export interface GameState {
  petName: string;
  phase: Phase;
  simHour: number;
  elapsedMs: number;
  stats: Stats;
  foodRequestActive: boolean;
  ignoredFoodRequests: number;
  overfeeds: number;
  activeEvent: ActiveEvent | null;
  log: LogEntry[];
  summary: Summary | null;
  mood: Mood;
}