import { MM, type Paper } from '#lib/library/model.js';
import { CORNELL_HEADER, FIRST_RULE } from './templates';

/** Where typed text sits on a page: its line height, the first line's baseline and the type size. */
export interface TextLines {
	step: number;
	first: number;
	size: number;
	/** Where lines start on the left, for paper with a margin. */
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

/**
 * The lines typed text follows on a kind of paper: the rules of lined paper,
 * every grid line or every other one on squared and dotted paper, and an
 * unprinted grid like lined paper's on blank pages.
 */
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

/** Text placed freely, on a book page: the line height text boxes always had. */
export const FREE_LINES: TextLines = { step: 16 * 1.45, first: 0, size: 16, margin: 0 };

/** The baseline at or below `y`, the line a click there writes on. */
export function baselineAt(lines: TextLines, y: number) {
	if (lines === FREE_LINES) return y + lines.size * 0.35;
	return lines.first + Math.max(0, Math.ceil((y - lines.first) / lines.step - 0.25)) * lines.step;
}

/** The baseline nearest `y`, for writing whose letters sit around it. */
export function nearestBaseline(lines: TextLines, y: number) {
	if (lines === FREE_LINES) return y;
	return lines.first + Math.max(0, Math.round((y - lines.first) / lines.step)) * lines.step;
}

export const widthFrom = (x: number, pageWidth: number) => Math.max(80, pageWidth - x - RIGHT_MARGIN);

const baselines = new Map<string, { baseline: number; descent: number }>();

/**
 * How far below a line's top its baseline falls, and how far a letter's box
 * reaches below the baseline, measured once for each size in the text boxes'
 * own font.
 */
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
