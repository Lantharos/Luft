<script lang="ts">
	import type { ReplacedBy } from '#lib/bindings.js';
	import { navigation } from '#lib/state/navigation.svelte.js';

	let { replacement }: { replacement: ReplacedBy } = $props();

	const app = $derived(replacement.app);
</script>

<div class="flex items-center justify-between gap-4 rounded-[var(--radius-group)] bg-[var(--surface)] px-5 py-4">
	<div class="flex min-w-0 flex-col gap-1">
		<span class="text-[14px] font-semibold">Replaced by {app.name}</span>
		{#if replacement.note}
			<p class="text-[13.5px] text-[var(--text-soft)]">{replacement.note}</p>
		{/if}
	</div>
	<button type="button" class="button" onclick={() => navigation.push({ page: 'app', target: { listing: app }, name: app.name })}>Open {app.name}</button>
</div>
