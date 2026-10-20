<script lang="ts">
	import EthernetPort from '@lucide/svelte/icons/ethernet-port';
	import Globe from '@lucide/svelte/icons/globe';
	import History from '@lucide/svelte/icons/history';
	import Plane from '@lucide/svelte/icons/plane';
	import Settings from '@lucide/svelte/icons/settings';
	import WifiIcon from '@lucide/svelte/icons/wifi';
	import { onMount } from 'svelte';
	import { t } from '@luft/i18n';
	import { IconButton, Row, Section, Switch } from '@luft/ui';
	import ConnectionPage from './connection/ConnectionPage.svelte';
	import type { Target } from './connection/profile';
	import ProxyDialog from './ProxyDialog.svelte';
	import VpnSection from './vpn/VpnSection.svelte';
	import KnownNetworks from './wifi/KnownNetworks.svelte';
	import WifiSection from './wifi/WifiSection.svelte';
	import { activate, close, deactivate, disconnect, onChanged, onFailed, open, setAirplane, setWifi, type Network, type Vpn, type Wifi, type Wired } from './api';
	import { linkLabel, speedLabel } from './describe';
	import { proxyLabel, useProxy } from './proxy.svelte';

	interface Editing {
		target: Target;
		title: string;
	}

	const proxy = useProxy();

	let network = $state<Network | null>(null);
	let editing = $state<Editing | null>(null);
	let browsingKnown = $state(false);
	let proxying = $state(false);
	let problems = $state<Record<string, string>>({});

	let wifi = $derived(network?.wifi ?? null);
	let empty = $derived(network && !network.wifi && !network.airplane && !network.wired.length);

	function wifiSummary(wifi: Wifi) {
		if (!wifi.hardwareEnabled) return t('settings-network-wifi-hardware-off');
		const connected = wifi.enabled && wifi.networks.find((candidate) => candidate.state === 'connected');
		return connected ? t('settings-network-wifi-connected', { network: connected.ssid }) : undefined;
	}

	function wiredSummary(wired: Wired) {
		if (problems[wired.device]) return problems[wired.device];
		if (wired.state === 'connected' && wired.speed) return t('settings-network-wired-connected', { speed: speedLabel(wired.speed) });
		return wired.state === 'disconnected' ? undefined : linkLabel(wired.state);
	}

	async function attempt(key: string, action: () => Promise<void>) {
		delete problems[key];
		try {
			await action();
		} catch {
			problems[key] = t('settings-network-connect-failed');
		}
	}

	function toggleWired(wired: Wired, on: boolean) {
		void attempt(wired.device, () => (on ? activate({ device: wired.device }) : disconnect(wired.device)));
	}

	function wiredTitle(wired: Wired) {
		return network!.wired.length > 1 ? t('settings-network-ethernet-named', { name: wired.name }) : t('settings-network-ethernet');
	}

	function toggleVpn(vpn: Vpn, on: boolean) {
		void attempt(vpn.connection, () => (on ? activate({ connection: vpn.connection }) : deactivate(vpn.active!)));
	}

	onMount(() => {
		const stopChanged = onChanged((next) => (network = next));
		const stopFailed = onFailed((failure) => {
			const vpn = network?.vpns.find((candidate) => candidate.active === failure.path || candidate.name === failure.name);
			const wired = network?.wired.find((candidate) => candidate.device === failure.path);
			const key = wired?.device ?? vpn?.connection;
			if (key) problems[key] = t('settings-network-connect-failed');
		});
		void open().then((initial) => (network = initial));
		return () => {
			stopChanged();
			stopFailed();
			void close();
		};
	});
</script>

{#if network && editing}
	<ConnectionPage target={editing.target} title={editing.title} {network} onclose={() => (editing = null)} />
{:else if network && browsingKnown}
	<KnownNetworks {network} onconfigure={(target, title) => (editing = { target, title })} onclose={() => (browsingKnown = false)} />
{:else if network}
	{#if wifi || network.airplane || network.known.length}
		<Section>
			{#if wifi}
				<Row title={t('settings-network-wifi')} icon={WifiIcon} description={wifiSummary(wifi)} truncate>
					<Switch label={t('settings-network-wifi')} checked={wifi.enabled} disabled={!wifi.hardwareEnabled} onchange={setWifi} />
				</Row>
			{/if}
			{#if network.airplane}
				{@const airplane = network.airplane}
				<Row
					title={t('settings-network-airplane')}
					icon={Plane}
					description={airplane.hardware ? t('settings-network-airplane-hardware') : t('settings-network-airplane.description')}
				>
					<Switch label={t('settings-network-airplane')} checked={airplane.enabled || airplane.hardware} disabled={airplane.hardware} onchange={setAirplane} />
				</Row>
			{/if}
			{#if network.known.length}
				<Row
					title={t('settings-network-known')}
					icon={History}
					description={t('settings-network-known-count', { count: network.known.length })}
					onclick={() => (browsingKnown = true)}
				/>
			{/if}
		</Section>
	{/if}

	{#if wifi?.enabled}
		<WifiSection {wifi} onconfigure={(target, title) => (editing = { target, title })} />
	{/if}

	{#if network.wired.length}
		<Section title={t('settings-network-wired')}>
			{#each network.wired as wired (wired.device)}
				<Row title={wiredTitle(wired)} icon={EthernetPort} description={wiredSummary(wired)}>
					{#if wired.connection}
						{@const path = wired.connection}
						<IconButton
							icon={Settings}
							label={t('settings-network-connection-settings')}
							onclick={() => (editing = { target: { kind: 'wired', path, device: wired.device }, title: wiredTitle(wired) })}
						/>
					{/if}
					<Switch
						label={t('settings-network-ethernet')}
						checked={wired.state === 'connected' || wired.state === 'connecting'}
						disabled={wired.state === 'unplugged'}
						onchange={(on) => toggleWired(wired, on)}
					/>
				</Row>
			{/each}
		</Section>
	{/if}

	<VpnSection vpns={network.vpns} {problems} ontoggle={toggleVpn} onconfigure={(target, title) => (editing = { target, title })} />

	{#if empty}
		<Section>
			<Row title={t('settings-network-empty')} description={t('settings-network-empty.description')} />
		</Section>
	{/if}

	{#if proxy.available}
		<Section>
			<Row title={t('settings-network-proxy')} icon={Globe} description={proxy.mode === 'none' ? undefined : proxyLabel(proxy.mode)} onclick={() => (proxying = true)} />
		</Section>
	{/if}
{/if}

{#if proxying}
	<ProxyDialog {proxy} onclose={() => (proxying = false)} />
{/if}
