import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Soup from 'gi://Soup?version=3.0';

import type { ApiContext } from './context.js';
import { whereabouts } from './location.js';
import type { Weather, WeatherCondition, WeatherReport } from './types.js';

Gio._promisify(Soup.Session.prototype, 'send_and_read_async');

const FORECAST = 'https://api.open-meteo.com/v1/forecast';
const REFRESH_S = 30 * 60;
const FRESH_FOR_US = REFRESH_S * GLib.USEC_PER_SEC;
const decoder = new TextDecoder();

interface Forecast {
  current: { time: number; temperature_2m: number; precipitation: number; weather_code: number; wind_speed_10m: number; is_day: number };
}

function condition(code: number): WeatherCondition {
  if (code >= 95) return 'storm';
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snow';
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return 'rain';
  if (code >= 51 && code <= 57) return 'drizzle';
  if (code === 45 || code === 48) return 'fog';
  return code >= 2 ? 'clouds' : 'clear';
}

/** The weather where the computer is, from Open-Meteo, with the position rounded to about a kilometre. */
class WeatherSource {
  private readonly session = new Soup.Session({ timeout: 20 });
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
    const place = await whereabouts();
    if (!place) return null;
    const query = `latitude=${place.latitude.toFixed(2)}&longitude=${place.longitude.toFixed(2)}&timeformat=unixtime` +
      '&current=temperature_2m,precipitation,weather_code,wind_speed_10m,is_day';
    const message = Soup.Message.new('GET', `${FORECAST}?${query}`)!;
    const bytes = await this.session.send_and_read_async(message, GLib.PRIORITY_LOW, null);
    if (message.get_status() !== Soup.Status.OK) return null;
    const { current } = JSON.parse(decoder.decode(bytes.toArray())) as Forecast;
    return {
      condition: condition(current.weather_code),
      temperature: current.temperature_2m,
      precipitation: current.precipitation,
      wind: current.wind_speed_10m,
      daytime: current.is_day === 1,
      time: current.time * 1000,
    };
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
