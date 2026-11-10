<script lang="ts">
	import { appearance } from '@luft/ui';
	import type { Rendered } from '#lib/bindings.js';
	import * as api from '#lib/bridge/index.js';
	import { composer } from '#lib/compose/composer.svelte.js';
	import { mail } from '#lib/mail/mail.svelte.js';
	import { applyColorScheme, markQuotes, showFiles, showRemote, SKELETON, stylesheet } from './body';
	import { remoteImages } from './images.svelte';

	interface Props {
		rendered: Rendered;
		images: boolean;
		quotes?: number;
		expandQuotes?: boolean;
	}

	let { rendered, images, quotes = $bindable(0), expandQuotes = false }: Props = $props();

	let frame = $state<HTMLIFrameElement>();
	let content = $state<HTMLDivElement | null>(null);

	$effect(() => {
		if (!frame) return;
		const page = frame.contentDocument!;
		page.open();
		page.write(SKELETON);
		page.close();
		const dark = appearance.scheme === 'dark';
		const style = page.createElement('style');
		style.textContent = stylesheet(frame, rendered, dark, mail.settings.darkMail);
		const body = page.createElement('div');
		body.className = 'mm-root mm-collapsed';
		body.innerHTML = rendered.html;
		applyColorScheme(body, dark && mail.settings.darkMail);
		page.head.append(style);
		page.body.append(body);
		page.addEventListener('click', click);
		page.addEventListener('keydown', key);
		showFiles(body);
		quotes = markQuotes(body);
		content = body;
	});

	$effect(() => {
		content?.classList.toggle('mm-collapsed', !expandQuotes);
	});

	$effect(() => {
		if (!frame || !content) return;
		const [shown, body] = [frame, content];
		const page = body.ownerDocument.documentElement;
		let width = 0;
		const resizes = new ResizeObserver(([entry]) => {
			const [{ inlineSize, blockSize }] = entry.borderBoxSize;
			if (inlineSize === width) return void (shown.style.height = `${blockSize}px`);
			width = inlineSize;
			body.style.zoom = '';
			const natural = body.scrollWidth;
			if (natural > inlineSize) body.style.zoom = `${inlineSize / natural}`;
			shown.style.height = `${page.offsetHeight}px`;
		});
		resizes.observe(page);
		return () => resizes.disconnect();
	});

	$effect(() => {
		if (images && rendered.remote.length) remoteImages.request(rendered.remote);
	});

	$effect(() => {
		if (content && images && rendered.remote.length) showRemote(content, remoteImages.loaded);
	});

	function click(event: MouseEvent) {
		const link = (event.target as Element).closest('a[href]');
		if (!link) return;
		event.preventDefault();
		const href = link.getAttribute('href') ?? '';
		if (/^mailto:/i.test(href)) composer.mailto(href);
		else if (/^https?:/i.test(href)) void api.openUri(href);
	}

	function key(event: KeyboardEvent) {
		if (!window.dispatchEvent(new KeyboardEvent(event.type, event))) event.preventDefault();
	}
</script>

<iframe bind:this={frame} class="mail-body" title="Message" sandbox="allow-same-origin"></iframe>

<style>
	.mail-body {
		display: block;
		width: 100%;
		height: 0;
		border: 0;
	}
</style>
