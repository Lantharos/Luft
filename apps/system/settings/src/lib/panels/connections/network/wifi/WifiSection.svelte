<script lang="ts">
	import Lock from '@lucide/svelte/icons/lock';
	import Settings from '@lucide/svelte/icons/settings';
	import { t } from '@luft/i18n';
	import { ActionRow, IconButton, item, reorder, Row, Section, Spinner } from '@luft/ui';
	import MoreRow, { COLLAPSED } from '#lib/components/MoreRow.svelte';
	import type { Target } from '../connection/profile';
	import JoinDialog from './JoinDialog.svelte';
	import { needsPassword, type Security, type Wifi, type WifiNetwork } from '@luft/network';
	import { commands, events } from '#lib/bindings.js';
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

	let { wifi, onconfigure }: Props = $props();

	let joining = $state<Joining | null>(null);
	let attempt: string | null = null;
	let problems = $state<Record<string, string>>({});

	let shown = $derived(wifi.networks.slice(0, COLLAPSED));

	function describe(network: WifiNetwork) {
		if (problems[network.ssid]) return problems[network.ssid];
		if (network.state !== 'disconnected') return linkLabel(network.state);
		if (network.joined) return t('settings-network-wifi-saved');
		if (network.security === 'enterprise') return t('settings-network-wifi-enterprise');
		return undefined;
	}

	function configure(network: WifiNetwork) {
		if (network.saved) onconfigure({ kind: 'wifi', path: network.saved, ssid: network.ssid }, network.ssid);
	}

	async function run(ssid: string, action: () => Promise<unknown>) {
		delete problems[ssid];
		attempt = ssid;
		try {
			await action();
		} catch {
			problems[ssid] = t('settings-network-wifi-connect-failed');
			attempt = null;
		}
	}

	function choose(network: WifiNetwork) {
		if (network.state !== 'disconnected') {
			configure(network);
		} else if (network.saved) {
			void run(network.ssid, () => commands.networkActivate({ connection: network.saved!, device: wifi.device }));
		} else if (needsPassword(network.security) || network.security === 'enterprise') {
			joining = { ssid: network.ssid, security: network.security };
		} else {
			void run(network.ssid, () => commands.networkJoin({ device: wifi.device, ssid: network.ssid, security: network.security }));
		}
	}

	$effect(() => {
		if (attempt && wifi.networks.some((network) => network.ssid === attempt && network.state === 'connected')) attempt = null;
	});

	$effect(() =>
		events.networkFailed((failure) => {
			if (failure.path !== wifi.device || !attempt || joining) return;
			const ssid = attempt;
			attempt = null;
			const network = wifi.networks.find((candidate) => candidate.ssid === ssid);
			if (failure.reason === 'password' && network && needsPassword(network.security)) {
				joining = { ssid, security: network.security, replace: true, problem: t('settings-network-wifi-saved-password-failed') };
			} else {
				problems[ssid] = t('settings-network-wifi-connect-failed');
			}
		})
	);
</script>

{#snippet row(network: (typeof wifi.networks)[number], close?: () => void)}
	<ActionRow
		title={network.ssid}
		description={describe(network)}
		alert={Boolean(problems[network.ssid])}
		icon={signalIcon(network.strength)}
		onclick={() => {
			close?.();
			choose(network);
		}}
	>
		{#snippet trailing()}
			{#if network.state === 'connecting'}
				<Spinner size={16} />
			{/if}
			{#if isSecured(network.security)}
				<Lock size={15} />
			{/if}
		{/snippet}
		{#snippet actions()}
			{#if network.saved}
				<IconButton
					icon={Settings}
					label={t('settings-network-wifi-settings')}
					onclick={() => {
						close?.();
						configure(network);
					}}
				/>
			{/if}
		{/snippet}
	</ActionRow>
{/snippet}

<Section title={t('settings-network-wifi-networks')}>
	{#each shown as network (network.ssid)}
		<div class="row-slot" animate:reorder in:item out:item>
			{@render row(network)}
		</div>
	{:else}
		<Row title={t('settings-network-wifi-searching')}>
			<Spinner />
		</Row>
	{/each}
	{#if wifi.networks.length > COLLAPSED}
		<MoreRow hidden={wifi.networks.length - COLLAPSED} title={t('settings-network-wifi-networks')}>
			{#snippet children(close)}
				{#each wifi.networks as network (network.ssid)}
					{@render row(network, close)}
				{/each}
			{/snippet}
		</MoreRow>
	{/if}
	<Row title={t('settings-network-hidden')} onclick={() => (joining = {})} />
</Section>

{#if joining}
	<JoinDialog device={wifi.device} {...joining} onclose={() => (joining = null)} />
{/if}
