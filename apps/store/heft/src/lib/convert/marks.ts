/** Accents drawn as a stroke of their own. */
export type Mark = 'caron' | 'circumflex' | 'acute' | 'grave' | 'dash' | 'dot' | 'cedilla' | 'bar';

/** What a pen stroke over typed text means. */
export type Gesture = { kind: 'strike' } | { kind: 'insert' } | { kind: 'mark'; mark: Mark } | { kind: 'writing' };

/** A line of typed text: its baseline and type size, in page units. */
export interface TextLine {
	baseline: number;
	size: number;
}

const X_HEIGHT = 0.5;
const CAP_HEIGHT = 0.72;
const DOT = 0.2;
const MARK = 0.9;
const STRIKE = 1.2;
const FLAT = 0.35;
const BENT = 0.2;

interface Shape {
	left: number;
	top: number;
	width: number;
	height: number;
	cy: number;
	/** Straight, or bent like a V or a ^. */
	bend: 'straight' | 'v' | 'caret';
	/** For a straight stroke, how it leans: rising to the right, falling, or level. */
	lean: 'rising' | 'falling' | 'level';
}

function shape(points: [number, number][]): Shape {
	const xs = points.map(([x]) => x);
	const ys = points.map(([, y]) => y);
	const left = Math.min(...xs);
	const top = Math.min(...ys);
	const width = Math.max(...xs) - left;
	const height = Math.max(...ys) - top;
	const [x0, y0] = points[0];
	const [x1, y1] = points.at(-1)!;
	const chord = Math.hypot(x1 - x0, y1 - y0) || 1;
	let apex = points[0];
	let far = 0;
	for (const point of points) {
		const distance = Math.abs((x1 - x0) * (y0 - point[1]) - (x0 - point[0]) * (y1 - y0)) / chord;
		if (distance > far) [far, apex] = [distance, point];
	}
	const bend = far < BENT * Math.max(chord, width, height) ? 'straight' : apex[1] > (y0 + y1) / 2 ? 'v' : 'caret';
	const [dx, dy] = x1 >= x0 ? [x1 - x0, y1 - y0] : [x0 - x1, y0 - y1];
	const lean = Math.abs(dy) < FLAT * Math.abs(dx) ? 'level' : dy < 0 ? 'rising' : 'falling';
	return { left, top, width, height, cy: top + height / 2, bend, lean };
}

/**
 * Reads a stroke written over a line of typed text: a line through it
 * deletes, a tap or a caret under the line inserts, a small stroke above a
 * letter, through it or under it is an accent, and anything else is writing.
 */
export function gesture(points: [number, number][], line: TextLine): Gesture {
	const { baseline, size } = line;
	const stroke = shape(points);
	const biggest = Math.max(stroke.width, stroke.height);
	const above = stroke.cy < baseline - X_HEIGHT * size;
	if (stroke.width >= STRIKE * size && stroke.height < FLAT * stroke.width && stroke.cy > baseline - CAP_HEIGHT * size && stroke.cy < baseline) return { kind: 'strike' };
	if (biggest < DOT * size) return above ? { kind: 'mark', mark: 'dot' } : { kind: 'insert' };
	if (biggest > MARK * size) return { kind: 'writing' };
	if (stroke.cy > baseline + 0.05 * size) return stroke.bend === 'caret' ? { kind: 'insert' } : { kind: 'mark', mark: 'cedilla' };
	if (!above) return stroke.lean === 'level' && stroke.bend === 'straight' ? { kind: 'mark', mark: 'bar' } : stroke.bend === 'caret' ? { kind: 'insert' } : { kind: 'writing' };
	if (stroke.bend === 'v') return { kind: 'mark', mark: 'caron' };
	if (stroke.bend === 'caret') return { kind: 'mark', mark: 'circumflex' };
	return { kind: 'mark', mark: stroke.lean === 'level' ? 'dash' : stroke.lean === 'rising' ? 'acute' : 'grave' };
}
