import type { Network } from '@luft/network';
import { commands, events } from '#lib/bindings.js';
import type { AuthorizedKey, RemoteLogin, SshSession, User } from '#lib/bindings.js';

function addresses(network: Network) {
	const details = [...network.wired.filter((wired) => wired.state === 'connected'), ...(network.wifi?.networks ?? []).filter((wifi) => wifi.state === 'connected')].map(
		(connection) => connection.details
	);
	return details.flatMap((detail) => (detail ? [...detail.ipv4, ...detail.ipv6] : []));
}

export class RemoteLoginState {
	current = $state<RemoteLogin | null | undefined>(undefined);
	keys = $state<AuthorizedKey[]>([]);
	sessions = $state<SshSession[]>([]);
	people = $state<User[]>([]);
	me = $state<User | null>(null);
	addresses = $state<string[]>([]);

	private stops: (() => void)[] = [];

	async load() {
		this.stops = [events.remoteLoginChanged((next) => (this.current = next)), events.remoteLoginSessions((next) => (this.sessions = next))];
		await this.refresh();
	}

	refresh = async () => {
		const [current, users] = await Promise.all([commands.remoteLogin().catch(() => null), commands.users()]);
		this.current = current;
		this.me = users.me;
		this.people = [users.me, ...users.others];
		if (current?.enabled) await Promise.all([this.refreshKeys(), this.refreshSessions(), this.refreshAddresses()]);
	};

	refreshKeys = async () => {
		this.keys = await commands.remoteLoginKeys();
	};

	async refreshSessions() {
		this.sessions = await commands.remoteLoginSessions().catch(() => []);
	}

	async refreshAddresses() {
		this.addresses = await commands
			.networkOpen()
			.then(addresses)
			.catch(() => []);
	}

	stop() {
		for (const stop of this.stops) stop();
	}
}
