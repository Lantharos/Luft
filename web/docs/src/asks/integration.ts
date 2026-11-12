import type { AstroIntegration } from 'astro';
import { resolveAsks, type Ask } from './schema';

interface Element {
	type: 'element';
	tagName: string;
	properties: Record<string, unknown>;
	children: Node[];
}

type Node = Element | { type: 'root' | 'text'; children?: Node[]; value?: string };

interface Context {
	readonly fileURL: URL | undefined;
	readonly data: { astro?: { frontmatter: { asks?: Ask[] } } };
	prependChild(node: Node, child: Node): void;
	insertAfter(node: Node, sibling: Node): void;
	parent(node: Node): Node | undefined;
}

interface Plugin {
	name: string;
	before(root: Node, ctx: Context): void;
	element: { filter: string[]; visit(node: Element, ctx: Context): void };
	after(root: Node, ctx: Context): void;
}

const SECTION_WEIGHT = 10;

const hiddenText = (phrases: string[]): Element => ({
	type: 'element',
	tagName: 'div',
	properties: { hidden: true, 'data-pagefind-weight': String(SECTION_WEIGHT) },
	children: [{ type: 'text', value: phrases.join('. ') }]
});

const pageMeta = (phrases: string[]): Element => ({
	type: 'element',
	tagName: 'span',
	properties: { hidden: true, 'data-pagefind-meta': 'asks[data-asks]', 'data-asks': phrases.join('. ') },
	children: []
});

function asksPlugin(): Plugin {
	const sections = new Map<string, string[]>();

	return {
		name: 'luft-asks',
		before(root, ctx) {
			const asks = resolveAsks(ctx.data.astro?.frontmatter.asks ?? []);
			if (asks.length === 0) return;
			for (const { ask, to } of asks) {
				if (to) sections.set(to, [...(sections.get(to) ?? []), ask]);
			}
			ctx.prependChild(root, pageMeta(asks.map(({ ask }) => ask)));
		},
		element: {
			filter: ['h2', 'h3', 'h4'],
			visit(heading, ctx) {
				const id = heading.properties.id;
				if (typeof id !== 'string') return;
				const phrases = sections.get(id);
				if (!phrases) return;
				sections.delete(id);
				const wrapper = ctx.parent(heading);
				ctx.insertAfter(wrapper?.type === 'element' ? wrapper : heading, hiddenText(phrases));
			}
		},
		after(_root, ctx) {
			if (sections.size > 0) {
				throw new Error(`${ctx.fileURL?.pathname}: asks point at headings that don't exist: ${[...sections.keys()].join(', ')}`);
			}
		}
	};
}

export const asks = (): AstroIntegration => ({
	name: 'luft-asks',
	hooks: {
		'astro:config:setup': ({ config }) => {
			const processor = config.markdown.processor as { options: { hastPlugins: unknown[] } };
			processor.options.hastPlugins.push(asksPlugin);
		}
	}
});
