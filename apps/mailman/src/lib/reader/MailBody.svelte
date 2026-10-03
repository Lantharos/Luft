<script lang="ts">
	import { appearance } from '@luft/ui';
	import * as api from '#lib/api/index.js';
	import type { Rendered } from '#lib/api/index.js';
	import { composer } from '#lib/compose/composer.svelte.js';
	import { mail } from '#lib/mail/mail.svelte.js';
	import { markQuotes, showFiles, showRemote, stylesheet } from './body';
	import { remoteImages } from './images.svelte';

	interface Props {
		rendered: Rendered;
		images: boolean;
		quotes?: number;
		expandQuotes?: boolean;
	}

	let { rendered, images, quotes = $bindable(0), expandQuotes = false }: Props = $props();

	let host = $state<HTMLDivElement>();
	let content = $state<HTMLDivElement | null>(null);

	$effect(() => {
		if (!host) return;
		const root = host.shadowRoot ?? host.attachShadow({ mode: 'open' });
		const style = document.createElement('style');
		style.textContent = stylesheet(rendered, appearance.scheme === 'dark', mail.settings.darkMail);
		const body = document.createElement('div');
		body.className = 'mm-root mm-collapsed';
		body.innerHTML = rendered.html;
		root.replaceChildren(style, body);
		showFiles(body);
		quotes = markQuotes(body);
		content = body;
	});

	$effect(() => {
		content?.classList.toggle('mm-collapsed', !expandQuotes);
	});

	$effect(() => {
		if (images && rendered.remote.length) remoteImages.request(rendered.remote);
	});

	$effect(() => {
		if (content && images && rendered.remote.length) showRemote(content, remoteImages.loaded);
	});

	function click(event: MouseEvent) {
		const link = (event.composedPath()[0] as Element | undefined)?.closest?.('a[href]');
		if (!link) return;
		event.preventDefault();
		const href = link.getAttribute('href') ?? '';
		if (/^mailto:/i.test(href)) composer.mailto(href);
		else if (/^https?:/i.test(href)) void api.openUri(href);
	}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<div bind:this={host} class="mail-body" onclick={click}></div>
