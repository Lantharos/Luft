<script lang="ts">
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import Lock from '@lucide/svelte/icons/lock';
	import Settings from '@lucide/svelte/icons/settings';
	import { ActionRow, IconButton, Row, Section } from '@luft/ui';
	import MoreRow, { COLLAPSED } from '$lib/components/MoreRow.svelte';
	import type { Target } from '../connection/profile';
	import JoinDialog from './JoinDialog.svelte';
	import { activate, join, needsPassword, onFailed, type Security, type Wifi, type WifiNetwork } from '../api';
	import { isSecured, linkLabel, signalIcon } from '../describe';

	interface Props {
		wifi: Wifi;
		onconfigure: (target: Target, title: string) => void;
	}

	interface Joining {
		ssid?: string;
		security?: Security;
		replace?: boolean;
		problem?: string;
	}

	const CONNECT_FAILED = "Couldn't connect to this network";

	let { wifi, onconfigure }: Props = $props();

	let joining = $state<Joining | null>(null);
	let expanded = $state(false);
	let attempt: string | null = null;
	let problems = $state<Record<string, string>>({});

	let shown = $derived(expanded ? wifi.networks : wifi.networks.slice(0, COLLAPSED));

	function describe(network: WifiNetwork) {
		if (problems[network.ssid]) return problems[network.ssid];
		if (network.state !== 'disconnected') return linkLabel(network.state);
		if (network.saved) return 'Saved';
		if (network.security === 'enterprise') return 'Sign in with a work or school account';
		return undefined;
	}

	function configure(network: WifiNetwork) {
		if (network.saved) onconfigure({ kind: 'wifi', path: network.saved, ssid: network.ssid }, network.ssid);
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
			configure(network);
		} else if (network.saved) {
			void run(network.ssid, () => activate({ connection: network.saved!, device: wifi.device }));
		} else if (needsPassword(network.security) || network.security === 'enterprise') {
			joining = { ssid: network.ssid, security: network.security };
		} else {
			void run(network.ssid, () => join({ device: wifi.device, ssid: network.ssid, security: network.security }));
		}
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
				joining = { ssid, security: network.security, replace: true, problem: "The saved password didn't work. Enter it again." };
			} else {
				problems[ssid] = CONNECT_FAILED;
			}
		})
	);
</script>

<Section title="Wi‑Fi networks">
	{#each shown as network (network.ssid)}
		<ActionRow
			title={network.ssid}
			description={describe(network)}
			alert={Boolean(problems[network.ssid])}
			icon={signalIcon(network.strength)}
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
				{#if network.saved}
					<IconButton icon={Settings} label="Network settings" onclick={() => configure(network)} />
				{/if}
			{/snippet}
		</ActionRow>
	{:else}
		<Row title="Looking for networks…" />
	{/each}
	{#if wifi.networks.length > COLLAPSED}
		<MoreRow hidden={wifi.networks.length - COLLAPSED} bind:expanded />
	{/if}
	<Row title="Connect to a hidden network" onclick={() => (joining = {})} />
</Section>

{#if joining}
	<JoinDialog device={wifi.device} {...joining} onclose={() => (joining = null)} />
{/if}
