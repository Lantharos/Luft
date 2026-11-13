<script lang="ts">
	import { Section } from '@luft/ui';
	import Loaded from '../../components/Loaded.svelte';
	import { reads } from '../../state/reads';
	import type { DashboardPublisher } from '../../store';
	import ToolRows from './ToolRows.svelte';

	let { publisher }: { publisher: DashboardPublisher } = $props();

	const tools = $derived(reads.tools(publisher.id));

	$effect(() => tools.watch());
</script>

<Loaded resource={tools}>
	{#snippet children(list)}
		{#if list.length}
			<Section>
				{#each list as tool (tool.address)}
					<ToolRows {tool} description="{tool.project_name}{tool.part ? `, its ${tool.part} part` : ''}" />
				{/each}
			</Section>
		{:else}
			<p class="px-2 pt-16 text-center text-[14px] text-[var(--text-muted)]">A part with tool = "name" in its schelf.toml makes it a command-line tool.</p>
		{/if}
	{/snippet}
</Loaded>
