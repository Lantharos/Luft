<script lang="ts">
	import { highlight } from '@luft/ui/code';
	import * as api from '#lib/api.js';
	import { renderMarkdown } from '#lib/file-manager/inspect/markdown.js';
	import { loadText, type TextPreview } from '#lib/file-manager/inspect/text.js';
	import type { FileEntry } from '#lib/types/index.js';

	interface Props {
		entry: FileEntry;
		markdown: boolean;
		full: boolean;
	}

	let { entry, markdown, full }: Props = $props();

	const PANE_LINES = 60;
	const HIGHLIGHT_LIMIT = 64 * 1024;
	const WEB_LINK = /^https?:\/\//i;

	let result = $state.raw<TextPreview | null>(null);
	let highlighted = $state.raw<{ html: string; rest: string } | null>(null);
	let text = $derived(result && 'text' in result ? (full ? result.text : result.text.split('\n', PANE_LINES).join('\n')) : '');
	let html = $derived(markdown && text ? renderMarkdown(text, entry.path) : '');

	$effect(() => {
		highlighted = null;
		if (markdown || !text) return;
		const code = text;
		const cut = code.length > HIGHLIGHT_LIMIT ? code.lastIndexOf('\n', HIGHLIGHT_LIMIT) + 1 || HIGHLIGHT_LIMIT : code.length;
		let current = true;
		void highlight(code.slice(0, cut), entry.name).then((html) => {
			if (current) highlighted = { html, rest: code.slice(cut) };
		});
		return () => (current = false);
	});

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
	<pre class={['preview-code', full ? 'is-full' : 'is-compact']}>{#if highlighted}{@html highlighted.html}{highlighted.rest}{:else}{text}{/if}{#if full && result.truncated}<span class="preview-code__more">…</span>{/if}</pre>
{/if}
