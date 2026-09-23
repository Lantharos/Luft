export type SelectionBox = {
	pointerId: number;
	startX: number;
	startY: number;
	currentX: number;
	currentY: number;
	lastClientX: number;
	lastClientY: number;
};

export type SelectionRect = {
	left: number;
	top: number;
	right: number;
	bottom: number;
};

export function normalizeSelectionBox(box: SelectionBox) {
	const left = Math.min(box.startX, box.currentX);
	const top = Math.min(box.startY, box.currentY);
	const right = Math.max(box.startX, box.currentX);
	const bottom = Math.max(box.startY, box.currentY);
	return { left, top, right, bottom, width: right - left, height: bottom - top };
}

export function selectionBoxStyle(box: SelectionBox) {
	const rect = normalizeSelectionBox(box);
	return `left:${rect.left}px;top:${rect.top}px;width:${rect.width}px;height:${rect.height}px`;
}

export function contentPoint(paneElement: HTMLElement | undefined, clientX: number, clientY: number) {
	const rect = paneElement?.getBoundingClientRect();
	if (!paneElement || !rect) return { x: clientX, y: clientY };
	return {
		x: clientX - rect.left + paneElement.scrollLeft,
		y: clientY - rect.top + paneElement.scrollTop
	};
}

export function elementContentRect(paneElement: HTMLElement | undefined, element: HTMLElement): SelectionRect | null {
	const paneRect = paneElement?.getBoundingClientRect();
	if (!paneElement || !paneRect) return null;
	const rect = element.getBoundingClientRect();
	return {
		left: rect.left - paneRect.left + paneElement.scrollLeft,
		top: rect.top - paneRect.top + paneElement.scrollTop,
		right: rect.right - paneRect.left + paneElement.scrollLeft,
		bottom: rect.bottom - paneRect.top + paneElement.scrollTop
	};
}

export function rectsIntersect(a: SelectionRect, b: SelectionRect) {
	return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}
