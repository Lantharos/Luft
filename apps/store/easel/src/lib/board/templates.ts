import { t } from '@luft/i18n';
import { INK } from './render/look';
import { NOTE_COLORS, NOTE_SIZE, objectId, type Arrow, type BoardObject, type Frame, type Note, type Shape, type ShapeKind } from './model';

export type Template = 'blank' | 'grid' | 'kanban' | 'flowchart';

export const TEMPLATES: Template[] = ['blank', 'grid', 'kanban', 'flowchart'];

const GRID = { columns: 3, rows: 2, w: 480, h: 320, gap: 80 };
const LANES = { w: 360, h: 640, gap: 48, inset: 24 };

const frame = (x: number, y: number, w: number, h: number, text: string): Frame => ({ id: objectId(), kind: 'frame', x, y, w, h, text });

const shape = (kind: ShapeKind, x: number, y: number, w: number, h: number, text: string): Shape => ({ id: objectId(), kind: 'shape', shape: kind, x, y, w, h, color: INK, fill: null, text });

const note = (x: number, y: number, color: string): Note => ({ id: objectId(), kind: 'note', x, y, w: NOTE_SIZE, h: NOTE_SIZE, color, text: '' });

const link = (from: Shape, to: Shape): Arrow => ({
	id: objectId(),
	kind: 'arrow',
	from: { x: from.x + from.w / 2, y: from.y + from.h / 2, attach: from.id },
	to: { x: to.x + to.w / 2, y: to.y + to.h / 2, attach: to.id },
	route: 'elbow',
	color: INK,
	width: 2.5,
	head: true
});

function grid(): BoardObject[] {
	const frames: BoardObject[] = [];
	for (let row = 0; row < GRID.rows; row++) {
		for (let column = 0; column < GRID.columns; column++) {
			const number = row * GRID.columns + column + 1;
			frames.push(frame(column * (GRID.w + GRID.gap), row * (GRID.h + GRID.gap), GRID.w, GRID.h, t('easel-frame-name', { number })));
		}
	}
	return frames;
}

function kanban(): BoardObject[] {
	const lanes = [t('easel-template-to-do'), t('easel-template-doing'), t('easel-template-done')];
	const frames = lanes.map((name, index) => frame(index * (LANES.w + LANES.gap), 0, LANES.w, LANES.h, name));
	const notes = frames.map((lane, index) => note(lane.x + LANES.inset, lane.y + LANES.inset, NOTE_COLORS[index]));
	return [...frames, ...notes];
}

function flowchart(): BoardObject[] {
	const start = shape('ellipse', -80, 0, 160, 72, t('easel-template-start'));
	const step = shape('rectangle', -90, 152, 180, 88, t('easel-template-step'));
	const decision = shape('diamond', -100, 320, 200, 120, t('easel-template-decision'));
	const other = shape('rectangle', 220, 336, 180, 88, t('easel-template-step'));
	const end = shape('ellipse', -80, 520, 160, 72, t('easel-template-end'));
	return [start, step, decision, other, end, link(start, step), link(step, decision), link(decision, other), link(decision, end)];
}

export function templateObjects(template: Template): BoardObject[] {
	if (template === 'grid') return grid();
	if (template === 'kanban') return kanban();
	if (template === 'flowchart') return flowchart();
	return [];
}
