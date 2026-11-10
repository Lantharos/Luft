export interface Crop {
	x: number;
	y: number;
	width: number;
	height: number;
}

export const WHOLE: Crop = { x: 0, y: 0, width: 1, height: 1 };

export interface WrittenLine {
	text: string;
	glyphs: number[];
}

export interface PageObject {
	id: string;
	kind: 'text' | 'image';
	x: number;
	y: number;
	width: number;
	height: number;
	html?: string;
	text?: string;
	line?: number;
	size?: number;
	flow?: boolean;
	written?: WrittenLine[];
	typedAt?: number;
	asset?: string;
	crop?: Crop;
}

export interface ObjectChange {
	before: PageObject | null;
	after: PageObject | null;
}

const ALLOWED = new Set(['B', 'STRONG', 'I', 'EM', 'U', 'H2', 'H3', 'UL', 'OL', 'LI', 'BR', 'DIV', 'P', 'BLOCKQUOTE']);

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
