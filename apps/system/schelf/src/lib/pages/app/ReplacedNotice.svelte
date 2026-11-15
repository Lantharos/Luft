<script lang="ts">
	import { t } from '@luft/i18n';
	import type { ReplacedBy } from '#lib/bindings.js';
	import { navigation } from '#lib/state/navigation.svelte.js';

	let { replacement }: { replacement: ReplacedBy } = $props();

	const app = $derived(replacement.app);
</script>

<div class="flex items-center justify-between gap-4 rounded-[var(--radius-group)] bg-[var(--surface)] px-5 py-4">
	<div class="flex min-w-0 flex-col gap-1">
		<span class="text-[14px] font-semibold">{t('app-replaced', { name: app.name })}</span>
		{#if replacement.note}
			<p class="text-[13.5px] text-[var(--text-soft)]">{replacement.note}</p>
		{/if}
	</div>
	<button type="button" class="button" onclick={() => navigation.push({ page: 'app', target: { listing: app }, name: app.name })}>{t('app-replaced-open', { name: app.name })}</button>
</div>
