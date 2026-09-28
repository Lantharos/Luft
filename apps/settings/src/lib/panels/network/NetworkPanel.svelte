<script lang="ts">
	import EthernetPort from '@lucide/svelte/icons/ethernet-port';
	import Info from '@lucide/svelte/icons/info';
	import Plane from '@lucide/svelte/icons/plane';
	import Shield from '@lucide/svelte/icons/shield';
	import WifiIcon from '@lucide/svelte/icons/wifi';
	import { onMount } from 'svelte';
	import Row from '$lib/components/controls/Row.svelte';
	import Section from '$lib/components/controls/Section.svelte';
	import Switch from '$lib/components/controls/Switch.svelte';
	import DetailsDialog from './DetailsDialog.svelte';
	import IconButton from '$lib/components/controls/IconButton.svelte';
	import WifiSection from './WifiSection.svelte';
	import { activate, close, deactivate, disconnect, onChanged, onFailed, open, setAirplane, setWifi, type Network, type Vpn, type Wifi, type Wired } from './api';
	import { detailRows, linkLabel, speedLabel } from './describe';

	const CONNECT_FAILED = "Couldn't connect";

	let network = $state<Network | null>(null);
	let inspecting = $state<string | null>(null);
	let problems = $state<Record<string, string>>({});

	let wifi = $derived(network?.wifi ?? null);
	let inspected = $derived(network?.wired.find((wired) => wired.device === inspecting && wired.details));
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

{#if network}
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
		<WifiSection {wifi} />
	{/if}

	{#if network.wired.length}
		<Section title="Wired">
			{#each network.wired as wired (wired.device)}
				<Row title={network.wired.length > 1 ? `Ethernet (${wired.name})` : 'Ethernet'} icon={EthernetPort} description={wiredSummary(wired)}>
					{#if wired.details}
						<IconButton icon={Info} label="Connection details" onclick={() => (inspecting = wired.device)} />
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
{/if}

{#if inspected?.details}
	<DetailsDialog title={network!.wired.length > 1 ? `Ethernet (${inspected.name})` : 'Ethernet'} rows={detailRows(inspected.details)} onclose={() => (inspecting = null)}>
		{#snippet actions()}
			<button type="button" class="button primary" onclick={() => (inspecting = null)}>Done</button>
		{/snippet}
	</DetailsDialog>
{/if}
