/** Typed text or a picture placed on a page, above the ink. */
export interface PageObject {
	id: string;
	kind: 'text' | 'image';
	x: number;
	y: number;
	width: number;
	height: number;
	/** Text boxes: their formatted contents, and the same as plain text for search. */
	html?: string;
	text?: string;
	/** Pictures: the file in the notebook's assets folder. */
	asset?: string;
}

export interface ObjectChange {
	before: PageObject | null;
	after: PageObject | null;
}

const ALLOWED = new Set(['B', 'STRONG', 'I', 'EM', 'U', 'H2', 'H3', 'UL', 'OL', 'LI', 'BR', 'DIV', 'P', 'BLOCKQUOTE']);

/** Keeps only the formatting text boxes offer, so nothing else ever runs or shows. */
export function cleanHtml(html: string): string {
	const template = document.createElement('template');
	template.innerHTML = html;
	const walk = (node: Node) => {
		for (const child of [...node.childNodes]) {
			if (child.nodeType === Node.ELEMENT_NODE) {
				const element = child as Element;
				if (!ALLOWED.has(element.tagName)) {
					element.replaceWith(...element.childNodes);
					walk(node);
					return;
				}
				for (const attribute of [...element.attributes]) element.removeAttribute(attribute.name);
				walk(element);
			} else if (child.nodeType !== Node.TEXT_NODE) child.remove();
		}
	};
	walk(template.content);
	return template.innerHTML;
}

export const inverse = (changes: ObjectChange[]): ObjectChange[] => changes.map(({ before, after }) => ({ before: after, after: before }));
