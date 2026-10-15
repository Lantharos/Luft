<script lang="ts">
	import { bytes, Dialog, SplitBar } from '@luft/ui';
	import Frame from '#lib/components/Frame.svelte';
	import { session } from '#lib/state/meet.svelte.js';

	const GIB = 1024 ** 3;

	let confirming = $state(false);
	let report = $derived(session.report!);
	let fromFile = $derived(session.source.kind === 'file');

	function start() {
		confirming = false;
		void session.makeRoom();
	}
</script>

<Frame title="How much room for Luft?" description="Windows makes itself smaller to give Luft space. Your files in Windows stay exactly where they are." onback={() => session.go('check')}>
	<div class="flex flex-col gap-6">
		<SplitBar
			total={report.facts.windowsSize}
			used={report.facts.windowsUsed}
			value={session.luft}
			min={report.smallestLuft}
			max={report.mostLuft}
			step={GIB}
			onchange={(next) => (session.luft = next)}
		/>
		<p class="text-[13.5px] leading-relaxed text-[var(--text-soft)]">
			Windows keeps room to grow. Luft also sets aside {bytes(report.live)} to start from, which it gives back once it’s installed.
		</p>
		{#if session.error}
			<p class="text-[13.5px] text-[var(--danger)]">{session.error}</p>
		{/if}
	</div>
	{#snippet actions()}
		<button type="button" class="plain-button large" onclick={() => session.chooseIso()}>
			{fromFile ? 'Using your Luft ISO' : 'Use an ISO I already have'}
		</button>
		<button type="button" class="button primary large px-6" onclick={() => (confirming = true)}>Make room</button>
	{/snippet}
</Frame>

{#if confirming}
	<Dialog
		title="Give Luft {bytes(session.luft)}?"
		description={fromFile
			? 'Windows shrinks its drive, then Meet Luft copies Luft from your ISO. Keep the PC plugged in.'
			: `Windows shrinks its drive, then Meet Luft downloads Luft, about ${bytes(report.live)}. Keep the PC plugged in and online.`}
		onclose={() => (confirming = false)}
	>
		{#snippet actions()}
			<button type="button" class="button" onclick={() => (confirming = false)}>Cancel</button>
			<button type="button" class="button primary" onclick={start}>Make room</button>
		{/snippet}
	</Dialog>
{/if}
