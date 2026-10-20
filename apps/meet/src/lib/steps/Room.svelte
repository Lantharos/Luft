<script lang="ts">
	import { t } from '@luft/i18n';
	import { bytes, Dialog, SplitBar } from '@luft/ui';
	import Frame from '#lib/components/Frame.svelte';
	import Problem from '#lib/components/Problem.svelte';
	import { session } from '#lib/state/meet.svelte.js';

	const GIB = 1024 ** 3;

	let confirming = $state(false);
	let report = $derived(session.report!);
	let windows = $derived(session.windows!);
	let fromFile = $derived(session.source.kind === 'file');

	function start() {
		confirming = false;
		void session.makeRoom();
	}
</script>

<Frame title={t('room-title')} description={t('room-description')} onback={() => session.go('check')}>
	<div class="flex flex-col gap-6">
		<SplitBar
			total={windows.windowsSize}
			used={windows.windowsUsed}
			value={session.luft}
			min={report.smallestLuft}
			max={report.mostLuft}
			step={GIB}
			onchange={(next) => (session.luft = next)}
		/>
		<p class="text-[13.5px] leading-relaxed text-[var(--text-soft)]">
			{t('room-live', { size: bytes(report.live) })}
		</p>
		{#if session.failure}
			<Problem failure={session.failure} />
		{/if}
	</div>
	{#snippet actions()}
		<button type="button" class="plain-button large" onclick={() => session.chooseIso()}>
			{fromFile ? t('meet-iso-using') : t('meet-iso-use')}
		</button>
		<button type="button" class="button primary large px-6" onclick={() => (confirming = true)}>{t('room-make')}</button>
	{/snippet}
</Frame>

{#if confirming}
	<Dialog
		title={t('room-confirm-title', { size: bytes(session.luft) })}
		description={fromFile ? t('room-confirm-file') : t('room-confirm-download', { size: bytes(report.download) })}
		onclose={() => (confirming = false)}
	>
		{#snippet actions()}
			<button type="button" class="button" onclick={() => (confirming = false)}>{t('meet-cancel')}</button>
			<button type="button" class="button primary" onclick={start}>{t('room-make')}</button>
		{/snippet}
	</Dialog>
{/if}
