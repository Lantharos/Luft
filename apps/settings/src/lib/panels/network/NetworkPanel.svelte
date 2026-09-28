<script lang="ts">
	import EthernetPort from '@lucide/svelte/icons/ethernet-port';
	import Globe from '@lucide/svelte/icons/globe';
	import Plane from '@lucide/svelte/icons/plane';
	import Settings from '@lucide/svelte/icons/settings';
	import Shield from '@lucide/svelte/icons/shield';
	import WifiIcon from '@lucide/svelte/icons/wifi';
	import { onMount } from 'svelte';
	import { IconButton, Row, Section, Switch } from '@luft/ui';
	import ConnectionPage from './connection/ConnectionPage.svelte';
	import type { Target } from './connection/profile';
	import ProxyDialog from './ProxyDialog.svelte';
	import WifiSection from './WifiSection.svelte';
	import { activate, close, deactivate, disconnect, onChanged, onFailed, open, setAirplane, setWifi, type Network, type Vpn, type Wifi, type Wired } from './api';
	import { linkLabel, speedLabel } from './describe';
	import { proxyLabel, useProxy } from './proxy.svelte';

	interface Editing {
		target: Target;
		title: string;
	}

	const CONNECT_FAILED = "Couldn't connect";

	const proxy = useProxy();

	let network = $state<Network | null>(null);
	let editing = $state<Editing | null>(null);
	let proxying = $state(false);
	let problems = $state<Record<string, string>>({});

	let wifi = $derived(network?.wifi ?? null);
	let empty = $derived(network && !network.wifi && !network.airplane && !network.wired.length && !network.vpns.length);

	function wifiSummary(wifi: Wifi) {
		if (!wifi.hardwareEnabled) return 'Turned off by a hardware switch';
		if (!wifi.enabled) return 'Off';
		const connected = wifi.networks.find((candidate) => candidate.state === 'connected');
		return connected ? `Connected to ${connected.ssid}` : 'Not connected';
	}

	function wiredSummary(wired: Wired) {
		if (problems[wired.device]) return problems[wired.device];
		if (wired.state === 'connected' && wired.speed) return `Connected · ${speedLabel(wired.speed)}`;
		return linkLabel(wired.state);
	}

	function vpnSummary(vpn: Vpn) {
		return problems[vpn.connection] ?? (vpn.state === 'disconnected' ? undefined : linkLabel(vpn.state));
	}

	async function attempt(key: string, action: () => Promise<void>) {
		delete problems[key];
		try {
			await action();
		} catch {
			problems[key] = CONNECT_FAILED;
		}
	}

	function toggleWired(wired: Wired, on: boolean) {
		void attempt(wired.device, () => (on ? activate({ device: wired.device }) : disconnect(wired.device)));
	}

	function wiredTitle(wired: Wired) {
		return network!.wired.length > 1 ? `Ethernet (${wired.name})` : 'Ethernet';
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
			if (key) problems[key] = CONNECT_FAILED;
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
{:else if network}
	{#if wifi || network.airplane}
		<Section>
			{#if wifi}
				<Row title="Wi‑Fi" icon={WifiIcon} description={wifiSummary(wifi)}>
					<Switch label="Wi‑Fi" checked={wifi.enabled} disabled={!wifi.hardwareEnabled} onchange={setWifi} />
				</Row>
			{/if}
			{#if network.airplane}
				{@const airplane = network.airplane}
				<Row
					title="Airplane mode"
					icon={Plane}
					description={airplane.hardware ? 'Turned on by a hardware switch' : 'Turns off Wi‑Fi, Bluetooth, and mobile broadband'}
				>
					<Switch label="Airplane mode" checked={airplane.enabled || airplane.hardware} disabled={airplane.hardware} onchange={setAirplane} />
				</Row>
			{/if}
		</Section>
	{/if}

	{#if wifi?.enabled}
		<WifiSection {wifi} onconfigure={(target, title) => (editing = { target, title })} />
	{/if}

	{#if network.wired.length}
		<Section title="Wired">
			{#each network.wired as wired (wired.device)}
				<Row title={wiredTitle(wired)} icon={EthernetPort} description={wiredSummary(wired)}>
					{#if wired.connection}
						{@const path = wired.connection}
						<IconButton
							icon={Settings}
							label="Connection settings"
							onclick={() => (editing = { target: { kind: 'wired', path, device: wired.device }, title: wiredTitle(wired) })}
						/>
					{/if}
					<Switch
						label="Ethernet"
						checked={wired.state === 'connected' || wired.state === 'connecting'}
						disabled={wired.state === 'unplugged'}
						onchange={(on) => toggleWired(wired, on)}
					/>
				</Row>
			{/each}
		</Section>
	{/if}

	{#if network.vpns.length}
		<Section title="VPN">
			{#each network.vpns as vpn (vpn.connection)}
				<Row title={vpn.name} icon={Shield} description={vpnSummary(vpn)}>
					<IconButton
						icon={Settings}
						label="Connection settings"
						onclick={() => (editing = { target: { kind: 'vpn', path: vpn.connection }, title: vpn.name })}
					/>
					<Switch label={vpn.name} checked={vpn.state !== 'disconnected'} onchange={(on) => toggleVpn(vpn, on)} />
				</Row>
			{/each}
		</Section>
	{/if}

	{#if empty}
		<Section>
			<Row title="No network connections" description="Plug in a network cable or a Wi‑Fi adapter to get online" />
		</Section>
	{/if}

	{#if proxy.available}
		<Section>
			<Row title="Proxy" icon={Globe} description={proxyLabel(proxy.mode)} onclick={() => (proxying = true)} />
		</Section>
	{/if}
{/if}

{#if proxying}
	<ProxyDialog {proxy} onclose={() => (proxying = false)} />
{/if}
