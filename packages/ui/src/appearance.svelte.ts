import { listen } from '@lantharos/sabine';

const ACCENT_CHANGED = 'kestrel.accent';
const SCHEME_CHANGED = 'appearance.scheme';

interface Accent {
	color: string;
}

export type Scheme = 'dark' | 'light';

export interface Appearance {
	translucent: boolean;
	accent: Accent | null;
	scheme: Scheme;
}

function readableOn(hex: string) {
	const [red, green, blue] = [1, 3, 5].map((offset) => parseInt(hex.slice(offset, offset + 2), 16) / 255);
	const luminance = 0.2126 * red + 0.7152 * green + 0.0722 * blue;
	return luminance > 0.5 ? '#181817' : '#f7f7f4';
}

class AppearanceState {
	translucent = $state(false);
	accent = $state<string | null>(null);
	accentText = $derived(this.accent ? readableOn(this.accent) : null);
	scheme = $state<Scheme>('dark');

	start(initial: Appearance) {
		this.translucent = initial.translucent;
		this.accent = initial.accent?.color ?? null;
		this.scheme = initial.scheme;
		const stops = [
			listen<Accent>(ACCENT_CHANGED, ({ color }) => (this.accent = color)),
			listen<Scheme>(SCHEME_CHANGED, (scheme) => (this.scheme = scheme))
		];
		return () => stops.forEach((stop) => stop());
	}
}

export const appearance = new AppearanceState();
