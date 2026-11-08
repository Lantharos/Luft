<script lang="ts">
	import { t } from '@luft/i18n';
	import { bytes, errorText, ProgressBar, Segmented } from '@luft/ui';
	import type { OpenNotebook } from '#lib/library/notebook.svelte.js';
	import { player } from '../player.svelte';
	import { processing } from '../processing.svelte';
	import { notesPage } from '../page';
	import { saveTranscript, transcriptOf, type Transcript } from '../transcript';
	import NotesView from './NotesView.svelte';
	import { stageText } from './stage';
	import TranscriptView from './TranscriptView.svelte';

	let { notebook, after }: { notebook: OpenNotebook; after: () => number } = $props();

	let showing: 'notes' | 'said' = $state('notes');
	let transcript: Transcript | null = $state.raw(null);
	let revision = $state(0);
	let failure = $state('');
	let recording = $derived(player.recording!);
	let stage = $derived(processing.stage(recording));
	let share = $derived(stage && 'share' in stage ? stage.share : null);
	let missing = $derived([processing.whisper, processing.writer].filter((model) => model && !model.installed));

	$effect(() => {
		void processing.revision;
		let alive = true;
		void transcriptOf(notebook, recording).then((loaded) => {
			if (!alive) return;
			transcript = loaded;
			revision++;
		});
		return () => (alive = false);
	});

	async function run(action: () => unknown) {
		failure = '';
		try {
			await action();
		} catch (error) {
			failure = errorText(error);
		}
	}
</script>

<aside class="panel" aria-label={t('panel-label')}>
	<div class="flex flex-col gap-3 p-3">
		<Segmented
			label={t('panel-label')}
			value={showing}
			options={[
				{ value: 'notes', label: t('panel-notes') },
				{ value: 'said', label: t('panel-said') }
			]}
			onchange={(value) => (showing = value)}
		/>
		{#if stage?.kind !== 'done'}
			<div class="flex flex-col gap-2 px-1">
				<p class="text-[12.5px] text-(--text-soft)">{stageText(stage, recording)}</p>
				{#if share !== null}
					<ProgressBar fraction={share} label={stageText(stage, recording)} />
				{/if}
				<div class="flex flex-wrap gap-2">
					{#if missing.length}
						<button type="button" class="button primary" onclick={() => void run(() => processing.download())}>
							{t('panel-download', { size: bytes(missing.reduce((total, model) => total + (model?.size ?? 0), 0)) })}
						</button>
					{:else if stage?.kind === 'waiting' && stage.for === 'charger'}
						<button type="button" class="button" onclick={() => processing.choose(notebook, recording, 'now')}>{t('panel-process-now')}</button>
					{/if}
				</div>
				{#if failure}
					<p class="text-[12px] text-(--danger)">{failure}</p>
				{/if}
			</div>
		{/if}
	</div>
	<div class="soft-scroll flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-2 pb-24">
		{#if transcript}
			{#key revision}
				{#if showing === 'notes'}
					<NotesView {transcript} onedit={() => void saveTranscript(notebook, recording, transcript!)} />
					{#if transcript.notes.done && transcript.notes.parts.some((part) => part.points.length)}
						<button type="button" class="button mx-2 self-start" onclick={() => void notesPage(notebook, transcript!, after())}>{t('panel-to-page')}</button>
					{/if}
				{:else}
					<TranscriptView said={transcript.said} />
				{/if}
			{/key}
		{/if}
	</div>
</aside>

<style>
	.panel {
		display: flex;
		width: 340px;
		flex: none;
		flex-direction: column;
		min-height: 0;
		border-left: 1px solid var(--hairline);
	}
</style>
