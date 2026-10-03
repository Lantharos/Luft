<script lang="ts">
	import Settings from '@lucide/svelte/icons/settings';
	import { IconButton, Row, Section } from '@luft/ui';
	import SubPage from '#lib/components/SubPage.svelte';
	import { remove, type Known, type Network } from '../api';
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
		return seen.state === 'disconnected' ? 'In range' : linkLabel(seen.state);
	}

	async function forget(known: Known) {
		forgetting = known.connection;
		problem = '';
		try {
			await remove(known.connection);
		} catch (reason) {
			problem = reason instanceof Error ? reason.message : String(reason);
		} finally {
			forgetting = null;
		}
	}

	$effect(() => {
		if (network.known.length === 0) onclose();
	});
</script>

<SubPage title="Known networks" back="Network" {onclose}>
	{#if problem}
		<p class="-my-3 px-2 text-[13px] text-[var(--danger)]">{problem}</p>
	{/if}

	<Section description="Networks this computer has joined before, nearby or not">
		{#each network.known as known (known.connection)}
			<Row title={known.ssid} description={describe(known)}>
				<IconButton
					icon={Settings}
					label="Network settings"
					onclick={() => onconfigure({ kind: 'wifi', path: known.connection, ssid: known.ssid }, known.ssid)}
				/>
				<button type="button" class="button" disabled={forgetting === known.connection} onclick={() => forget(known)}>Forget</button>
			</Row>
		{/each}
	</Section>
</SubPage>
