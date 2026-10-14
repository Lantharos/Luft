import { useSettings } from '#lib/state/gsettings.svelte.js';

export type WeekStart = 'automatic' | 'monday' | 'sunday';

const CHOSEN: Record<WeekStart, number | null> = { automatic: null, monday: 1, sunday: 0 };
const SUNDAY = Date.UTC(2023, 0, 1);
const DAY = 86_400_000;

const regionLocale = (region: string) => region.split(/[.@]/)[0].replace('_', '-') || navigator.language;

export const weekdayName = (day: number, style: 'long' | 'narrow') =>
	new Intl.DateTimeFormat(undefined, { weekday: style, timeZone: 'UTC' }).format(SUNDAY + day * DAY);

export function useWeekStart() {
	const kestrel = useSettings<{ 'week-start': WeekStart }>('com.lantharos.kestrel', ['week-start']);
	const locale = useSettings<{ region: string }>('org.gnome.system.locale', ['region']);
	const regional = $derived(new Intl.Locale(regionLocale(locale.values.region ?? '')).getWeekInfo().firstDay % 7);

	return {
		get choice(): WeekStart {
			return kestrel.values['week-start'] ?? 'automatic';
		},
		get regional() {
			return regional;
		},
		get firstDay() {
			return CHOSEN[this.choice] ?? regional;
		},
		choose: (choice: WeekStart) => kestrel.set('week-start', choice)
	};
}
