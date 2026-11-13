<script lang="ts">
	import { t } from '@luft/i18n';
	import { ago, ConfirmDialog, Row, Section } from '@luft/ui';
	import type { AccessEvent } from '#lib/bindings.js';
	import MoreRow, { COLLAPSED } from '#lib/components/MoreRow.svelte';
	import { clearHistory } from '../api';
	import { happened } from '../describe';

	let { history, refresh }: { history: AccessEvent[]; refresh: () => Promise<void> } = $props();

	let clearing = $state(false);

	async function clear() {
		const cleared = await clearHistory();
		await refresh();
		return cleared;
	}
</script>

{#snippet line(event: AccessEvent)}
	<div class="flex items-baseline gap-3 px-4 py-2.5">
		<span class="min-w-0 flex-1 truncate text-[13px] text-[var(--text-soft)]">{happened(event)}</span>
		<span class="shrink-0 text-[12.5px] text-[var(--text-muted)]">{ago(event.time)}</span>
	</div>
{/snippet}

<Section title={t('settings-passwords-history')}>
	{#each history.slice(0, COLLAPSED) as event, index (index)}
		{@render line(event)}
	{/each}
	{#if history.length > COLLAPSED}
		<MoreRow hidden={history.length - COLLAPSED} title={t('settings-passwords-history')}>
			{#snippet children()}
				{#each history as event, index (index)}
					{@render line(event)}
				{/each}
			{/snippet}
		</MoreRow>
	{/if}
	<Row title={t('settings-passwords-history-clear')}>
		<button type="button" class="button" onclick={() => (clearing = true)}>{t('settings-passwords-history-clear-button')}</button>
	</Row>
</Section>

{#if clearing}
	<ConfirmDialog
		title={t('settings-passwords-history-clear-title')}
		description={t('settings-passwords-history-clear-confirm')}
		action={t('settings-passwords-history-clear')}
		danger
		run={clear}
		onclose={() => (clearing = false)}
	/>
{/if}
