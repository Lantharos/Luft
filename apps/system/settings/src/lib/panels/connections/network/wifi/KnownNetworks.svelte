<script lang="ts">
	import Settings from '@lucide/svelte/icons/settings';
	import { t } from '@luft/i18n';
	import { errorText, IconButton, Row, Section, Segmented, Spinner } from '@luft/ui';
	import SubPage from '#lib/components/SubPage.svelte';
	import { waitForPerson, type Known, type Network, type NetworkType } from '@luft/network';
	import { commands } from '#lib/bindings.js';
	import type { Target } from '../connection/profile';
	import { linkLabel } from '../describe';

	interface Props {
		network: Network;
		onconfigure: (target: Target, title: string) => void;
		onclose: () => void;
	}

	let { network, onconfigure, onclose }: Props = $props();

	let forgetting = $state<string | null>(null);
	let problem = $state('');

	let types = $derived<{ value: NetworkType; label: string }[]>([
		{ value: 'home', label: t('settings-network-firewall-home') },
		{ value: 'public', label: t('settings-network-firewall-public') }
	]);

	let nearby = $derived(new Map((network.wifi?.networks ?? []).map((candidate) => [candidate.ssid, candidate])));

	function describe(known: Known) {
		const seen = nearby.get(known.ssid);
		if (!seen) return undefined;
		return seen.state === 'disconnected' ? t('settings-network-known-in-range') : linkLabel(seen.state);
	}

	async function classify(known: Known, networkType: NetworkType) {
		problem = '';
		try {
			await commands.networkSetType({ connection: known.connection, networkType });
		} catch (reason) {
			problem = errorText(reason);
		}
	}

	async function forget(known: Known) {
		forgetting = known.connection;
		problem = '';
		try {
			await commands.networkRemove({ path: known.connection }, waitForPerson);
		} catch (reason) {
			problem = errorText(reason);
		} finally {
			forgetting = null;
		}
	}

	$effect(() => {
		if (network.known.length === 0) onclose();
	});
</script>

<SubPage title={t('settings-network-known')} {onclose}>
	{#if problem}
		<p class="-my-3 px-2 text-[13px] text-[var(--danger)]">{problem}</p>
	{/if}

	<Section>
		{#each network.known as known (known.connection)}
			<Row title={known.ssid} description={describe(known)}>
				{#if nearby.get(known.ssid)?.state === 'connecting'}<Spinner />{/if}
				<Segmented label={known.ssid} options={types} value={known.networkType ?? 'public'} onchange={(networkType) => classify(known, networkType)} />
				<IconButton
					icon={Settings}
					label={t('settings-network-wifi-settings')}
					onclick={() => onconfigure({ kind: 'wifi', path: known.connection, ssid: known.ssid }, known.ssid)}
				/>
				<button type="button" class="button" disabled={forgetting === known.connection} onclick={() => forget(known)}>{t('settings-network-forget.button')}</button>
			</Row>
		{/each}
	</Section>
</SubPage>
