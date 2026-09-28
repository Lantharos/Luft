<script lang="ts">
	import * as api from '$lib/api';
	import { renderMarkdown } from '$lib/file-manager/inspect/markdown';
	import { loadText, type TextPreview } from '$lib/file-manager/inspect/text';
	import type { FileEntry } from '$lib/types';

	interface Props {
		entry: FileEntry;
		markdown: boolean;
		full: boolean;
	}

	let { entry, markdown, full }: Props = $props();

	const PANE_LINES = 60;
	const WEB_LINK = /^https?:\/\//i;

	let result = $state.raw<TextPreview | null>(null);
	let text = $derived(result && 'text' in result ? (full ? result.text : result.text.split('\n', PANE_LINES).join('\n')) : '');
	let html = $derived(markdown && text ? renderMarkdown(text, entry.path) : '');

	$effect(() => {
		const controller = new AbortController();
		result = null;
		loadText(entry.path, entry.size, controller.signal).then(
			(loaded) => (result = loaded),
			() => (result = { binary: true })
		);
		return () => controller.abort();
	});

	function followLink(event: MouseEvent) {
		const link = event.target instanceof Element ? event.target.closest('a') : null;
		if (!link) return;
		event.preventDefault();
		const href = link.getAttribute('href') ?? '';
		if (WEB_LINK.test(href)) void api.openWithDefault(href);
	}
</script>

{#if result && 'binary' in result}
	<p class="preview-note">This file can’t be shown as text.</p>
{:else if html}
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	<article class={['preview-markdown', full ? 'is-full' : 'is-compact']} onclickcapture={followLink}>{@html html}</article>
{:else if result}
	<pre class={['preview-code', full ? 'is-full' : 'is-compact']}>{text}{#if full && result.truncated}<span class="preview-code__more">…</span>{/if}</pre>
{/if}
