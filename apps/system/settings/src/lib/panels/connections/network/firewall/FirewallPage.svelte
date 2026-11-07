<script lang="ts">
	import EthernetPort from '@lucide/svelte/icons/ethernet-port';
	import WifiIcon from '@lucide/svelte/icons/wifi';
	import X from '@lucide/svelte/icons/x';
	import { t } from '@luft/i18n';
	import { errorText, IconButton, Row, Section, Segmented, Spinner } from '@luft/ui';
	import SubPage from '#lib/components/SubPage.svelte';
	import { waitForPerson, type Firewall, type GuardedNetwork, type NetworkType, type OpenPort } from '@luft/network';
	import { commands } from '#lib/bindings.js';
	import type { NetworkState } from '../state.svelte';
	import OpenPortRow from './OpenPortRow.svelte';
	import { protocolLabel } from './ports';

	interface Props {
		connections: NetworkState;
		firewall: Firewall;
		onclose: () => void;
	}

	let { connections, firewall, onclose }: Props = $props();

	let closing = $state<string | null>(null);
	let problem = $state('');

	let types = $derived<{ value: NetworkType; label: string }[]>([
		{ value: 'home', label: t('settings-network-firewall-home') },
		{ value: 'public', label: t('settings-network-firewall-public') }
	]);

	const portKey = (port: OpenPort) => `${port.port}/${port.protocol}`;

	function describe(network: GuardedNetwork) {
		if (!network.networkType) return t('settings-network-firewall-unchosen');
		return network.connected ? t('settings-network-firewall-connected') : undefined;
	}

	async function attempt(action: () => Promise<unknown>) {
		problem = '';
		try {
			await action();
			await connections.refreshFirewall();
			return true;
		} catch (reason) {
			problem = errorText(reason);
			return false;
		}
	}

	function classify(network: GuardedNetwork, networkType: NetworkType) {
		void attempt(() => commands.networkSetType({ connection: network.connection, networkType }));
	}

	async function closePort(port: OpenPort) {
		closing = portKey(port);
		await attempt(() => commands.networkClosePort(port, waitForPerson));
		closing = null;
	}
</script>

<SubPage title={t('settings-page-firewall')} {onclose}>
	{#if problem}
		<p class="-my-3 px-2 text-[13px] text-[var(--danger)]">{problem}</p>
	{/if}

	<Section description={t('settings-network-firewall.description')}>
		{#each firewall.networks as network (network.connection)}
			<Row title={network.name} icon={network.medium === 'wifi' ? WifiIcon : EthernetPort} description={describe(network)}>
				<Segmented label={network.name} options={types} value={network.networkType ?? 'public'} onchange={(networkType) => classify(network, networkType)} />
			</Row>
		{:else}
			<Row title={t('settings-network-firewall-no-networks')} />
		{/each}
	</Section>

	<Section title={t('settings-network-firewall-home-title')} description={t('settings-network-firewall-home-title.description')}>
		{#each firewall.openPorts as port (portKey(port))}
			<Row title={t('settings-network-firewall-port', { port: port.port })} description={protocolLabel(port.protocol)}>
				{#if closing === portKey(port)}
					<Spinner />
				{:else}
					<IconButton icon={X} label={t('settings-network-firewall-close-port')} disabled={closing !== null} onclick={() => closePort(port)} />
				{/if}
			</Row>
		{/each}
		<OpenPortRow onopen={(port) => attempt(() => commands.networkOpenPort(port, waitForPerson))} />
	</Section>
</SubPage>
