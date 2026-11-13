import { isInside } from '@luft/ui';
import { SvelteSet } from 'svelte/reactivity';
import { commands } from '#lib/bindings.js';
import type { NetworkAsk, NetworkLocation, NetworkPlace, PluggedDevice } from '#lib/bindings.js';
import { settings } from '#lib/state/settings.svelte.js';
import { addressName, normalizeAddress, sameAddress } from '../location/addresses';

const RECENT_SERVERS = 8;
const CANCELLED = 'cancelled';
const CAMERA_SCHEME = 'gphoto2:';

export type NetworkEntry = { place: NetworkPlace; location: NetworkLocation | null; saved: boolean };
export type DeviceEntry = { name: string; uri: string; camera: boolean; location: NetworkLocation | null };

export class NetworkState {
	locations = $state.raw<NetworkLocation[]>([]);
	plugged = $state.raw<PluggedDevice[]>([]);
	ask = $state.raw<Exclude<NetworkAsk, { kind: 'done' }> | null>(null);
	readonly connecting = new SvelteSet<string>();

	entries = $derived.by((): NetworkEntry[] => {
		const saved = settings.value.networkPlaces;
		const connected = this.locations.filter((location) => !location.device).map((location) => ({
			place: { name: location.name, uri: location.uri },
			location,
			saved: saved.some((place) => sameAddress(place.uri, location.uri))
		}));
		const waiting = saved
			.filter((place) => !this.locations.some((location) => sameAddress(place.uri, location.uri)))
			.map((place) => ({ place, location: null, saved: true }));
		const pending = [...this.connecting]
			.filter((uri) => !connected.some((entry) => sameAddress(entry.place.uri, uri)) && !waiting.some((entry) => sameAddress(entry.place.uri, uri)))
			.map((uri) => ({ place: { name: addressName(uri), uri }, location: null, saved: false }));
		return [...connected, ...waiting, ...pending];
	});

	devices = $derived.by((): DeviceEntry[] => [
		...this.locations.filter((location) => location.device).map((location) => ({ name: location.name, uri: location.uri, location })),
		...this.plugged.map((device) => ({ ...device, location: null }))
	].map((device) => ({ ...device, camera: device.uri.startsWith(CAMERA_SCHEME) })));

	load = async () => {
		[this.locations, this.plugged] = await Promise.all([
			commands.networkLocations().catch(() => this.locations),
			commands.networkPlugged().catch(() => this.plugged)
		]);
	};

	receiveAsk = (ask: NetworkAsk) => {
		if (ask.kind === 'done') {
			if (this.ask?.id === ask.id) this.ask = null;
			return;
		}
		this.ask = ask;
	};

	holding(path: string) {
		return this.locations
			.filter((location) => isInside(path, location.path))
			.sort((a, b) => b.path.length - a.path.length)[0];
	}

	addressOf(path: string) {
		const location = this.holding(path);
		if (!location) return null;
		const rest = path.slice(location.path.length).split('/').filter(Boolean).map(encodeURIComponent).join('/');
		return rest ? `${location.uri.replace(/\/+$/, '')}/${rest}` : location.uri;
	}

	connect = async (typed: string, keep = false) => {
		const uri = normalizeAddress(typed);
		if (!uri) throw new Error('That doesn’t look like a server address');
		const known = this.#pathFor(uri);
		if (known) return known;
		const location = await this.#mount(uri);
		if (!location) return null;
		this.#remember(uri);
		if (keep) this.save({ name: location.name, uri });
		return location.path;
	};

	open = async (device: DeviceEntry) => device.location?.path ?? (await this.#mount(device.uri))?.path ?? null;

	async #mount(uri: string) {
		this.connecting.add(uri);
		try {
			const location = await commands.networkConnect({ uri });
			await this.load();
			return location;
		} catch (caught) {
			if (String(caught).includes(CANCELLED)) return null;
			throw caught;
		} finally {
			this.connecting.delete(uri);
		}
	}

	disconnect = async (uri: string) => {
		await commands.networkDisconnect({ uri });
		await this.load();
	};

	save(place: NetworkPlace) {
		if (settings.value.networkPlaces.some((saved) => sameAddress(saved.uri, place.uri))) return;
		settings.update((current) => ({ ...current, networkPlaces: [...current.networkPlaces, place] }));
	}

	forget(uri: string) {
		settings.update((current) => ({ ...current, networkPlaces: current.networkPlaces.filter((place) => !sameAddress(place.uri, uri)) }));
	}

	forgetRecent(uri: string) {
		settings.update((current) => ({ ...current, recentServers: current.recentServers.filter((server) => server !== uri) }));
	}

	nameFor(uri: string) {
		return this.locations.find((location) => sameAddress(location.uri, uri))?.name ?? addressName(uri);
	}

	#pathFor(uri: string) {
		const location = this.locations.find((candidate) => uri.startsWith(candidate.uri.replace(/\/+$/, '')));
		if (!location) return null;
		const rest = uri.slice(location.uri.replace(/\/+$/, '').length).split('/').filter(Boolean).map(decodeURIComponent);
		return [location.path.replace(/\/+$/, ''), ...rest].join('/');
	}

	#remember(uri: string) {
		settings.update((current) => ({
			...current,
			recentServers: [uri, ...current.recentServers.filter((server) => server !== uri)].slice(0, RECENT_SERVERS)
		}));
	}
}
