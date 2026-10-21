import { locale } from '../i18n/index.js';

let cached: { locale: string; format: Intl.DurationFormat } | null = null;

function formatter(): Intl.DurationFormat {
  const current = locale();
  if (cached?.locale !== current) cached = { locale: current, format: new Intl.DurationFormat(current, { style: 'short', minutesDisplay: 'always' }) };
  return cached.format;
}

export function shortDuration(seconds: number): string {
  const totalMinutes = Math.round(seconds / 60);
  return formatter().format({ hours: Math.floor(totalMinutes / 60), minutes: totalMinutes % 60 });
}
