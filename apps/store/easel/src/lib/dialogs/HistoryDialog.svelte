<script lang="ts">
	import { t } from '@luft/i18n';
	import { Dialog } from '@luft/ui';
	import type { History } from '#lib/document/history.svelte.js';

	let { history, onclose }: { history: History; onclose: () => void } = $props();
</script>

<Dialog title={t('easel-history')} {onclose}>
	<ol class="-mx-2 flex max-h-[360px] flex-col overflow-y-auto">
		<li>
			<button type="button" class={['step', history.position === 0 && 'is-current']} onclick={() => history.jump(0)}>{t('easel-history-start')}</button>
		</li>
		{#each history.entries as entry, index (index)}
			<li>
				<button type="button" class={['step', history.position === index + 1 && 'is-current', index >= history.position && 'is-undone']} onclick={() => history.jump(index + 1)}>{entry.label}</button>
			</li>
		{/each}
	</ol>
	{#snippet actions()}
		<button type="button" class="button" onclick={onclose}>{t('easel-done')}</button>
	{/snippet}
</Dialog>

<style>
	.step {
		display: flex;
		width: 100%;
		height: 36px;
		align-items: center;
		border-radius: 10px;
		padding-inline: 10px;
		color: var(--text-soft);
		font-size: 13.5px;
		text-align: left;
	}

	.step:hover {
		background: var(--surface-hover);
	}

	.step.is-current {
		background: var(--accent-soft);
		color: var(--text);
		font-weight: 600;
	}

	.step.is-undone {
		color: var(--text-muted);
	}
</style>
