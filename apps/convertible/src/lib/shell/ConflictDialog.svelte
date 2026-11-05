<script lang="ts">
	import { t } from '@luft/i18n';
	import { basename, Dialog } from '@luft/ui';
	import type { Pending } from '#lib/state/session.svelte.js';
	import { session } from '#lib/state/session.svelte.js';

	interface Props {
		pending: Pending;
	}

	let { pending }: Props = $props();

	const SHOWN = 6;
	const count = $derived(pending.conflicts.length);
	const title = $derived(t('conflict-title', { count }));
</script>

<Dialog {title} description={t('conflict-body')} onclose={() => session.answerConflict('skip')}>
	<ul class="flex flex-col gap-0.5 text-[13px] text-[var(--text-soft)]">
		{#each pending.conflicts.slice(0, SHOWN) as path (path)}
			<li class="truncate">{basename(path)}</li>
		{/each}
		{#if count > SHOWN}
			<li class="text-[var(--text-muted)]">{t('conflict-more', { count: count - SHOWN })}</li>
		{/if}
	</ul>
	{#snippet actions()}
		<button type="button" class="button" onclick={() => session.answerConflict('skip')}>{t('conflict-skip')}</button>
		<button type="button" class="button" onclick={() => session.answerConflict('replace')}>{t('conflict-replace')}</button>
		<button type="button" class="button primary" onclick={() => session.answerConflict('keepBoth')}>{t('conflict-keep')}</button>
	{/snippet}
</Dialog>
