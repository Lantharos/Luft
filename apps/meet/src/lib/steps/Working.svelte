<script lang="ts">
	import { t } from '@luft/i18n';
	import { bytes, ProgressBar } from '@luft/ui';
	import type { Stage } from '#lib/bindings.js';
	import { session } from '#lib/state/meet.svelte.js';
	import { maker } from '#lib/state/stick.svelte.js';

	const TITLES: Record<Stage, string> = {
		shrinking: 'working-shrinking',
		erasing: 'working-erasing',
		partitioning: 'working-partitioning',
		downloading: 'working-downloading',
		packing: 'working-packing',
		removing: 'working-removing',
		writing: 'working-writing',
		copying: 'working-copying',
		verifying: 'working-verifying'
	};
	const MEASURED: Stage[] = ['downloading', 'packing', 'writing', 'copying', 'verifying'];

	let progress = $derived(session.progress);
	let stage = $derived(progress?.stage ?? 'shrinking');
	let message = $derived(
		stage === 'removing' && session.platform === 'linux' ? 'working-removing-linux' : stage === 'downloading' && maker.making ? 'working-stick-downloading' : TITLES[stage]
	);
	let title = $derived(t(message));
	let fraction = $derived(progress && progress.total > 0 ? progress.done / progress.total : 0);
	let measured = $derived(!!progress && progress.total > 0 && MEASURED.includes(progress.stage));
</script>

<section class="flex h-full flex-col justify-center px-14">
	<h1 class="text-[30px] leading-tight font-semibold">{title}</h1>
	<p class="mt-2 max-w-[520px] text-[15px] leading-relaxed text-[var(--text-soft)]">{t(`${message}.description`)}</p>
	<div class="mt-9 flex flex-col gap-3">
		<ProgressBar fraction={!progress || (!measured && fraction < 1) ? null : Math.max(fraction, 0.02)} label={title} class="h-2 bg-[var(--surface-hover)]" />
		<span class="text-[13px] text-[var(--text-muted)]">
			{#if measured && progress}
				{t('working-progress', { done: bytes(progress.done), total: bytes(progress.total) })}
			{:else}
				{t('working-keep-open')}
			{/if}
		</span>
	</div>
</section>
