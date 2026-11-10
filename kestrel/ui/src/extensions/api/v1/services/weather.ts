import GLib from 'gi://GLib';

import { askLuft, lookupsAllowed } from '../../../../shared/network/luftSite.js';
import type { ApiContext } from '../core/context.js';
import { whereabouts } from './location.js';
import type { Season, Weather, WeatherCondition, WeatherReport } from '../types.js';

const WEATHER = '/api/weather';
const MAX_BYTES = 4096;
const LATEST_TIME_S = 4_102_444_800;
const REFRESH_S = 30 * 60;
const FRESH_FOR_US = REFRESH_S * GLib.USEC_PER_SEC;
const decoder = new TextDecoder();

const NORTHERN_SEASONS: Season[] = ['winter', 'winter', 'spring', 'spring', 'spring', 'summer', 'summer', 'summer', 'autumn', 'autumn', 'autumn', 'winter'];
const OPPOSITE: Record<Season, Season> = { winter: 'summer', spring: 'autumn', summer: 'winter', autumn: 'spring' };

function seasonAt(latitude: number, date: Date): Season {
  const northern = NORTHERN_SEASONS[date.getMonth()];
  return latitude >= 0 ? northern : OPPOSITE[northern];
}

function condition(code: number): WeatherCondition {
  if (code >= 95) return 'storm';
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snow';
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return 'rain';
  if (code >= 51 && code <= 57) return 'drizzle';
  if (code === 45 || code === 48) return 'fog';
  return code >= 2 ? 'clouds' : 'clear';
}

const within = (value: unknown, lowest: number, highest: number): value is number => typeof value === 'number' && value >= lowest && value <= highest;
const isTime = (value: unknown): value is number => Number.isInteger(value) && within(value, 0, LATEST_TIME_S);
const tenth = (degrees: number) => (Math.round(degrees * 10) / 10).toFixed(1);

function report(text: string, latitude: number): WeatherReport {
  const { time, code, temperature, precipitation, wind, day, sunrise, sunset } = JSON.parse(text) as Record<string, unknown>;
  if (!isTime(time) || !isTime(sunrise) || !isTime(sunset) || !Number.isInteger(code) || !within(code, 0, 99) || !within(temperature, -100, 70) ||
    !within(precipitation, 0, 1000) || !within(wind, 0, 500) || typeof day !== 'boolean')
    throw new Error('The weather report is out of bounds');
  return {
    condition: condition(code),
    temperature,
    precipitation,
    wind,
    daytime: day,
    sunrise: sunrise * 1000,
    sunset: sunset * 1000,
    season: seasonAt(latitude, new Date(time * 1000)),
    time: time * 1000,
  };
}

class WeatherSource {
  private readonly listeners = new Set<(report: WeatherReport) => void>();
  private report: { value: WeatherReport; at: number } | null = null;
  private pending: Promise<WeatherReport | null> | null = null;
  private timer = 0;

  current(): Promise<WeatherReport | null> {
    if (this.report && GLib.get_monotonic_time() - this.report.at < FRESH_FOR_US) return Promise.resolve(this.report.value);
    this.pending ??= this.fetch().catch(() => null).then(report => {
      this.pending = null;
      if (report) {
        this.report = { value: report, at: GLib.get_monotonic_time() };
        for (const listener of [...this.listeners]) listener(report);
      }
      return report;
    });
    return this.pending;
  }

  watch(changed: (report: WeatherReport) => void): () => void {
    this.listeners.add(changed);
    this.timer ||= GLib.timeout_add_seconds(GLib.PRIORITY_LOW, REFRESH_S, () => {
      void this.current();
      return GLib.SOURCE_CONTINUE;
    });
    return () => {
      this.listeners.delete(changed);
      if (this.listeners.size || !this.timer) return;
      GLib.source_remove(this.timer);
      this.timer = 0;
    };
  }

  private async fetch(): Promise<WeatherReport | null> {
    if (!lookupsAllowed()) return null;
    const place = await whereabouts();
    if (!place) return null;
    const answer = await askLuft(`${WEATHER}?lat=${tenth(place.latitude)}&lon=${tenth(place.longitude)}`, MAX_BYTES);
    return report(decoder.decode(answer), place.latitude);
  }
}

let shared: WeatherSource | null = null;

export function weatherApi({ scope }: ApiContext): Weather {
  const source = shared ??= new WeatherSource();
  return {
    current: () => source.current(),
    onChanged: changed => scope.disposable(source.watch(scope.guard(changed))),
  };
}
