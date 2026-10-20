<script lang="ts">
	import { t } from '@luft/i18n';
	import { bytes } from '@luft/ui';
	import type { Stage } from '#lib/api/meet.js';
	import { session } from '#lib/state/meet.svelte.js';
	import { maker } from '#lib/state/stick.svelte.js';

	const TITLES: Record<Stage, string> = {
		shrinking: 'working-shrinking',
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
	<div class="mt-9 flex flex-col gap-3" role="progressbar" aria-valuenow={Math.round(fraction * 100)} aria-label={title}>
		<div class="track" class:waiting={!progress || (!measured && fraction < 1)}>
			<div class="fill progress-fill" style:--progress={Math.max(fraction, 0.02)}></div>
		</div>
		<span class="text-[13px] text-[var(--text-muted)]">
			{#if measured && progress}
				{t('working-progress', { done: bytes(progress.done), total: bytes(progress.total) })}
			{:else}
				{t('working-keep-open')}
			{/if}
		</span>
	</div>
</section>

<style>
	.track {
		height: 8px;
		overflow: hidden;
		border-radius: var(--radius-pill);
		background: var(--surface-hover);
	}

	.fill {
		height: 100%;
		border-radius: inherit;
		background: var(--accent);
	}

	.waiting .fill {
		width: 30%;
		translate: none;
		animation: drift 1.6s var(--ease-point) infinite;
	}

	@keyframes drift {
		from {
			transform: translateX(-100%);
		}
		to {
			transform: translateX(340%);
		}
	}
</style>
