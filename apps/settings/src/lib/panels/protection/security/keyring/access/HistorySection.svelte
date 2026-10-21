<script lang="ts">
	import { t } from '@luft/i18n';
	import { ago, ConfirmDialog, Row, Section } from '@luft/ui';
	import { clearHistory, type AccessEvent } from '../api';
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

<Section title={t('settings-passwords-history')}>
	{#each shown as event, index (index)}
		<div class="flex items-baseline gap-3 px-4 py-2.5">
			<span class="min-w-0 flex-1 truncate text-[13px] text-[var(--text-soft)]">{happened(event)}</span>
			<span class="shrink-0 text-[12.5px] text-[var(--text-muted)]">{ago(event.time)}</span>
		</div>
	{/each}
	{#if history.length > COLLAPSED}
		<Row title={expanded ? t('settings-passwords-history-fewer') : t('settings-passwords-history-all', { count: history.length })} onclick={() => (expanded = !expanded)} />
	{/if}
	<Row title={t('settings-passwords-history-clear')} description={t('settings-passwords-history-clear-description')}>
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
