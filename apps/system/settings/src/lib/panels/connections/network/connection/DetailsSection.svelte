<script lang="ts">
	import { t } from '@luft/i18n';
	import { Row, Section } from '@luft/ui';
	import { percent } from '#lib/format.js';
	import type { Link, Network } from '@luft/network';
	import { commands } from '#lib/bindings.js';
	import { bandLabel, detailRows, linkLabel, securityLabel, signalLabel, speedLabel, type DetailRow } from '../describe';
	import type { Target } from './profile';

	interface Props {
		target: Target;
		network: Network;
	}

	interface Live {
		state: Link;
		rows: DetailRow[];
		connect: () => Promise<unknown>;
		disconnect: () => Promise<unknown>;
	}

	let { target, network }: Props = $props();

	let busy = $state(false);
	let live = $derived(describe(target, network));

	function describe(target: Target, network: Network): Live | null {
		if (target.kind === 'wifi') {
			const wifi = network.wifi;
			const found = wifi?.networks.find((candidate) => candidate.ssid === target.ssid);
			if (!wifi || !found) return null;
			const rows: DetailRow[] = [[t('settings-network-detail-signal'), t('settings-network-signal', { quality: signalLabel(found.strength), strength: percent(found.strength / 100) })]];
			if (found.radio) {
				rows.push([t('settings-network-detail-band'), bandLabel(found.radio.frequency)]);
				if (found.radio.bitrate) rows.push([t('settings-network-detail-speed'), speedLabel(found.radio.bitrate)]);
				rows.push([t('settings-network-detail-access-point'), found.radio.bssid]);
			}
			rows.push([t('settings-network-detail-security'), securityLabel(found.security)]);
			return {
				state: found.state,
				rows: found.details ? [...rows, ...detailRows(found.details)] : rows,
				connect: () => commands.networkActivate({ connection: target.path, device: wifi.device }),
				disconnect: () => commands.networkDisconnect({ device: wifi.device })
			};
		}
		if (target.kind === 'wired') {
			const wired = network.wired.find((candidate) => candidate.device === target.device);
			if (!wired) return null;
			const speed: DetailRow[] = wired.speed ? [[t('settings-network-detail-speed'), speedLabel(wired.speed)]] : [];
			return {
				state: wired.state,
				rows: wired.details ? [...speed, ...detailRows(wired.details)] : speed,
				connect: () => commands.networkActivate({ connection: target.path, device: wired.device }),
				disconnect: () => commands.networkDisconnect({ device: wired.device })
			};
		}
		const vpn = network.vpns.find((candidate) => candidate.connection === target.path);
		if (!vpn) return null;
		return {
			state: vpn.state,
			rows: [],
			connect: () => commands.networkActivate({ connection: vpn.connection }),
			disconnect: () => commands.networkDeactivate({ active: vpn.active! })
		};
	}

	async function run(action: () => Promise<unknown>) {
		busy = true;
		try {
			await action();
		} finally {
			busy = false;
		}
	}
</script>

{#if live}
	{@const current = live}
	<Section>
		<Row title={linkLabel(current.state)}>
			{#if current.state === 'disconnected'}
				<button type="button" class="button" disabled={busy} onclick={() => run(current.connect)}>{t('settings-network-connect')}</button>
			{:else if current.state !== 'unplugged'}
				<button type="button" class="button" disabled={busy} onclick={() => run(current.disconnect)}>{t('settings-network-disconnect')}</button>
			{/if}
		</Row>
		{#each current.rows as [label, value] (label)}
			<Row title={label}>
				<span class="value">{value}</span>
			</Row>
		{/each}
	</Section>
{/if}

<style>
	.value {
		overflow-wrap: anywhere;
		white-space: pre-line;
		text-align: right;
		color: var(--text-soft);
		user-select: text;
	}
</style>
