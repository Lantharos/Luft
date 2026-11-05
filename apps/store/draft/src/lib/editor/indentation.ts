import { indentUnit } from '@codemirror/language';
import { EditorState, type Extension } from '@codemirror/state';

export interface Indentation {
	tabs: boolean;
	width: number;
}

const SAMPLE_LINES = 4000;
const WIDTHS = [2, 4, 8, 3, 6];

export function indentationExtension({ tabs, width }: Indentation): Extension {
	return [EditorState.tabSize.of(width), indentUnit.of(tabs ? '\t' : ' '.repeat(width))];
}

export function describeIndentation({ tabs, width }: Indentation) {
	return tabs ? `Tabs: ${width}` : `Spaces: ${width}`;
}

function* leadingLines(text: string) {
	let start = 0;
	for (let count = 0; count < SAMPLE_LINES && start < text.length; count++) {
		const end = text.indexOf('\n', start);
		yield text.slice(start, end < 0 ? text.length : end);
		if (end < 0) return;
		start = end + 1;
	}
}

export function detectIndentation(text: string, fallback: Indentation): Indentation {
	let tabbed = 0;
	let spaced = 0;
	let previous = 0;
	const steps = new Map<number, number>();
	for (const content of leadingLines(text)) {
		if (!content.trim()) continue;
		if (content.charCodeAt(0) === 9) {
			tabbed++;
			continue;
		}
		let spaces = 0;
		while (content.charCodeAt(spaces) === 32) spaces++;
		if (spaces > 0) spaced++;
		const step = Math.abs(spaces - previous);
		if (step > 1) steps.set(step, (steps.get(step) ?? 0) + 1);
		previous = spaces;
	}
	if (tabbed + spaced === 0) return fallback;
	if (tabbed > spaced) return { tabs: true, width: fallback.width };
	const width = WIDTHS.reduce((best, width) => ((steps.get(width) ?? 0) > (steps.get(best) ?? 0) ? width : best), WIDTHS[0]);
	return { tabs: false, width: steps.size ? width : fallback.width };
}
