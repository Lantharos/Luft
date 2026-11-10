import { fileUrl } from '@lantharos/sabine';
import type { Rendered } from '#lib/bindings.js';

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
const DARK_QUERY = /@media[^{]*prefers-color-scheme\s*:\s*dark[^{]*/gi;

const INHERITED = ['--text', '--text-muted', '--accent', '--hairline'];
const FACES = [
	['400', 'Regular'],
	['500', 'Medium'],
	['600 700', 'Semibold']
]
	.map(([weight, name]) => `@font-face { font-family: 'Open Runde'; font-weight: ${weight}; font-display: swap; src: local('Open Runde ${name}'), local('OpenRunde-${name}'), url('/fonts/OpenRunde-${name}.woff2') format('woff2'); }`)
	.join('\n');

export const SKELETON = '<!doctype html><html><head></head><body></body></html>';

function inherited(frame: HTMLElement) {
	const style = getComputedStyle(frame);
	const tokens = INHERITED.map((token) => `${token}: ${style.getPropertyValue(token)};`).join(' ');
	return `:root { color-scheme: ${style.colorScheme}; ${tokens} }`;
}

export function stylesheet(frame: HTMLElement, rendered: Rendered, dark: boolean, darken: boolean) {
	const adopt = rendered.plain || !rendered.designed;
	const ownDark = dark && darken && !adopt && rendered.html.search(DARK_QUERY) !== -1;
	const inverted = dark && darken && !adopt && !ownDark;
	return `
		${adopt ? FACES : ''}
		${inherited(frame)}
		html, body { margin: 0; overflow: hidden; background: none; }
		.mm-root { overflow-wrap: anywhere; font: 14px/1.6 ${adopt ? "'Open Runde', system-ui, sans-serif" : 'system-ui, sans-serif'}; color: ${adopt ? 'var(--text)' : '#1b1b19'}; }
		${adopt ? '.mm-root a { color: var(--accent); } .mm-root blockquote { margin: 8px 0; padding-left: 12px; border-left: 2px solid var(--hairline); color: var(--text-muted); }' : ownDark ? '.mm-root { color: var(--text); border-radius: 12px; overflow: hidden; }' : '.mm-root { background: #fff; border-radius: 12px; padding: 12px; }'}
		${inverted ? '.mm-root { filter: invert(0.9) hue-rotate(180deg); } .mm-root img, .mm-root video, .mm-root [style*="background-image"] { filter: invert(1) hue-rotate(180deg); }' : ''}
		.mm-root > :first-child { margin-top: 0; }
		.mm-root > :last-child { margin-bottom: 0; }
		.mm-plain { white-space: pre-wrap; }
		.mm-collapsed .mm-hidden { display: none !important; }
		img { max-width: 100%; height: auto; }
		img[data-mm-remote]:not([src]) { display: none; }
		table { max-width: 100%; }
		pre, code { white-space: pre-wrap; }
	`;
}

export function quoteStylesheet(frame: HTMLElement) {
	return `
		${FACES}
		${inherited(frame)}
		html, body { margin: 0; background: none; }
		.mm-root { overflow-wrap: anywhere; font: 13px/1.6 'Open Runde', system-ui, sans-serif; color: var(--text-muted); }
		.mm-root a { color: var(--accent); }
		img { max-width: 100%; height: auto; }
		img[data-mm-remote]:not([src]) { display: none; }
		table { max-width: 100%; }
		pre, code { white-space: pre-wrap; }
	`;
}

export function applyColorScheme(root: ParentNode, dark: boolean) {
	root.querySelectorAll('style').forEach((style) => {
		style.textContent = (style.textContent ?? '').replace(DARK_QUERY, dark ? '@media all ' : '@media not all ');
	});
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
