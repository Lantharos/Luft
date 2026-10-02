import { fileUrl } from '@lantharos/sabine';
import type { Rendered } from '$lib/api';

const QUOTES = [
	'.mm-quote',
	'blockquote[type="cite"]',
	'.gmail_quote',
	'.gmail_quote_container',
	'.moz-cite-prefix',
	'.yahoo_quoted',
	'.protonmail_quote',
	'.mm-signature',
	'.gmail_signature',
	'.moz-signature',
	'#Signature'
].join(',');
const OUTLOOK_MARKERS = '#divRplyFwdMsg, #appendonsend, hr#stopSpelling';

export function stylesheet(rendered: Rendered, dark: boolean, darken: boolean) {
	const adopt = rendered.plain || !rendered.designed;
	const inverted = dark && darken && !adopt;
	return `
		:host { display: block; contain: layout paint; overflow: hidden; }
		.mm-root { overflow-wrap: anywhere; font: 14px/1.6 ${adopt ? "'Open Runde', system-ui, sans-serif" : 'system-ui, sans-serif'}; color: ${adopt ? 'var(--text)' : '#1b1b19'}; user-select: text; cursor: auto; }
		${adopt ? '.mm-root a { color: var(--accent); } .mm-root blockquote { margin: 8px 0; padding-left: 12px; border-left: 2px solid var(--hairline); color: var(--text-muted); }' : '.mm-root { background: #fff; border-radius: 12px; padding: 12px; }'}
		${inverted ? '.mm-root { filter: invert(0.9) hue-rotate(180deg); } .mm-root img, .mm-root video, .mm-root [style*="background-image"] { filter: invert(1) hue-rotate(180deg); }' : ''}
		.mm-plain { white-space: pre-wrap; }
		.mm-collapsed .mm-hidden { display: none !important; }
		img { max-width: 100%; height: auto; }
		img[data-mm-remote]:not([src]) { display: none; }
		table { max-width: 100%; }
		pre, code { white-space: pre-wrap; }
	`;
}

export function markQuotes(content: HTMLElement) {
	const hidden: Element[] = [];
	content.querySelectorAll(QUOTES).forEach((element) => {
		if (!element.parentElement?.closest('.mm-hidden')) hidden.push(element);
	});
	content.querySelectorAll(OUTLOOK_MARKERS).forEach((marker) => {
		for (let sibling: Element | null = marker; sibling; sibling = sibling.nextElementSibling) hidden.push(sibling);
	});
	hidden.forEach((element) => element.classList.add('mm-hidden'));
	const visible = content.cloneNode(true) as HTMLElement;
	visible.querySelectorAll('.mm-hidden').forEach((element) => element.remove());
	if (visible.textContent?.trim() || visible.querySelector('img')) return hidden.length;
	hidden.forEach((element) => element.classList.remove('mm-hidden'));
	return 0;
}

export function showFiles(root: ParentNode) {
	root.querySelectorAll<HTMLImageElement>('img[data-mm-file]').forEach((image) => {
		image.src = fileUrl(image.dataset.mmFile!);
	});
}

export function showRemote(root: ParentNode, loaded: ReadonlyMap<string, string>) {
	root.querySelectorAll<HTMLImageElement>('img[data-mm-remote]').forEach((image) => {
		const path = loaded.get(image.dataset.mmRemote!);
		if (path) image.src = fileUrl(path);
	});
}
