<script lang="ts">
	import { fileUrl } from '@lantharos/sabine';
	import { untrack } from 'svelte';
	import * as api from '#lib/api/index.js';
	import { toasts } from '#lib/shell/toasts.svelte.js';
	import { escapeHtml } from './html';
	import { applyShortcuts, extract } from './editor';

	interface Props {
		html: string;
		placeholder?: string;
		autofocus?: boolean;
		onsend: () => void;
	}

	let { html, placeholder = '', autofocus = false, onsend }: Props = $props();

	let editor = $state<HTMLDivElement>();
	let linking = $state<{ range: Range; url: string } | null>(null);
	let empty = $state(true);

	function start(element: HTMLDivElement) {
		untrack(() => {
			element.innerHTML = html;
			updateEmpty();
			if (!autofocus) return;
			element.focus();
			const range = document.createRange();
			range.setStart(element, 0);
			range.collapse(true);
			getSelection()?.removeAllRanges();
			getSelection()?.addRange(range);
		});
	}

	export function content() {
		return extract(editor!);
	}

	export function focus() {
		editor?.focus();
	}

	export function insert(markup: string) {
		editor?.focus();
		document.execCommand('insertHTML', false, markup);
		updateEmpty();
	}

	export function replaceSignature(markup: string) {
		if (!editor) return;
		editor.querySelectorAll('.signature').forEach((signature) => signature.remove());
		if (markup) editor.insertAdjacentHTML('beforeend', markup);
		updateEmpty();
	}

	export function command(name: 'bold' | 'italic' | 'insertUnorderedList' | 'insertOrderedList' | 'link') {
		editor?.focus();
		if (name === 'link') return startLink();
		document.execCommand(name);
	}

	function updateEmpty() {
		const clone = editor?.cloneNode(true) as HTMLElement | undefined;
		clone?.querySelectorAll('.signature').forEach((signature) => signature.remove());
		empty = !clone?.textContent?.trim() && !clone?.querySelector('img');
	}

	function startLink() {
		const selection = getSelection();
		if (!selection?.rangeCount) return;
		linking = { range: selection.getRangeAt(0).cloneRange(), url: '' };
	}

	function finishLink(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			event.stopPropagation();
			linking = null;
			editor?.focus();
		}
		if (event.key !== 'Enter' || !linking) return;
		event.preventDefault();
		const url = /^[a-z]+:/i.test(linking.url) ? linking.url : `https://${linking.url}`;
		const selection = getSelection()!;
		editor?.focus();
		selection.removeAllRanges();
		selection.addRange(linking.range);
		if (linking.range.collapsed) document.execCommand('insertHTML', false, `<a href="${escapeHtml(url)}">${escapeHtml(linking.url)}</a>`);
		else document.execCommand('createLink', false, url);
		linking = null;
	}

	function keydown(event: KeyboardEvent) {
		if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
			event.preventDefault();
			onsend();
		} else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
			event.preventDefault();
			startLink();
		}
	}

	function input(event: Event) {
		applyShortcuts(editor!, event as InputEvent);
		updateEmpty();
	}

	async function paste(event: ClipboardEvent) {
		const items = [...(event.clipboardData?.files ?? [])];
		const images = items.filter((file) => file.type.startsWith('image/'));
		event.preventDefault();
		if (images.length) {
			for (const image of images) {
				const path = await api.stashFile(image, image.name || 'image.png').catch((error) => (toasts.fail(error), null));
				if (path) insert(`<img src="${fileUrl(path)}" data-path="${escapeHtml(path)}" data-name="${escapeHtml(image.name || 'image.png')}" style="max-width:100%">`);
			}
			return;
		}
		const text = event.clipboardData?.getData('text/plain') ?? '';
		document.execCommand('insertText', false, text);
	}
</script>

<div class="wrap">
	<div
		bind:this={editor}
		{@attach start}
		class="editor soft-scroll"
		class:empty
		contenteditable="true"
		role="textbox"
		aria-multiline="true"
		aria-label="Message"
		tabindex="0"
		spellcheck="true"
		data-placeholder={placeholder}
		onkeydown={keydown}
		oninput={input}
		onpaste={(event) => void paste(event)}
	></div>
	{#if linking}
		<div class="link">
			<!-- svelte-ignore a11y_autofocus -->
			<input bind:value={linking.url} placeholder="Paste or type a link, then press Enter" aria-label="Link" autofocus onkeydown={finishLink} onblur={() => (linking = null)} />
		</div>
	{/if}
</div>

<style>
	.wrap {
		position: relative;
		display: flex;
		min-height: 0;
		flex: 1;
		flex-direction: column;
	}

	.editor {
		min-height: 0;
		flex: 1;
		overflow-y: auto;
		padding: 14px 18px;
		font-size: 14px;
		line-height: 1.6;
		outline: none;
		user-select: text;
		overflow-wrap: anywhere;
	}

	.editor.empty::before {
		content: attr(data-placeholder);
		position: absolute;
		color: var(--text-muted);
		pointer-events: none;
	}

	.editor :global(blockquote) {
		margin: 6px 0;
		border-left: 2px solid var(--hairline);
		padding-left: 12px;
		color: var(--text-soft);
	}

	.editor :global(a) {
		color: var(--accent);
	}

	.editor :global(ul),
	.editor :global(ol) {
		padding-left: 22px;
	}

	.editor :global(ul) {
		list-style: disc;
	}

	.editor :global(ol) {
		list-style: decimal;
	}

	.editor :global(h2) {
		font-size: 17px;
		font-weight: 600;
	}

	.editor :global(code) {
		border-radius: 6px;
		background: var(--surface-hover);
		padding: 1px 5px;
		font-family: var(--font-mono);
		font-size: 12.5px;
	}

	.editor :global(.signature) {
		color: var(--text-muted);
	}

	.link {
		position: absolute;
		inset: auto 12px 10px;
		border-radius: 14px;
		background: var(--popover);
		box-shadow: 0 12px 32px var(--shadow-soft);
		padding: 6px;
	}

	.link input {
		width: 100%;
		height: 32px;
		border-radius: 10px;
		background: var(--control);
		padding-inline: 12px;
		font-size: 13px;
		outline: none;
	}
</style>
