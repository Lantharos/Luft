<script lang="ts">
	import Settings from '@lucide/svelte/icons/settings';
	import { t } from '@luft/i18n';
	import { errorText, IconButton, Row, Section } from '@luft/ui';
	import SubPage from '#lib/components/SubPage.svelte';
	import { remove, type Known, type Network } from '@luft/network';
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

	let nearby = $derived(new Map((network.wifi?.networks ?? []).map((candidate) => [candidate.ssid, candidate])));

	function describe(known: Known) {
		const seen = nearby.get(known.ssid);
		if (!seen) return undefined;
		return seen.state === 'disconnected' ? t('settings-network-known-in-range') : linkLabel(seen.state);
	}

	async function forget(known: Known) {
		forgetting = known.connection;
		problem = '';
		try {
			await remove(known.connection);
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

<SubPage title={t('settings-network-known')} back={t('settings-page-wifi')} {onclose}>
	{#if problem}
		<p class="-my-3 px-2 text-[13px] text-[var(--danger)]">{problem}</p>
	{/if}

	<Section description={t('settings-network-known.description')}>
		{#each network.known as known (known.connection)}
			<Row title={known.ssid} description={describe(known)}>
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
