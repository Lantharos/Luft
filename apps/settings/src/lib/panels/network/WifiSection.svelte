<script lang="ts">
	import Info from '@lucide/svelte/icons/info';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import Lock from '@lucide/svelte/icons/lock';
	import Row from '$lib/components/controls/Row.svelte';
	import Section from '$lib/components/controls/Section.svelte';
	import ActionRow from '$lib/components/controls/ActionRow.svelte';
	import DetailsDialog from './DetailsDialog.svelte';
	import IconButton from '$lib/components/controls/IconButton.svelte';
	import JoinDialog from './JoinDialog.svelte';
	import { activate, disconnect, forget, join, needsPassword, onFailed, type JoinSecurity, type Wifi, type WifiNetwork } from './api';
	import { detailRows, isSecured, linkLabel, securityLabel, signalIcon, signalLabel, type DetailRow } from './describe';

	interface Props {
		wifi: Wifi;
	}

	interface Joining {
		ssid?: string;
		security?: JoinSecurity;
		replace?: boolean;
		problem?: string;
	}

	const CONNECT_FAILED = "Couldn't connect to this network";

	let { wifi }: Props = $props();

	let joining = $state<Joining | null>(null);
	let inspecting = $state<string | null>(null);
	let attempt: string | null = null;
	let problems = $state<Record<string, string>>({});

	let inspected = $derived(wifi.networks.find((network) => network.ssid === inspecting));

	function describe(network: WifiNetwork) {
		if (problems[network.ssid]) return problems[network.ssid];
		if (network.state !== 'disconnected') return linkLabel(network.state);
		if (network.saved) return 'Saved';
		if (network.security === 'enterprise') return 'Needs a work or school account';
		return undefined;
	}

	function rows(network: WifiNetwork): DetailRow[] {
		const base: DetailRow[] = [
			['Signal', signalLabel(network.strength)],
			['Security', securityLabel(network.security)]
		];
		return network.details ? [...base, ...detailRows(network.details)] : base;
	}

	async function run(ssid: string, action: () => Promise<void>) {
		delete problems[ssid];
		attempt = ssid;
		try {
			await action();
		} catch {
			problems[ssid] = CONNECT_FAILED;
			attempt = null;
		}
	}

	function choose(network: WifiNetwork) {
		if (network.state !== 'disconnected') {
			inspecting = network.ssid;
		} else if (network.saved) {
			void run(network.ssid, () => activate({ connection: network.saved!, device: wifi.device }));
		} else if (network.security === 'enterprise') {
			return;
		} else if (needsPassword(network.security)) {
			joining = { ssid: network.ssid, security: network.security };
		} else {
			void run(network.ssid, () => join({ device: wifi.device, ssid: network.ssid, security: network.security as JoinSecurity }));
		}
	}

	async function forgetNetwork(ssid: string) {
		inspecting = null;
		await forget(ssid);
	}

	async function disconnectNetwork() {
		inspecting = null;
		await disconnect(wifi.device);
	}

	function connectInspected(network: WifiNetwork) {
		inspecting = null;
		choose(network);
	}

	$effect(() => {
		if (attempt && wifi.networks.some((network) => network.ssid === attempt && network.state === 'connected')) attempt = null;
	});

	$effect(() =>
		onFailed((failure) => {
			if (failure.path !== wifi.device || !attempt || joining) return;
			const ssid = attempt;
			attempt = null;
			const network = wifi.networks.find((candidate) => candidate.ssid === ssid);
			if (failure.reason === 'password' && network && needsPassword(network.security)) {
				joining = { ssid, security: network.security as JoinSecurity, replace: true, problem: "The saved password didn't work. Enter it again." };
			} else {
				problems[ssid] = CONNECT_FAILED;
			}
		})
	);
</script>

<Section title="Wi‑Fi networks">
	{#each wifi.networks as network (network.ssid)}
		<ActionRow
			title={network.ssid}
			description={describe(network)}
			alert={Boolean(problems[network.ssid])}
			icon={signalIcon(network.strength)}
			disabled={network.security === 'enterprise' && !network.saved}
			onclick={() => choose(network)}
		>
			{#snippet trailing()}
				{#if network.state === 'connecting'}
					<LoaderCircle size={16} class="animate-spin" />
				{/if}
				{#if isSecured(network.security)}
					<Lock size={15} />
				{/if}
			{/snippet}
			{#snippet actions()}
				{#if network.saved || network.state !== 'disconnected'}
					<IconButton icon={Info} label="Network details" onclick={() => (inspecting = network.ssid)} />
				{/if}
			{/snippet}
		</ActionRow>
	{:else}
		<Row title="Looking for networks…" />
	{/each}
	<Row title="Connect to a hidden network" onclick={() => (joining = {})} />
</Section>

{#if joining}
	<JoinDialog device={wifi.device} {...joining} onclose={() => (joining = null)} />
{/if}

{#if inspected}
	{@const network = inspected}
	<DetailsDialog title={network.ssid} rows={rows(network)} onclose={() => (inspecting = null)}>
		{#snippet actions()}
			{#if network.saved}
				<button type="button" class="button danger mr-auto" onclick={() => forgetNetwork(network.ssid)}>Forget</button>
			{/if}
			{#if network.state === 'disconnected'}
				<button type="button" class="button" onclick={() => (inspecting = null)}>Close</button>
				<button type="button" class="button primary" onclick={() => connectInspected(network)}>Connect</button>
			{:else}
				<button type="button" class="button" onclick={disconnectNetwork}>Disconnect</button>
				<button type="button" class="button primary" onclick={() => (inspecting = null)}>Done</button>
			{/if}
		{/snippet}
	</DetailsDialog>
{/if}
