<script lang="ts">
	import type { Item } from '$lib/api';
	import * as api from '$lib/api';
	import CantShow from '$lib/shell/CantShow.svelte';
	import { DOCUMENT_SCOPE, openDocument, pdfModules } from './pdf';
	import { documentState } from './state.svelte';
	import { showDocument } from './viewer';

	const WHEEL_ZOOM = 0.004;

	let { item }: { item: Item } = $props();

	let container = $state<HTMLDivElement>();
	let pages = $state<HTMLDivElement>();
	let problem = $state(false);

	$effect(() => {
		if (!container || !pages) return;
		const host = container;
		const inner = pages;
		let cancelled = false;
		let hide: (() => void) | null = null;
		const loading = Promise.all([pdfModules(), openDocument(item.path, item.modified)]);
		loading
			.then(async ([{ viewer }, task]) => [viewer, await task.promise] as const)
			.then(([viewer, document]) => {
				if (!cancelled) hide = showDocument(viewer, host, inner, document);
			})
			.catch(() => (problem = true));
		return () => {
			cancelled = true;
			hide?.();
			void loading.then(([, task]) => task.destroy(), () => {});
			documentState.reset();
		};
	});

	function wheelZoom(node: HTMLElement) {
		const wheel = (event: WheelEvent) => {
			if (!event.ctrlKey || !documentState.viewer) return;
			event.preventDefault();
			documentState.viewer.updateScale({ scaleFactor: Math.exp(-event.deltaY * WHEEL_ZOOM), origin: [event.clientX, event.clientY] });
			documentState.fit = null;
		};
		node.addEventListener('wheel', wheel, { passive: false });
		return () => node.removeEventListener('wheel', wheel);
	}

	function followLink(event: MouseEvent) {
		const link = (event.target as Element).closest('a[href]') as HTMLAnchorElement | null;
		if (!link || link.href.startsWith(location.origin) || link.getAttribute('href')?.startsWith('#')) return;
		event.preventDefault();
		void api.openUri(link.href);
	}
</script>

<div class="document {DOCUMENT_SCOPE}">
	{#if problem}
		<CantShow {item} message="This document can't be opened." detail="It may be damaged or protected in a way Magpie doesn't support." />
	{:else}
		<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
		<div bind:this={container} class="pages soft-scroll" onclick={followLink} {@attach wheelZoom}>
			<div bind:this={pages} class="pdfViewer"></div>
		</div>
	{/if}
</div>

<style>
	.document {
		position: absolute;
		inset: 0;
		background: var(--app-bg);
	}

	.pages {
		position: absolute;
		inset: 0;
		overflow: auto;
	}

	.pages :global(.pdfViewer) {
		padding-block: 20px 40px;
	}

	.pages :global(.pdfViewer .page) {
		margin: 0 auto 16px;
		box-shadow: 0 2px 14px var(--shadow-faint);
	}

	.pages :global(.textLayer ::selection) {
		background: color-mix(in oklab, var(--accent) 40%, transparent);
	}

	.pages :global(.textLayer .highlight) {
		--highlight-bg-color: color-mix(in oklab, var(--accent) 38%, transparent);
		--highlight-selected-bg-color: color-mix(in oklab, var(--accent) 70%, transparent);
	}
</style>
