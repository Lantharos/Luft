<script lang="ts">
	import { Row, Section } from '@luft/ui';
	import { activate, deactivate, disconnect, type Link, type Network } from '../api';
	import { bandLabel, detailRows, linkLabel, securityLabel, signalLabel, speedLabel, type DetailRow } from '../describe';
	import type { Target } from './profile';

	interface Props {
		target: Target;
		network: Network;
	}

	interface Live {
		state: Link;
		rows: DetailRow[];
		connect: () => Promise<void>;
		disconnect: () => Promise<void>;
	}

	let { target, network }: Props = $props();

	let busy = $state(false);
	let live = $derived(describe(target, network));

	function describe(target: Target, network: Network): Live | null {
		if (target.kind === 'wifi') {
			const wifi = network.wifi;
			const found = wifi?.networks.find((candidate) => candidate.ssid === target.ssid);
			if (!wifi || !found) return null;
			const rows: DetailRow[] = [['Signal', `${signalLabel(found.strength)} (${found.strength}%)`]];
			if (found.radio) {
				rows.push(['Band', bandLabel(found.radio.frequency)]);
				if (found.radio.bitrate) rows.push(['Link speed', speedLabel(found.radio.bitrate)]);
				rows.push(['Access point', found.radio.bssid]);
			}
			rows.push(['Security', securityLabel(found.security)]);
			return {
				state: found.state,
				rows: found.details ? [...rows, ...detailRows(found.details)] : rows,
				connect: () => activate({ connection: target.path, device: wifi.device }),
				disconnect: () => disconnect(wifi.device)
			};
		}
		if (target.kind === 'wired') {
			const wired = network.wired.find((candidate) => candidate.device === target.device);
			if (!wired) return null;
			const speed: DetailRow[] = wired.speed ? [['Link speed', speedLabel(wired.speed)]] : [];
			return {
				state: wired.state,
				rows: wired.details ? [...speed, ...detailRows(wired.details)] : speed,
				connect: () => activate({ connection: target.path, device: wired.device }),
				disconnect: () => disconnect(wired.device)
			};
		}
		const vpn = network.vpns.find((candidate) => candidate.connection === target.path);
		if (!vpn) return null;
		return {
			state: vpn.state,
			rows: [],
			connect: () => activate({ connection: vpn.connection }),
			disconnect: () => deactivate(vpn.active!)
		};
	}

	async function run(action: () => Promise<void>) {
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
		<Row title="Status" description={linkLabel(current.state)}>
			{#if current.state === 'disconnected'}
				<button type="button" class="button" disabled={busy} onclick={() => run(current.connect)}>Connect</button>
			{:else if current.state !== 'unplugged'}
				<button type="button" class="button" disabled={busy} onclick={() => run(current.disconnect)}>Disconnect</button>
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
