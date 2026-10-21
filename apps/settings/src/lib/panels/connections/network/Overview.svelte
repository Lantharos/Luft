<script lang="ts">
	import EthernetPort from '@lucide/svelte/icons/ethernet-port';
	import Globe from '@lucide/svelte/icons/globe';
	import Plane from '@lucide/svelte/icons/plane';
	import Shield from '@lucide/svelte/icons/shield';
	import WifiIcon from '@lucide/svelte/icons/wifi';
	import { t } from '@luft/i18n';
	import { ActionRow, Row, Section, Switch } from '@luft/ui';
	import { setAirplane, setWifi, type Network } from './api';
	import { proxyLabel, type Proxy } from './proxy/proxy.svelte';
	import type { NetworkState } from './state.svelte';

	type Page = 'wifi' | 'ethernet' | 'vpn' | 'proxy';

	interface Props {
		connections: NetworkState;
		network: Network;
		proxy: Proxy;
		onopen: (page: Page) => void;
	}

	let { connections, network, proxy, onopen }: Props = $props();

	let activeVpn = $derived(network.vpns.find((vpn) => vpn.state !== 'disconnected'));
	let empty = $derived(!network.wifi && !network.airplane && !network.wired.length);
</script>

<Section>
	{#if network.wifi}
		{@const wifi = network.wifi}
		<ActionRow title={t('settings-network-wifi')} icon={WifiIcon} description={connections.wifiSummary(wifi)} onclick={() => onopen('wifi')}>
			{#snippet actions()}
				<Switch label={t('settings-network-wifi')} checked={wifi.enabled} disabled={!wifi.hardwareEnabled} onchange={setWifi} />
			{/snippet}
		</ActionRow>
	{/if}
	{#each network.wired as wired (wired.device)}
		<ActionRow title={connections.wiredTitle(wired)} icon={EthernetPort} description={connections.wiredSummary(wired)} alert={Boolean(connections.problems[wired.device])} onclick={() => onopen('ethernet')}>
			{#snippet actions()}
				<Switch
					label={connections.wiredTitle(wired)}
					checked={wired.state === 'connected' || wired.state === 'connecting'}
					disabled={wired.state === 'unplugged'}
					onchange={(on) => connections.toggleWired(wired, on)}
				/>
			{/snippet}
		</ActionRow>
	{/each}
	<ActionRow
		title={t('settings-network-vpn')}
		icon={Shield}
		description={activeVpn && (connections.problems[activeVpn.connection] ?? t('settings-network-wifi-connected', { network: activeVpn.name }))}
		onclick={() => onopen('vpn')}
	/>
	{#if network.airplane}
		{@const airplane = network.airplane}
		<Row title={t('settings-network-airplane')} icon={Plane} description={airplane.hardware ? t('settings-network-airplane-hardware') : t('settings-network-airplane.description')}>
			<Switch label={t('settings-network-airplane')} checked={airplane.enabled || airplane.hardware} disabled={airplane.hardware} onchange={setAirplane} />
		</Row>
	{/if}
	{#if proxy.available}
		<ActionRow title={t('settings-network-proxy')} icon={Globe} description={proxy.mode === 'none' ? undefined : proxyLabel(proxy.mode)} onclick={() => onopen('proxy')} />
	{/if}
</Section>

{#if empty}
	<Section>
		<Row title={t('settings-network-empty')} description={t('settings-network-empty.description')} />
	</Section>
{/if}
