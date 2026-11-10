const BLOCKS = new Set(['DIV', 'P', 'LI', 'H2', 'H3', 'BLOCKQUOTE']);

const SHORTCUTS: Record<string, () => void> = {
	'#': () => document.execCommand('formatBlock', false, 'h2'),
	'##': () => document.execCommand('formatBlock', false, 'h3'),
	'>': () => document.execCommand('formatBlock', false, 'blockquote'),
	'-': () => document.execCommand('insertUnorderedList'),
	'*': () => document.execCommand('insertUnorderedList'),
	'1.': () => document.execCommand('insertOrderedList'),
	'1)': () => document.execCommand('insertOrderedList')
};

function blockOf(node: Node, box: HTMLElement): HTMLElement {
	for (let at: Node | null = node; at && at !== box; at = at.parentNode) {
		if (at instanceof HTMLElement && BLOCKS.has(at.tagName)) return at;
	}
	return box;
}

export function blockShortcut(box: HTMLElement) {
	const selection = getSelection();
	if (!selection?.isCollapsed || !selection.anchorNode || !box.contains(selection.anchorNode)) return false;
	const block = blockOf(selection.anchorNode, box);
	const before = document.createRange();
	before.selectNodeContents(block);
	before.setEnd(selection.anchorNode, selection.anchorOffset);
	const apply = SHORTCUTS[before.toString()];
	if (!apply) return false;
	before.deleteContents();
	if (!block.textContent) block.replaceChildren(document.createElement('br'));
	before.setStart(block, 0);
	before.collapse(true);
	selection.removeAllRanges();
	selection.addRange(before);
	apply();
	return true;
}
