<script lang="ts">
	import BrickWallShield from '@lucide/svelte/icons/brick-wall-shield';
	import EthernetPort from '@lucide/svelte/icons/ethernet-port';
	import Globe from '@lucide/svelte/icons/globe';
	import Plane from '@lucide/svelte/icons/plane';
	import Shield from '@lucide/svelte/icons/shield';
	import WifiIcon from '@lucide/svelte/icons/wifi';
	import { t } from '@luft/i18n';
	import { ActionRow, Row, Section, Switch } from '@luft/ui';
	import type { Network } from '@luft/network';
	import { commands } from '#lib/bindings.js';
	import { firewallSummary } from './firewall/summary';
	import { proxyLabel, type Proxy } from './proxy/proxy.svelte';
	import type { NetworkState } from './state.svelte';

	type Page = 'wifi' | 'ethernet' | 'vpn' | 'firewall' | 'proxy';

	interface Props {
		connections: NetworkState;
		network: Network;
		proxy: Proxy;
		onopen: (page: Page) => void;
	}

	let { connections, network, proxy, onopen }: Props = $props();

	let activeVpn = $derived(network.vpns.find((vpn) => vpn.state !== 'disconnected'));
	let vpnSummary = $derived(
		activeVpn
			? (connections.problems[activeVpn.connection] ?? t('settings-network-wifi-connected', { network: activeVpn.name }))
			: network.vpns.length
				? t('settings-network-vpn-off')
				: t('settings-network-vpn-none')
	);
	let empty = $derived(!network.wifi && !network.airplane && !network.wired.length);
</script>

<Section>
	{#if network.wifi}
		{@const wifi = network.wifi}
		<ActionRow title={t('settings-network-wifi')} icon={WifiIcon} description={connections.wifiSummary(wifi)} onclick={() => onopen('wifi')}>
			{#snippet actions()}
				<Switch label={t('settings-network-wifi')} checked={wifi.enabled} disabled={!wifi.hardwareEnabled} onchange={(enabled) => commands.networkSetWifi({ enabled })} />
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
	<Row title={t('settings-network-vpn')} icon={Shield} description={vpnSummary} onclick={() => onopen('vpn')} />
	{#if connections.firewall}
		<Row title={t('settings-page-firewall')} icon={BrickWallShield} description={firewallSummary(connections.firewall)} onclick={() => onopen('firewall')} />
	{/if}
	{#if network.airplane}
		{@const airplane = network.airplane}
		<Row title={t('settings-network-airplane')} icon={Plane} description={airplane.hardware ? t('settings-network-airplane-hardware') : t('settings-network-airplane.description')}>
			<Switch label={t('settings-network-airplane')} checked={airplane.enabled || airplane.hardware} disabled={airplane.hardware} onchange={(enabled) => commands.networkSetAirplane({ enabled })} />
		</Row>
	{/if}
	{#if proxy.available}
		<Row
			title={t('settings-network-proxy')}
			icon={Globe}
			description={proxy.mode === 'none' ? t('settings-network-proxy-off') : proxyLabel(proxy.mode)}
			onclick={() => onopen('proxy')}
		/>
	{/if}
</Section>

{#if empty}
	<Section>
		<Row title={t('settings-network-empty')} description={t('settings-network-empty.description')} />
	</Section>
{/if}
