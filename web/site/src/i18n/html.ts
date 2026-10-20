const ENTITIES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };

const escape = (text: string) => text.replace(/[&<>"]/g, (character) => ENTITIES[character]);

export const link = (href: string, text: string) => `<a class="link" href="${escape(href)}">${escape(text)}</a>`;

export function joined(locale: string, items: string[]) {
	return new Intl.ListFormat(locale, { type: 'conjunction' })
		.formatToParts(items.map((_, index) => String(index)))
		.map((part) => (part.type === 'element' ? items[Number(part.value)] : escape(part.value)))
		.join('');
}
