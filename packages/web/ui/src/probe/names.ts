const IMPLICIT_ROLES: [string, string][] = [
	['button, input[type="button"], input[type="submit"], summary', 'button'],
	['a[href]', 'link'],
	['input[type="checkbox"]', 'checkbox'],
	['input[type="radio"]', 'radio'],
	['input[type="range"]', 'slider'],
	['input:not([type]), input[type="text"], input[type="search"], input[type="email"], input[type="password"], input[type="url"], input[type="number"], textarea', 'textbox'],
	['select', 'combobox'],
	['h1, h2, h3, h4, h5, h6', 'heading'],
	['dialog', 'dialog'],
	['nav', 'navigation'],
	['main', 'main'],
	['li', 'listitem'],
	['img[alt]', 'img']
];

export const squash = (text: string) => text.replace(/\s+/g, ' ').trim();

export function roleOf(element: Element) {
	const explicit = element.getAttribute('role')?.trim().split(/\s+/)[0];
	return explicit || IMPLICIT_ROLES.find(([selector]) => element.matches(selector))?.[1];
}

const inline = (element: Element) => getComputedStyle(element).display.startsWith('inline');

export function contentOf(node: Node): string {
	if (node instanceof Text) return node.data;
	if (!(node instanceof HTMLElement || node instanceof SVGElement) || node.ariaHidden === 'true' || !node.checkVisibility()) return '';
	if (node instanceof HTMLImageElement) return node.alt;
	const content = [...node.childNodes].map(contentOf).join('');
	return inline(node) ? content : ` ${content} `;
}

const labelled = (ids: string) =>
	ids
		.split(/\s+/)
		.flatMap((id) => document.getElementById(id) ?? [])
		.map(contentOf)
		.join(' ');

function fieldName(field: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement) {
	const labels = [...(field.labels ?? [])].map(contentOf).join(' ');
	return labels.trim() ? labels : field.getAttribute('placeholder') ?? field.title;
}

export function nameOf(element: Element) {
	const labelledBy = element.getAttribute('aria-labelledby');
	const label = element.getAttribute('aria-label');
	if (labelledBy) return squash(labelled(labelledBy));
	if (label?.trim()) return squash(label);
	if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement) return squash(fieldName(element));
	return squash(contentOf(element)) || squash(element.getAttribute('title') ?? '');
}
