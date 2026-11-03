import type { Season, WeatherReport } from '@luft/extension-api';

import { seasonOf } from './season.js';

export const EFFECTS = ['rain', 'snow', 'leaves', 'fireflies', 'fog', 'custom'] as const;
export type EffectName = typeof EFFECTS[number];
export type Choice = 'weather' | 'season' | EffectName;
export type Intensity = 'light' | 'steady' | 'heavy';

export interface Scene {
  effect: EffectName;
  density: number;
  wind: number;
}

export interface Outside {
  report: WeatherReport | null;
  now: Date;
}

const DENSITY: Record<Intensity, number> = { light: 0.25, steady: 0.6, heavy: 1 };

const WIND: Record<EffectName, Record<Intensity, number>> = {
  rain: { light: 0.05, steady: 0.1, heavy: 0.22 },
  snow: { light: 0.12, steady: 0.2, heavy: 0.45 },
  leaves: { light: 0.25, steady: 0.4, heavy: 0.7 },
  fireflies: { light: 0.1, steady: 0.1, heavy: 0.1 },
  fog: { light: 0.1, steady: 0.2, heavy: 0.35 },
  custom: { light: 0, steady: 0, heavy: 0 },
};

const KMH_PER_SLOPE: Record<EffectName, number> = { rain: 110, snow: 45, leaves: 45, fireflies: 200, fog: 60, custom: 45 };

const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value));

export function chosen(effect: EffectName, intensity: Intensity): Scene {
  return { effect, density: DENSITY[intensity], wind: WIND[effect][intensity] };
}

function windOf(effect: EffectName, report: WeatherReport): number {
  return clamp(report.wind / KMH_PER_SLOPE[effect], WIND[effect].light * 0.5, WIND[effect].heavy * 1.3);
}

function fromWeather(report: WeatherReport): Scene | null {
  const blowing = (effect: EffectName, density: number): Scene => ({ effect, density, wind: windOf(effect, report) });
  switch (report.condition) {
    case 'storm': return blowing('rain', 1);
    case 'rain': return blowing('rain', clamp(0.35 + report.precipitation / 5, 0.35, 0.9));
    case 'drizzle': return blowing('rain', 0.25);
    case 'snow': return blowing('snow', clamp(0.3 + report.precipitation / 2, 0.3, 1));
    case 'fog': return blowing('fog', 0.6);
    case 'clear':
    case 'clouds': return null;
  }
}

function night({ report, now }: Outside): boolean {
  if (report) return !report.daytime;
  const hour = now.getHours();
  return hour >= 21 || hour < 6;
}

const SEASONAL: Record<Season, (outside: Outside, intensity: Intensity) => Scene | null> = {
  winter: (_outside, intensity) => chosen('snow', intensity),
  spring: () => chosen('rain', 'light'),
  summer: (outside, intensity) => night(outside) ? chosen('fireflies', intensity) : null,
  autumn: (_outside, intensity) => chosen('leaves', intensity),
};

/** What shows for what the person chose: an effect of their own, the weather outside, or the season when it's calm. */
export function resolve(choice: Choice, intensity: Intensity, outside: Outside): Scene | null {
  if (choice !== 'weather' && choice !== 'season') return chosen(choice, intensity);
  const weather = outside.report && fromWeather(outside.report);
  if (weather || choice === 'weather') return weather;
  return SEASONAL[outside.report?.season ?? seasonOf(outside.now)](outside, intensity);
}
