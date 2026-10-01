<script lang="ts">
	import { Row, Section } from '@luft/ui';
	import { ago } from '$lib/panels/updates/time';
	import { clearHistory, type AccessEvent } from '../api';
	import ConfirmDialog from '../ConfirmDialog.svelte';
	import { happened } from '../describe';

	const COLLAPSED = 5;

	let { history, refresh }: { history: AccessEvent[]; refresh: () => Promise<void> } = $props();

	let expanded = $state(false);
	let clearing = $state(false);

	let shown = $derived(expanded ? history : history.slice(0, COLLAPSED));

	async function clear() {
		await clearHistory();
		await refresh();
	}
</script>

<Section title="Recent access">
	{#each shown as event, index (index)}
		<div class="flex items-baseline gap-3 px-4 py-2.5">
			<span class="min-w-0 flex-1 truncate text-[13px] text-[var(--text-soft)]">{happened(event)}</span>
			<span class="shrink-0 text-[12.5px] text-[var(--text-muted)]">{ago(event.time)}</span>
		</div>
	{/each}
	{#if history.length > COLLAPSED}
		<Row title={expanded ? 'Show fewer' : `Show all ${history.length}`} onclick={() => (expanded = !expanded)} />
	{/if}
	<Row title="Clear history" description="Forget which apps used your keyring and when">
		<button type="button" class="button" onclick={() => (clearing = true)}>Clear</button>
	</Row>
</Section>

{#if clearing}
	<ConfirmDialog
		title="Clear recent access?"
		description="The list of which apps used your keyring and when is erased. Your saved passwords and keys stay as they are."
		action="Clear history"
		run={clear}
		onclose={() => (clearing = false)}
	/>
{/if}
