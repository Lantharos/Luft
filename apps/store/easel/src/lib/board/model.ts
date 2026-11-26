export type ShapeKind = 'rectangle' | 'ellipse' | 'diamond';

interface Base {
	id: string;
	group?: string;
}

export interface Stroke extends Base {
	kind: 'stroke';
	tool: 'pen' | 'highlighter';
	color: string;
	width: number;
	points: number[];
}

export interface Shape extends Base {
	kind: 'shape';
	shape: ShapeKind;
	x: number;
	y: number;
	w: number;
	h: number;
	color: string;
	fill: string | null;
	text: string;
}

export interface End {
	x: number;
	y: number;
	attach?: string;
}

export type Route = 'straight' | 'elbow';

export interface Arrow extends Base {
	kind: 'arrow';
	from: End;
	to: End;
	route: Route;
	color: string;
	width: number;
	head: boolean;
}

export interface Text extends Base {
	kind: 'text';
	x: number;
	y: number;
	text: string;
	size: number;
	color: string;
}

export interface Note extends Base {
	kind: 'note';
	x: number;
	y: number;
	w: number;
	h: number;
	color: string;
	text: string;
}

export interface Picture extends Base {
	kind: 'picture';
	x: number;
	y: number;
	w: number;
	h: number;
	asset: string;
}

export interface Frame extends Base {
	kind: 'frame';
	x: number;
	y: number;
	w: number;
	h: number;
	text: string;
}

export type BoardObject = Stroke | Shape | Arrow | Text | Note | Picture | Frame;
export type Boxed = Shape | Note | Picture;

export interface Box {
	x: number;
	y: number;
	w: number;
	h: number;
}

export const PEN_COLORS = ['#e9e4da', '#e8a25a', '#7fb8e6', '#8fcf8f', '#e97b8a'];
export const NOTE_COLORS = ['#f3d88a', '#f1b9a5', '#b8dcb2', '#b9d3f0', '#d9c3ef'];
export const TEXT_SIZE = 22;
export const LABEL_SIZE = 16;
export const NOTE_TEXT_SIZE = 15;
export const NOTE_PADDING = 14;
export const NOTE_SIZE = 180;
export const FRAME_TITLE_SIZE = 14;
export const FRAME_TITLE_GAP = 8;

let counter = 0;
export const objectId = () => `${Date.now().toString(36)}${(counter++).toString(36)}`;

export function isBoxed(object: BoardObject): object is Boxed {
	return object.kind === 'shape' || object.kind === 'note' || object.kind === 'picture';
}
