<script lang="ts">
	import type { Snippet } from 'svelte';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import { t } from '@luft/i18n';

	interface Props {
		title: string;
		description?: string;
		children?: Snippet;
		actions?: Snippet;
		onback?: () => void;
	}

	let { title, description, children, actions, onback }: Props = $props();
</script>

<section class="flex h-full flex-col px-14 pt-14 pb-9">
	<header class="flex flex-col gap-2">
		<h1 class="text-[30px] leading-tight font-semibold">{title}</h1>
		{#if description}
			<p class="max-w-[560px] text-[15px] leading-relaxed text-[var(--text-soft)]">{description}</p>
		{/if}
	</header>
	<div class="soft-scroll scroll-fade -mx-3 mt-7 min-h-0 flex-1 overflow-y-auto px-3 pb-2">
		{@render children?.()}
	</div>
	<footer class="mt-5 flex min-h-10 items-center gap-3">
		{#if onback}
			<button type="button" class="plain-button large -ml-3" onclick={onback}><ArrowLeft size={17} />{t('meet-back')}</button>
		{/if}
		<div class="flex flex-1 items-center justify-end gap-3">
			{@render actions?.()}
		</div>
	</footer>
</section>
