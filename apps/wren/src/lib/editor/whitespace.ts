import type { ChangeSpec } from '@codemirror/state';
import type { EditorView } from '@codemirror/view';

const TRAILING = /[ \t]+$/;

export function trimTrailingWhitespace(view: EditorView) {
	const changes: ChangeSpec[] = [];
	const { doc } = view.state;
	for (let number = 1; number <= doc.lines; number++) {
		const line = doc.line(number);
		const match = TRAILING.exec(line.text);
		if (match) changes.push({ from: line.from + match.index, to: line.to });
	}
	if (changes.length) view.dispatch({ changes, userEvent: 'delete.trim' });
	return true;
}
