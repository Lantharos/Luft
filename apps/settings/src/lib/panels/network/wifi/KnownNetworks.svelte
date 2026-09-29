<script lang="ts">
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import Settings from '@lucide/svelte/icons/settings';
	import { onMount } from 'svelte';
	import { IconButton, Row, Section } from '@luft/ui';
	import { remove, type Known, type Network } from '../api';
	import type { Target } from '../connection/profile';
	import { linkLabel } from '../describe';

	interface Props {
		network: Network;
		onconfigure: (target: Target, title: string) => void;
		onclose: () => void;
	}

	let { network, onconfigure, onclose }: Props = $props();

	let root = $state<HTMLDivElement>();
	let forgetting = $state<string | null>(null);
	let problem = $state('');

	let nearby = $derived(new Map((network.wifi?.networks ?? []).map((candidate) => [candidate.ssid, candidate])));

	function describe(known: Known) {
		const seen = nearby.get(known.ssid);
		if (!seen) return 'Not in range';
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

	onMount(() => root?.scrollIntoView({ block: 'start' }));
</script>

<div bind:this={root} class="flex scroll-mt-4 flex-col gap-7">
	<div class="-mb-2 flex items-center gap-3">
		<IconButton icon={ArrowLeft} label="Back to Network" onclick={onclose} />
		<h2 class="min-w-0 flex-1 truncate text-[17px] font-semibold">Known networks</h2>
	</div>

	{#if problem}
		<p class="-my-3 px-2 text-[13px] text-[var(--danger)]">{problem}</p>
	{/if}

	<Section description="Networks this computer has joined before, including ones that aren’t nearby right now">
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
</div>
