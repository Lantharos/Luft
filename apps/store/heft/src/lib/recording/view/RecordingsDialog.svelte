<script lang="ts">
	import AudioLines from '@lucide/svelte/icons/audio-lines';
	import { t } from '@luft/i18n';
	import { dateTime, Dialog, formatClock } from '@luft/ui';
	import type { OpenNotebook } from '#lib/library/notebook.svelte.js';
	import { recordingsOf } from '../model';
	import { player } from '../player.svelte';
	import { processing } from '../processing.svelte';
	import { stageText } from './stage';

	let { notebook, onclose }: { notebook: OpenNotebook; onclose: () => void } = $props();

	let recordings = $derived(
		recordingsOf(notebook.meta)
			.filter((recording) => recording.length !== undefined)
			.toReversed()
	);
</script>

<Dialog title={t('recordings-title')} {onclose}>
	<div class="soft-scroll flex max-h-[420px] flex-col gap-1 overflow-y-auto">
		{#each recordings as recording (recording.id)}
			<button type="button" class="choice" onclick={() => (void player.open(notebook, recording), onclose())}>
				<AudioLines size={17} />
				<span class="min-w-0 flex-1">
					<span class="block truncate">{dateTime(recording.spans[0].at / 1000)}</span>
					<span class="block truncate text-[12px] text-(--text-muted)">{stageText(processing.stage(recording), recording)}</span>
				</span>
				<span class="text-[12.5px] text-(--text-muted) tabular-nums">{formatClock((recording.length ?? 0) / 1000)}</span>
			</button>
		{/each}
	</div>
	{#snippet actions()}
		<button type="button" class="button" onclick={onclose}>{t('dialog-done')}</button>
	{/snippet}
</Dialog>

<style>
	.choice {
		display: flex;
		min-height: 48px;
		align-items: center;
		gap: 10px;
		border-radius: 12px;
		padding-inline: 10px;
		color: var(--text);
		font-size: 14px;
		text-align: left;
	}

	.choice:hover {
		background: var(--surface-hover);
	}
</style>
