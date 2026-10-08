import { useSettings } from '#lib/state/gsettings.svelte.js';

export type Mode = 'none' | 'manual' | 'auto';
export type Protocol = 'http' | 'https' | 'socks';

type Main = { mode: Mode; 'autoconfig-url': string; 'ignore-hosts': string[] };
export type Server = { host: string; port: number };

const MODE_LABELS: Record<Mode, string> = {
	none: 'Off',
	manual: 'Manual',
	auto: 'Automatic'
};

export const proxyLabel = (mode: Mode) => MODE_LABELS[mode];

export function useProxy() {
	const main = useSettings<Main>('org.gnome.system.proxy', ['mode', 'autoconfig-url', 'ignore-hosts']);
	const servers: Record<Protocol, ReturnType<typeof useSettings<Server>>> = {
		http: useSettings<Server>('org.gnome.system.proxy.http', ['host', 'port']),
		https: useSettings<Server>('org.gnome.system.proxy.https', ['host', 'port']),
		socks: useSettings<Server>('org.gnome.system.proxy.socks', ['host', 'port'])
	};
	return {
		main,
		servers,
		get available() {
			return main.loaded;
		},
		get mode(): Mode {
			return main.values.mode ?? 'none';
		}
	};
}

export type Proxy = ReturnType<typeof useProxy>;
