function place(range: Range) {
	const selection = getSelection()!;
	selection.removeAllRanges();
	selection.addRange(range);
}

export function caretAtEnd(element: HTMLElement) {
	const range = document.createRange();
	range.selectNodeContents(element);
	range.collapse(false);
	place(range);
}

export function pointAt(element: HTMLElement, count: number): [Node, number] {
	const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
	let left = count;
	let last: Text | null = null;
	for (let node = walker.nextNode() as Text | null; node; node = walker.nextNode() as Text | null) {
		if (left <= node.length) return [node, left];
		left -= node.length;
		last = node;
	}
	return last ? [last, last.length] : [element, element.childNodes.length];
}

export function offsetOf(element: HTMLElement, node: Node, offset: number) {
	const range = document.createRange();
	range.selectNodeContents(element);
	range.setEnd(node, offset);
	return range.toString().length;
}

export function caretAt(element: HTMLElement, at: [number, number] | number) {
	const range = document.createRange();
	if (typeof at === 'number') {
		range.setStart(...pointAt(element, at));
		return place(range);
	}
	element.style.pointerEvents = 'auto';
	const found = document.caretPositionFromPoint(at[0], at[1]);
	element.style.pointerEvents = '';
	if (!found || !element.contains(found.offsetNode)) return caretAtEnd(element);
	range.setStart(found.offsetNode, found.offset);
	place(range);
}

export function caretOffset(element: HTMLElement) {
	const selection = getSelection();
	if (!selection?.rangeCount || !element.contains(selection.anchorNode)) return null;
	return offsetOf(element, selection.anchorNode!, selection.anchorOffset);
}
