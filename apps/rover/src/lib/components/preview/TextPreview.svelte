<script lang="ts">
	import { RemoteImagesNotice, renderMarkdown } from '@luft/ui';
	import { highlight } from '@luft/ui/code';
	import type { FileEntry } from '#lib/bindings.js';
	import * as api from '#lib/bridge/index.js';
	import { loadText, type TextPreview } from '#lib/file-manager/inspect/text.js';

	interface Props {
		entry: FileEntry;
		markdown: boolean;
		full: boolean;
	}

	let { entry, markdown, full }: Props = $props();

	const PANE_LINES = 60;
	const HIGHLIGHT_LIMIT = 64 * 1024;
	const WEB_LINK = /^(https?:|mailto:)/i;

	let result = $state.raw<TextPreview | null>(null);
	let highlighted = $state.raw<{ html: string; rest: string } | null>(null);
	let text = $derived(result && 'text' in result ? (full ? result.text : result.text.split('\n', PANE_LINES).join('\n')) : '');
	let html = $state('');
	let heldBack = $state(false);
	let remoteImages = $state(false);

	$effect(() => {
		if (!markdown || !text) {
			html = '';
			return;
		}
		let current = true;
		void renderMarkdown(text, entry.path, remoteImages).then((rendered) => {
			if (!current) return;
			html = rendered.html;
			heldBack = rendered.heldBack;
		});
		return () => (current = false);
	});

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
		remoteImages = false;
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
		if (WEB_LINK.test(href)) void api.openLink(href);
	}
</script>

{#if result && 'binary' in result}
	<p class="preview-note">This file can’t be shown as text.</p>
{:else if html}
	<article class={['preview-markdown', full ? 'is-full' : 'is-compact']} onclickcapture={followLink}>
		{#if heldBack && full}
			<RemoteImagesNotice class="preview-markdown__remote" onshow={() => (remoteImages = true)} />
		{/if}
		{@html html}
	</article>
{:else if result && !(markdown && text)}
	<pre class={['preview-code', full ? 'is-full' : 'is-compact']}>{#if highlighted}{@html highlighted.html}{highlighted.rest}{:else}{text}{/if}{#if full && result.truncated}<span class="preview-code__more">…</span>{/if}</pre>
{/if}

<style>
	.preview-note {
		padding: 16px;
		color: var(--text-muted);
		font-size: 13px;
	}

	.preview-code {
		height: 100%;
		width: 100%;
		overflow: auto;
		margin: 0;
		padding: 20px 24px;
		color: var(--text-soft);
		font-family: var(--font-mono);
		font-size: 12.5px;
		line-height: 1.6;
		tab-size: 4;
		white-space: pre;
		user-select: text;
	}

	.preview-code.is-compact {
		overflow: hidden;
		padding: 12px;
		font-size: 10.5px;
		line-height: 1.5;
	}

	.preview-code__more {
		color: var(--text-muted);
	}

	.preview-markdown {
		height: 100%;
		width: 100%;
		overflow: auto;
		padding: 28px 36px;
		color: var(--text-soft);
		font-size: 14px;
		line-height: 1.65;
		user-select: text;
	}

	.preview-markdown.is-compact {
		overflow: hidden;
		padding: 12px 14px;
		font-size: 10.5px;
	}

	.preview-markdown :global(:is(h1, h2, h3, h4)) {
		margin: 1.2em 0 0.5em;
		color: var(--text);
		font-weight: 600;
		line-height: 1.3;
	}
	.preview-markdown :global(h1) {
		font-size: 1.6em;
	}
	.preview-markdown :global(h2) {
		font-size: 1.3em;
	}
	.preview-markdown :global(h3) {
		font-size: 1.1em;
	}
	.preview-markdown :global(:is(p, ul, ol, pre, blockquote, table)) {
		margin: 0.7em 0;
	}
	.preview-markdown :global(:is(ul, ol)) {
		padding-left: 1.4em;
		list-style: revert;
	}
	.preview-markdown :global(a) {
		color: var(--accent);
	}
	.preview-markdown :global(code) {
		border-radius: 5px;
		background: var(--surface-hover);
		padding: 0.1em 0.35em;
		font-family: var(--font-mono);
		font-size: 0.9em;
	}
	.preview-markdown :global(pre) {
		overflow-x: auto;
		border-radius: 10px;
		background: var(--surface);
		padding: 12px 14px;
	}
	.preview-markdown :global(pre code) {
		background: none;
		padding: 0;
	}
	.preview-markdown :global(blockquote) {
		border-left: 3px solid var(--hairline);
		padding-left: 1em;
		color: var(--text-muted);
	}
	.preview-markdown :global(img) {
		max-width: 100%;
		border-radius: 8px;
	}
	.preview-markdown :global(img[data-remote]) {
		display: none;
	}
	.preview-markdown :global(table) {
		border-collapse: collapse;
	}
	.preview-markdown :global(:is(th, td)) {
		padding: 4px 10px;
		box-shadow: inset 0 -1px 0 var(--hairline);
		text-align: left;
	}

	.preview-markdown :global(.preview-markdown__remote) {
		margin-bottom: 16px;
	}
</style>
