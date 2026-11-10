import { MM, type Paper } from '#lib/library/model.js';
import { CORNELL_HEADER, FIRST_RULE } from './templates';

export interface TextLines {
	step: number;
	first: number;
	size: number;
	margin: number;
}

const BLANK_STEP = 8 * MM;
const SHORTEST_LINE = 5.5 * MM;
const SIZE_SHARE = 0.53;
const SMALLEST = 9;
const LARGEST = 18;
const RIGHT_MARGIN = 10 * MM;
const LINED_MARGIN = 22 * MM;

const sizeFor = (step: number) => Math.round(Math.min(LARGEST, Math.max(SMALLEST, step * SIZE_SHARE)) * 2) / 2;

function lines(step: number, first: number, margin = 0): TextLines {
	return { step, first, size: sizeFor(step), margin };
}

export function textLines(paper: Paper, height: number): TextLines {
	const spacing = paper.spacing * MM;
	switch (paper.template) {
		case 'lined':
			return lines(spacing, FIRST_RULE, LINED_MARGIN);
		case 'cornell':
			return lines(spacing, CORNELL_HEADER + spacing);
		case 'grid':
		case 'dotted': {
			const step = spacing * Math.ceil(SHORTEST_LINE / spacing);
			const offset = paper.template === 'grid' ? (height % spacing) / 2 : spacing / 2;
			return lines(step, offset + step);
		}
		default:
			return lines(BLANK_STEP, FIRST_RULE);
	}
}

export const FREE_LINES: TextLines = { step: 16 * 1.45, first: 0, size: 16, margin: 0 };

export function baselineAt(lines: TextLines, y: number) {
	if (lines === FREE_LINES) return y + lines.size * 0.35;
	return lines.first + Math.max(0, Math.ceil((y - lines.first) / lines.step - 0.25)) * lines.step;
}

export function nearestBaseline(lines: TextLines, y: number) {
	if (lines === FREE_LINES) return y;
	return lines.first + Math.max(0, Math.round((y - lines.first) / lines.step)) * lines.step;
}

export const widthFrom = (x: number, pageWidth: number) => Math.max(80, pageWidth - x - RIGHT_MARGIN);

const baselines = new Map<string, { baseline: number; descent: number }>();

export function measure(size: number, step: number) {
	const key = `${size}/${step}`;
	let found = baselines.get(key);
	if (!found) {
		const probe = document.createElement('div');
		probe.className = 'text-box ruled';
		probe.style.cssText = `position: fixed; left: -10000px; top: 0; --size: ${size}px; --line: ${step}px; visibility: hidden;`;
		probe.innerHTML = '<span>x<span style="display: inline-block; width: 0; height: 0"></span></span>';
		document.body.append(probe);
		const letter = probe.firstElementChild as HTMLElement;
		const marker = letter.lastElementChild as HTMLElement;
		const top = probe.getBoundingClientRect().top;
		const mark = marker.getBoundingClientRect().top;
		found = { baseline: mark - top, descent: letter.getBoundingClientRect().bottom - mark };
		probe.remove();
		baselines.set(key, found);
	}
	return found;
}
