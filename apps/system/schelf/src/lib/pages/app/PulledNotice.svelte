<script lang="ts">
	import { t } from '@luft/i18n';
	import type { Block, InstalledApp } from '#lib/bindings.js';
	import RemoveDialog from '#lib/components/RemoveDialog.svelte';

	let { name, block, app }: { name: string; block: Block; app: InstalledApp } = $props();

	let removing = $state(false);

	const pulled = $derived(block.action === 'block');
	const why = $derived(block.note ?? block.reason);
</script>

<div class="flex items-center justify-between gap-4 rounded-[var(--radius-group)] bg-[var(--surface)] px-5 py-4">
	<div class="flex min-w-0 flex-col gap-1">
		<span class="text-[14px] font-semibold" class:text-[var(--danger)]={pulled}>
			{t(pulled ? 'app-pulled' : 'app-warning', { name })}
		</span>
		<p class="text-[13.5px] text-[var(--text-soft)]">
			{pulled ? t('app-pulled-description', { reason: why }) : why}
		</p>
	</div>
	{#if pulled}
		<button type="button" class="button danger" onclick={() => (removing = true)}>{t('app-remove')}</button>
	{/if}
</div>

{#if removing}
	<RemoveDialog {app} onclose={() => (removing = false)} />
{/if}
