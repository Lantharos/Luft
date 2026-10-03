import type { Attached } from '#lib/api/index.js';
import type { Content } from './composer.svelte';
import { escapeHtml } from './html';

const BLOCKS = new Set(['P', 'DIV', 'LI', 'BLOCKQUOTE', 'H1', 'H2', 'H3', 'PRE', 'UL', 'OL', 'TR']);

const LINE_RULES: [RegExp, () => void][] = [
	[/^[-*]$/, () => document.execCommand('insertUnorderedList')],
	[/^1[.)]$/, () => document.execCommand('insertOrderedList')],
	[/^>$/, () => document.execCommand('formatBlock', false, 'blockquote')],
	[/^#$/, () => document.execCommand('formatBlock', false, 'h2')]
];

const INLINE_RULES: [RegExp, string, string][] = [
	[/\*\*([^*\n]+)\*\*$/, 'strong', 'bold'],
	[/(?:^|[^*])\*([^*\n]+)\*$/, 'em', 'italic'],
	[/(?:^|\s)_([^_\n]+)_$/, 'em', 'italic'],
	[/`([^`\n]+)`$/, 'code', '']
];

function caretText() {
	const selection = getSelection();
	if (!selection?.isCollapsed || !selection.anchorNode || selection.anchorNode.nodeType !== Node.TEXT_NODE) return null;
	const node = selection.anchorNode as Text;
	return { node, offset: selection.anchorOffset, before: node.data.slice(0, selection.anchorOffset).replace(/\u00a0/g, ' ') };
}

function select(node: Text, start: number, end: number) {
	const range = document.createRange();
	range.setStart(node, start);
	range.setEnd(node, end);
	const selection = getSelection()!;
	selection.removeAllRanges();
	selection.addRange(range);
}

function lineStart(editor: HTMLElement, node: Text) {
	let block: Node | null = node;
	while (block && block !== editor && !(block instanceof HTMLElement && BLOCKS.has(block.tagName))) block = block.parentNode;
	return block === editor || block === null ? editor : (block as HTMLElement);
}

export function applyShortcuts(editor: HTMLElement, event: InputEvent) {
	if (event.inputType !== 'insertText' || !event.data) return;
	const caret = caretText();
	if (!caret) return;
	if (event.data === ' ') {
		const block = lineStart(editor, caret.node);
		const marker = caret.before.slice(0, -1);
		const atLineStart = block.textContent?.replace(/\u00a0/g, ' ').trimStart().startsWith(marker + ' ') && caret.node === firstText(block);
		const rule = atLineStart ? LINE_RULES.find(([pattern]) => pattern.test(marker)) : null;
		if (rule) {
			select(caret.node, 0, caret.offset);
			document.execCommand('delete');
			rule[1]();
			return;
		}
		const link = /(?:^|\s)(https?:\/\/\S+|www\.\S+\.\S+) $/.exec(caret.before);
		if (link) {
			const url = link[1];
			const start = caret.offset - 1 - url.length;
			select(caret.node, start, caret.offset - 1);
			document.execCommand('createLink', false, url.startsWith('www.') ? `https://${url}` : url);
			getSelection()?.collapseToEnd();
		}
		return;
	}
	if (!'*_`'.includes(event.data)) return;
	for (const [pattern, tag, command] of INLINE_RULES) {
		const match = pattern.exec(caret.before);
		if (!match) continue;
		const whole = match[0].trimStart().replace(/^[^*_`]/, '');
		select(caret.node, caret.offset - whole.length, caret.offset);
		document.execCommand('insertHTML', false, `<${tag}>${escapeHtml(match[1])}</${tag}>`);
		if (command && document.queryCommandState(command)) document.execCommand(command);
		return;
	}
}

function firstText(block: Node): Node | null {
	const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
	return walker.nextNode();
}

export function toText(root: Node): string {
	let text = '';
	const walk = (node: Node, prefix: string) => {
		if (node.nodeType === Node.TEXT_NODE) {
			text += (node as Text).data.replace(/\n/g, ' ');
			return;
		}
		if (!(node instanceof HTMLElement)) return;
		const tag = node.tagName;
		if (tag === 'BR') {
			text += `\n${prefix}`;
			return;
		}
		if (tag === 'IMG') return;
		const block = BLOCKS.has(tag);
		const quote = tag === 'BLOCKQUOTE' ? `${prefix}> ` : prefix;
		if (block && text && !text.endsWith('\n')) text += '\n';
		if (block) text += quote;
		if (tag === 'LI') text += node.parentElement?.tagName === 'OL' ? `${[...node.parentElement.children].indexOf(node) + 1}. ` : '- ';
		node.childNodes.forEach((child) => walk(child, quote));
		if (tag === 'A') {
			const href = node.getAttribute('href') ?? '';
			if (href && href !== node.textContent && !href.startsWith('mailto:')) text += ` <${href}>`;
		}
		if (block && !text.endsWith('\n')) text += '\n';
	};
	walk(root, '');
	return text.replace(/\u00a0/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
}

export function extract(editor: HTMLElement): Content {
	const clone = editor.cloneNode(true) as HTMLElement;
	const inline: Attached[] = [];
	clone.querySelectorAll<HTMLImageElement>('img[data-path]').forEach((image, index) => {
		const cid = `inline-${index}@mailman`;
		inline.push({ path: image.dataset.path!, name: image.dataset.name ?? `image-${index}`, cid });
		image.src = `cid:${cid}`;
		image.removeAttribute('data-path');
		image.removeAttribute('data-name');
	});
	const withoutSignature = editor.cloneNode(true) as HTMLElement;
	withoutSignature.querySelectorAll('.signature').forEach((signature) => signature.remove());
	return {
		source: editor.innerHTML,
		html: clone.innerHTML,
		text: toText(editor),
		inline,
		empty: !withoutSignature.textContent?.trim() && !inline.length
	};
}
