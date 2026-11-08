import { MM, type Paper, type PaperColor, type Template } from '#lib/library/model.js';

export interface PaperLook {
	background: string;
	line: string;
	accent: string;
	dark: boolean;
}

export const LOOKS: Record<PaperColor, PaperLook> = {
	white: { background: '#ffffff', line: '#c6d1e2', accent: '#efb2ad', dark: false },
	cream: { background: '#f8f3e6', line: '#d9cfb8', accent: '#e8b4a2', dark: false },
	dark: { background: '#1d1e21', line: '#3b3e46', accent: '#6a4446', dark: true }
};

export const DEFAULT_SPACING: Record<Template, number> = {
	blank: 8,
	lined: 8,
	grid: 5,
	dotted: 5,
	cornell: 8,
	staff: 2
};

export interface Ruling {
	/** Thin rules as one SVG path, in page units. */
	lines: string;
	/** Emphasised rules: margins and the Cornell layout. */
	accents: string;
	dots: { spacing: number; offset: number } | null;
}

function horizontal(from: number, to: number, step: number, left: number, right: number): string {
	let path = '';
	for (let y = from; y <= to + 0.01; y += step) path += `M${left} ${y.toFixed(2)}H${right}`;
	return path;
}

function vertical(from: number, to: number, step: number, top: number, bottom: number): string {
	let path = '';
	for (let x = from; x <= to + 0.01; x += step) path += `M${x.toFixed(2)} ${top}V${bottom}`;
	return path;
}

export function ruling(paper: Paper, width: number, height: number): Ruling {
	const step = paper.spacing * MM;
	const top = 3 * 8 * MM;
	switch (paper.template) {
		case 'lined':
			return { lines: horizontal(top, height - step, step, 0, width), accents: `M${22 * MM} 0V${height}`, dots: null };
		case 'grid': {
			const offsetX = (width % step) / 2;
			const offsetY = (height % step) / 2;
			return { lines: horizontal(offsetY, height, step, 0, width) + vertical(offsetX, width, step, 0, height), accents: '', dots: null };
		}
		case 'dotted':
			return { lines: '', accents: '', dots: { spacing: step, offset: step / 2 } };
		case 'cornell': {
			const cue = 62 * MM;
			const summary = height - 52 * MM;
			const header = 26 * MM;
			return {
				lines: horizontal(header + step, summary - step / 2, step, 0, width),
				accents: `M0 ${header}H${width}M${cue} ${header}V${summary}M0 ${summary}H${width}`,
				dots: null
			};
		}
		case 'staff': {
			let lines = '';
			const staffGap = 13 * MM;
			const margin = 14 * MM;
			for (let y = 24 * MM; y + 4 * step <= height - margin; y += 4 * step + staffGap) lines += horizontal(y, y + 4 * step, step, margin, width - margin);
			return { lines, accents: '', dots: null };
		}
		default:
			return { lines: '', accents: '', dots: null };
	}
}
