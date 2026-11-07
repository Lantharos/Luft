<script lang="ts">
	import FolderOpen from '@lucide/svelte/icons/folder-open';
	import Pause from '@lucide/svelte/icons/pause';
	import Play from '@lucide/svelte/icons/play';
	import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
	import X from '@lucide/svelte/icons/x';
	import { t } from '@luft/i18n';
	import { activationToken, duration, fileDragStart, IconButton, ProgressBar } from '@luft/ui';
	import { commands, type ItemUpdate } from '#lib/bindings.js';
	import { queue } from '#lib/state/queue.svelte.js';
	import { session } from '#lib/state/session.svelte.js';

	function status(item: ItemUpdate) {
		switch (item.state) {
			case 'waiting':
				return t('queue-waiting');
			case 'paused':
				return t('queue-paused');
			case 'running':
				return item.remaining === null ? t('queue-working') : t('queue-left', { time: duration(Math.ceil(item.remaining)) });
			case 'finished':
				return t('queue-done');
			case 'canceled':
				return t('queue-canceled');
			case 'failed':
				return item.error || t('queue-failed');
		}
	}

	const show = async (path: string) => commands.showInFolder({ path, token: await activationToken() });
	const summary = $derived(queue.remaining === null ? null : t('queue-total-left', { time: duration(Math.ceil(queue.remaining)) }));
</script>

<section class="flex min-h-0 flex-1 flex-col" aria-label={t('queue-title')}>
	<div class="flex items-center gap-2 px-4 pb-2 text-[13px] text-[var(--text-muted)]">
		<span class="flex-1">{summary ?? (queue.active.length ? t('queue-working') : t('queue-all-done'))}</span>
		{#if queue.active.length}
			<button type="button" class="button" onclick={() => queue.hold(!queue.held)}>{queue.held ? t('queue-resume-all') : t('queue-pause-all')}</button>
		{/if}
		{#if queue.finished.length}
			<button type="button" class="button" onclick={() => queue.clearFinished()}>{t('queue-clear')}</button>
		{/if}
		<button type="button" class="button" onclick={() => (session.view = 'convert')}>{session.files.length ? t('queue-back') : t('queue-more')}</button>
	</div>
	<ul class="soft-scroll flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-3 pb-3">
		{#each queue.items as item (item.id)}
			<li class="row" draggable={Boolean(item.output)} ondragstart={item.output ? fileDragStart(item.output) : undefined}>
				<span class="min-w-0 flex-1">
					<span class="block truncate text-[13px]">{item.name}</span>
					<span class="block truncate text-[12px]" class:failed={item.state === 'failed'}>{status(item)}</span>
					{#if item.state === 'running' || item.state === 'paused'}
						<ProgressBar class="mt-1" fraction={item.fraction} label={t('queue-progress', { name: item.name })} />
					{/if}
				</span>
				{#if item.state === 'running'}
					<IconButton icon={Pause} label={t('queue-pause', { name: item.name })} onclick={() => commands.queuePause({ id: item.id })} />
				{:else if item.state === 'paused'}
					<IconButton icon={Play} label={t('queue-resume', { name: item.name })} onclick={() => commands.queueResume({ id: item.id })} />
				{/if}
				{#if item.state === 'failed' || item.state === 'canceled'}
					<IconButton icon={RotateCcw} label={t('queue-retry', { name: item.name })} onclick={() => commands.queueRetry({ id: item.id })} />
				{/if}
				{#if item.output}
					<IconButton icon={FolderOpen} label={t('queue-show', { name: item.name })} onclick={() => show(item.output!)} />
				{/if}
				{#if item.state === 'waiting' || item.state === 'running' || item.state === 'paused'}
					<IconButton icon={X} label={t('queue-cancel', { name: item.name })} onclick={() => commands.queueCancel({ id: item.id })} />
				{/if}
			</li>
		{/each}
	</ul>
</section>

<style>
	.row {
		display: flex;
		align-items: center;
		gap: 8px;
		min-height: 52px;
		padding: 6px 8px 6px 12px;
		border-radius: 10px;
		background: var(--surface);
	}

	.row span span,
	.row > span > span:nth-child(2) {
		color: var(--text-muted);
	}

	.row > span > span:first-child {
		color: var(--text);
	}

	.failed {
		color: var(--danger) !important;
		white-space: normal;
	}
</style>
