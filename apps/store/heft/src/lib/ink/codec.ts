import { POINT_FIELDS, strokeBounds, type Nib, type Stroke, type Tool } from './stroke';

const STROKE_HEADER = 40;
const POINT_BYTES = 14;
const TOOLS: Tool[] = ['pen', 'highlighter'];
const NIBS: Nib[] = ['fountain', 'ballpoint'];

export const strokeSize = (stroke: Stroke) => STROKE_HEADER + (stroke.points.length / POINT_FIELDS) * POINT_BYTES;

export function writeStroke(view: DataView, offset: number, stroke: Stroke): number {
	const points = stroke.points;
	const count = points.length / POINT_FIELDS;
	view.setFloat64(offset, Number.parseInt(stroke.id, 36), true);
	view.setFloat64(offset + 8, stroke.order, true);
	view.setUint8(offset + 16, TOOLS.indexOf(stroke.tool));
	view.setUint8(offset + 17, NIBS.indexOf(stroke.nib));
	view.setUint16(offset + 18, 0, true);
	view.setUint32(offset + 20, stroke.color, true);
	view.setFloat32(offset + 24, stroke.width, true);
	view.setUint32(offset + 28, count, true);
	view.setFloat64(offset + 32, stroke.started, true);
	let at = offset + STROKE_HEADER;
	for (let index = 0; index < points.length; index += POINT_FIELDS) {
		view.setFloat32(at, points[index], true);
		view.setFloat32(at + 4, points[index + 1], true);
		view.setUint16(at + 8, Math.min(65535, Math.round(points[index + 2] * 100)), true);
		view.setUint16(at + 10, Math.round(points[index + 3] * 65535), true);
		view.setUint16(at + 12, Math.min(65535, Math.round(points[index + 4])), true);
		at += POINT_BYTES;
	}
	return at;
}

export function readStroke(view: DataView, offset: number): [Stroke, number] {
	const count = view.getUint32(offset + 28, true);
	const points = new Float32Array(count * POINT_FIELDS);
	let at = offset + STROKE_HEADER;
	for (let index = 0; index < points.length; index += POINT_FIELDS) {
		points[index] = view.getFloat32(at, true);
		points[index + 1] = view.getFloat32(at + 4, true);
		points[index + 2] = view.getUint16(at + 8, true) / 100;
		points[index + 3] = view.getUint16(at + 10, true) / 65535;
		points[index + 4] = view.getUint16(at + 12, true);
		at += POINT_BYTES;
	}
	const stroke: Stroke = {
		id: view.getFloat64(offset, true).toString(36),
		order: view.getFloat64(offset + 8, true),
		tool: TOOLS[view.getUint8(offset + 16)] ?? 'pen',
		nib: NIBS[view.getUint8(offset + 17)] ?? 'fountain',
		color: view.getUint32(offset + 20, true),
		width: view.getFloat32(offset + 24, true),
		started: view.getFloat64(offset + 32, true),
		points,
		bounds: strokeBounds(points)
	};
	return [stroke, at];
}

const CRC_TABLE = (() => {
	const table = new Uint32Array(256);
	for (let index = 0; index < 256; index++) {
		let value = index;
		for (let bit = 0; bit < 8; bit++) value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
		table[index] = value >>> 0;
	}
	return table;
})();

export function crc32(bytes: Uint8Array): number {
	let crc = 0xffffffff;
	for (let index = 0; index < bytes.length; index++) crc = CRC_TABLE[(crc ^ bytes[index]) & 255] ^ (crc >>> 8);
	return (crc ^ 0xffffffff) >>> 0;
}
