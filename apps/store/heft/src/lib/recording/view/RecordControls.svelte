<script lang="ts">
	import AudioLines from '@lucide/svelte/icons/audio-lines';
	import Mic from '@lucide/svelte/icons/mic';
	import Pause from '@lucide/svelte/icons/pause';
	import Play from '@lucide/svelte/icons/play';
	import Square from '@lucide/svelte/icons/square';
	import { t } from '@luft/i18n';
	import { formatClock, IconButton, tooltip } from '@luft/ui';
	import { session } from '#lib/app/session.svelte.js';
	import type { OpenNotebook } from '#lib/library/notebook.svelte.js';
	import { recordingsOf } from '../model';
	import { player } from '../player.svelte';
	import { recorder } from '../recorder.svelte';
	import ConsentDialog from './ConsentDialog.svelte';
	import RecordingsDialog from './RecordingsDialog.svelte';

	let { notebook, page }: { notebook: OpenNotebook; page: () => string } = $props();

	let asking = $state(false);
	let listing = $state(false);
	let here = $derived(recorder.notebook === notebook);
	let elsewhere = $derived(recorder.notebook && !here ? recorder.notebook : null);
	let recorded = $derived(recordingsOf(notebook.meta).filter((recording) => recording.length !== undefined));

	function record() {
		if (!recorder.asked(notebook.meta.subject)) {
			asking = true;
			return;
		}
		player.close();
		void recorder.record(notebook, page());
	}

	async function agree() {
		asking = false;
		await recorder.agree(notebook.meta.subject);
		record();
	}
</script>

{#if here}
	<div class="recording" role="status" aria-label={t('record-recording', { time: formatClock(recorder.length / 1000) })}>
		<span class="dot" class:paused={recorder.paused} style:--level={recorder.level}></span>
		<span class="tabular-nums">{formatClock(recorder.length / 1000)}</span>
		{#if recorder.paused}
			<IconButton icon={Play} label={t('record-resume')} onclick={() => void recorder.resume()} />
		{:else}
			<IconButton icon={Pause} label={t('record-pause')} onclick={() => void recorder.pause()} />
		{/if}
		<IconButton icon={Square} label={t('record-stop')} onclick={() => void recorder.stop()} />
	</div>
{:else if elsewhere}
	<button type="button" class="recording elsewhere" {@attach tooltip(t('record-elsewhere', { notebook: elsewhere.meta.name }))} onclick={() => session.open(elsewhere.entry)}>
		<span class="dot"></span>
		<span class="tabular-nums">{formatClock(recorder.length / 1000)}</span>
	</button>
{:else}
	<IconButton icon={Mic} label={t('record-start')} onclick={record} />
{/if}
{#if recorded.length && !here}
	<IconButton icon={AudioLines} label={t('recordings-open')} onclick={() => (recorded.length === 1 ? void player.open(notebook, recorded[0]) : (listing = true))} />
{/if}
{#if recorder.failure}
	<span class="max-w-[220px] truncate text-[12px] text-(--danger)" {@attach tooltip(recorder.failure)}>{t('record-failed')}</span>
{/if}

{#if asking}
	<ConsentDialog onrecord={() => void agree()} onclose={() => (asking = false)} />
{/if}
{#if listing}
	<RecordingsDialog {notebook} onclose={() => (listing = false)} />
{/if}

<style>
	.recording {
		display: flex;
		height: 34px;
		align-items: center;
		gap: 6px;
		border-radius: 999px;
		padding-inline: 12px 4px;
		background: color-mix(in oklab, var(--danger) 14%, transparent);
		color: var(--text);
		font-size: 13px;
		font-weight: 600;
	}

	.recording.elsewhere {
		padding-inline: 12px;
	}

	.dot {
		--level: 0;
		width: 10px;
		height: 10px;
		flex: none;
		border-radius: 50%;
		background: var(--danger);
		box-shadow: 0 0 0 calc(var(--level) * 6px) color-mix(in oklab, var(--danger) 30%, transparent);
		transition: box-shadow 100ms linear;
	}

	.dot.paused {
		background: var(--text-muted);
		box-shadow: none;
	}
</style>
