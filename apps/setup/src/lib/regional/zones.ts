import type { Zone } from '#lib/bridge/system.js';

export interface NamedZone extends Zone {
	country: string;
}

export function namedZones(zones: Zone[], locale: string): NamedZone[] {
	const countries = new Intl.DisplayNames(locale, { type: 'region' });
	const collator = new Intl.Collator(locale);
	return zones
		.map((zone) => ({ ...zone, country: countries.of(zone.code) ?? zone.code }))
		.sort((a, b) => collator.compare(a.country, b.country) || collator.compare(a.city, b.city));
}
