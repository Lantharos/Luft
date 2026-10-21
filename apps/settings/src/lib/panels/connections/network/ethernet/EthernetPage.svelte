<script lang="ts">
	import EthernetPort from '@lucide/svelte/icons/ethernet-port';
	import { t } from '@luft/i18n';
	import { Row, Section, Switch } from '@luft/ui';
	import SubPage from '#lib/components/SubPage.svelte';
	import type { Wired } from '@luft/network';
	import type { Target } from '../connection/profile';
	import { detailRows, speedLabel } from '../describe';
	import type { NetworkState } from '../state.svelte';

	interface Props {
		connections: NetworkState;
		wired: Wired[];
		onconfigure: (target: Target, title: string) => void;
		onclose: () => void;
	}

	let { connections, wired, onconfigure, onclose }: Props = $props();

	function details(wired: Wired) {
		const speed: [string, string][] = wired.speed ? [[t('settings-network-detail-speed'), speedLabel(wired.speed)]] : [];
		return wired.details ? [...speed, ...detailRows(wired.details)] : speed;
	}
</script>

<SubPage title={t('settings-page-ethernet')} back={t('settings-page-network')} {onclose}>
	{#each wired as device (device.device)}
		<Section title={wired.length > 1 ? connections.wiredTitle(device) : undefined}>
			<Row title={connections.wiredTitle(device)} icon={EthernetPort} description={connections.wiredSummary(device)}>
				<Switch
					label={connections.wiredTitle(device)}
					checked={device.state === 'connected' || device.state === 'connecting'}
					disabled={device.state === 'unplugged'}
					onchange={(on) => connections.toggleWired(device, on)}
				/>
			</Row>
			{#each details(device) as [label, value] (label)}
				<Row title={label}>
					<span class="value">{value}</span>
				</Row>
			{/each}
			{#if device.connection}
				{@const path = device.connection}
				<Row
					title={t('settings-network-connection-settings')}
					onclick={() => onconfigure({ kind: 'wired', path, device: device.device }, connections.wiredTitle(device))}
				/>
			{/if}
		</Section>
	{/each}
</SubPage>

<style>
	.value {
		overflow-wrap: anywhere;
		white-space: pre-line;
		text-align: right;
		color: var(--text-soft);
		user-select: text;
	}
</style>
