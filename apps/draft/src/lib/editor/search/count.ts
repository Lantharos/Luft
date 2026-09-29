import type { SearchQuery } from '@codemirror/search';
import type { EditorState } from '@codemirror/state';

const BUDGET_MS = 24;

export interface MatchCount {
	total: number;
	current: number;
	complete: boolean;
}

export function countMatches(state: EditorState, query: SearchQuery): MatchCount {
	const deadline = performance.now() + BUDGET_MS;
	const { from, to } = state.selection.main;
	const cursor = query.getCursor(state);
	let total = 0;
	let current = 0;
	for (let step = cursor.next(); !step.done; step = cursor.next()) {
		total++;
		if (step.value.from === from && step.value.to === to) current = total;
		if ((total & 255) === 0 && performance.now() > deadline) return { total, current, complete: false };
	}
	return { total, current, complete: true };
}
