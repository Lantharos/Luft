<script lang="ts">
	import type { Snippet } from 'svelte';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import { FluentNumber, t } from '@luft/i18n';
	import { flow } from '#lib/state/flow.svelte.js';
	import { install } from '#lib/state/install.svelte.js';

	interface Props {
		title: string;
		description?: string;
		children?: Snippet;
		actions?: Snippet;
		onback?: () => void;
		hideBack?: boolean;
	}

	let { title, description, children, actions, onback, hideBack = false }: Props = $props();

	let installing = $derived(install.started && !install.failed && !install.finished && flow.step !== 'finishing');
	let percent = $derived(Math.round((install.status?.progress ?? 0) * 100));
	let progress = $derived(t('setup-installing-progress', { progress: new FluentNumber(percent / 100, { style: 'percent' }) }));
</script>

<section class="flex h-full flex-col px-14 pt-14 pb-8">
	<header class="flex flex-col gap-2">
		<h1 class="text-[30px] leading-tight font-semibold">{title}</h1>
		{#if description}
			<p class="max-w-[540px] text-[15px] leading-relaxed text-[var(--text-soft)]">{description}</p>
		{/if}
	</header>
	<div class="soft-scroll scroll-fade -mx-3 mt-7 min-h-0 flex-1 overflow-y-auto px-3 pb-2">
		{@render children?.()}
	</div>
	<footer class="mt-5 grid min-h-10 grid-cols-[1fr_auto_1fr] items-center gap-3">
		<div class="flex justify-start">
			{#if !hideBack && (onback || flow.canGoBack)}
				<button type="button" class="plain-button large -ml-3" onclick={() => (onback ? onback() : flow.back())}><ArrowLeft size={17} />{t('setup-back')}</button>
			{/if}
		</div>
		{#if installing}
			<div class="flex items-center gap-3 text-[13px] text-[var(--text-muted)]" role="progressbar" aria-label={t('setup-installing-label')} aria-valuenow={percent}>
				<div class="h-1.5 w-28 overflow-hidden rounded-full bg-[var(--surface-hover)]">
					<div class="progress-fill h-full rounded-full bg-[var(--accent)]" style:--progress={percent / 100}></div>
				</div>
				{progress}
			</div>
		{:else}
			<span></span>
		{/if}
		<div class="flex justify-end gap-3">
			{@render actions?.()}
		</div>
	</footer>
</section>
