import type { Displays, LogicalConfig, Mode, Monitor } from './api';
import { inRow, isValidLayout, normalized, type Rect } from './layout';

export interface Output {
	connector: string;
	enabled: boolean;
	mode: string;
	x: number;
	y: number;
	scale: number;
	transform: number;
	primary: boolean;
}

export interface Draft {
	outputs: Output[];
	mirrored: boolean;
}

export interface Size {
	width: number;
	height: number;
}

export const ORIENTATIONS = [
	{ value: 0, label: 'Landscape' },
	{ value: 1, label: 'Portrait right' },
	{ value: 3, label: 'Portrait left' },
	{ value: 2, label: 'Landscape, flipped' }
];

const sizeKey = ({ width, height }: Size) => `${width}x${height}`;
const sameRefresh = (a: number, b: number) => Math.abs(a - b) < 0.01;
const byRefresh = (a: Mode, b: Mode) => b.refresh - a.refresh;

export const monitorOf = (state: Displays, connector: string) => state.monitors.find((monitor) => monitor.connector === connector)!;
export const modeOf = (state: Displays, output: Output) => monitorOf(state, output.connector).modes.find((mode) => mode.id === output.mode)!;
export const hertz = (refresh: number) => `${Number(refresh.toFixed(2))} Hz`;
export const percentScale = (scale: number) => `${Math.round(scale * 100)}%`;

export function draftFrom(state: Displays): Draft {
	const outputs = state.monitors.map((monitor) => {
		const logical = state.logical.find((entry) => entry.monitors.includes(monitor.connector));
		const mode = monitor.modes.find((entry) => entry.current) ?? monitor.modes.find((entry) => entry.preferred) ?? monitor.modes[0];
		return {
			connector: monitor.connector,
			enabled: Boolean(logical),
			mode: mode.id,
			x: logical?.x ?? 0,
			y: logical?.y ?? 0,
			scale: logical?.scale ?? mode.preferredScale,
			transform: logical?.transform ?? 0,
			primary: logical?.primary ?? false
		};
	});
	return { outputs, mirrored: state.logical.some((entry) => entry.monitors.length > 1) };
}

export function footprint(state: Displays, output: Output): Rect {
	const mode = modeOf(state, output);
	const turned = output.transform % 2 === 1;
	const divisor = state.logicalLayout ? output.scale : 1;
	return {
		id: output.connector,
		x: output.x,
		y: output.y,
		width: Math.round((turned ? mode.height : mode.width) / divisor),
		height: Math.round((turned ? mode.width : mode.height) / divisor)
	};
}

export function settle(state: Displays, draft: Draft) {
	const enabled = draft.outputs.filter((output) => output.enabled).sort((a, b) => a.x - b.x || a.y - b.y);
	if (!enabled.length) return;
	let rects = enabled.map((output) => footprint(state, output));
	if (!isValidLayout(rects)) rects = inRow(rects);
	normalized(rects).forEach((rect, index) => {
		enabled[index].x = rect.x;
		enabled[index].y = rect.y;
	});
}

export function reshape(state: Displays, draft: Draft, output: Output, change: (output: Output) => void) {
	const before = footprint(state, output);
	change(output);
	if (draft.mirrored || !output.enabled) return;
	const after = footprint(state, output);
	for (const other of draft.outputs) {
		if (other === output || !other.enabled) continue;
		if (other.x >= before.x + before.width) other.x += after.width - before.width;
		if (other.y >= before.y + before.height) other.y += after.height - before.height;
	}
	settle(state, draft);
}

export function setEnabled(state: Displays, draft: Draft, output: Output, enabled: boolean) {
	if (enabled) {
		const edge = draft.outputs
			.filter((other) => other.enabled)
			.map((other) => ({ ...footprint(state, other), scale: other.scale }))
			.reduce((right, rect) => (rect.x + rect.width > right.x + right.width ? rect : right));
		const scale = state.globalScale ? closest(modeOf(state, output).scales, edge.scale) : output.scale;
		Object.assign(output, { enabled: true, primary: false, x: edge.x + edge.width, y: edge.y, scale });
	} else {
		output.enabled = false;
		if (output.primary) {
			output.primary = false;
			draft.outputs.find((other) => other.enabled)!.primary = true;
		}
	}
	settle(state, draft);
}

export function setPrimary(draft: Draft, output: Output) {
	for (const other of draft.outputs) other.primary = other === output;
}

export function resolutions(modes: Mode[]) {
	const sizes = new Map(modes.map((mode) => [sizeKey(mode), { width: mode.width, height: mode.height }]));
	return [...sizes.values()]
		.sort((a, b) => b.width * b.height - a.width * a.height || b.width - a.width)
		.map((size) => ({ value: sizeKey(size), label: `${size.width} × ${size.height}`, size }));
}

export function refreshRates(monitor: Monitor, size: Size) {
	const rates: number[] = [];
	for (const mode of monitor.modes.filter((entry) => sizeKey(entry) === sizeKey(size)).sort(byRefresh)) {
		if (!rates.some((rate) => sameRefresh(rate, mode.refresh))) rates.push(mode.refresh);
	}
	return rates.map((rate) => ({ value: rate, label: hertz(rate) }));
}

export function pickMode(monitor: Monitor, size: Size, refresh: number, variable: boolean) {
	const sized = monitor.modes.filter((mode) => sizeKey(mode) === sizeKey(size));
	const timed = sized.filter((mode) => sameRefresh(mode.refresh, refresh));
	return timed.find((mode) => mode.variable === variable) ?? timed[0] ?? sized.sort(byRefresh)[0];
}

export function hasVariant(monitor: Monitor, mode: Mode) {
	return monitor.modes.some((other) => other !== mode && other.variable !== mode.variable && sizeKey(other) === sizeKey(mode) && sameRefresh(other.refresh, mode.refresh));
}

export function commonResolutions(state: Displays) {
	const [first, ...rest] = state.monitors;
	return resolutions(first?.modes ?? []).filter(({ value }) => rest.every((monitor) => monitor.modes.some((mode) => sizeKey(mode) === value)));
}

function closest(scales: number[], wanted: number) {
	return scales.reduce((best, scale) => (Math.abs(scale - wanted) < Math.abs(best - wanted) ? scale : best), scales[0] ?? 1);
}

export function mirror(state: Displays, draft: Draft, size: Size) {
	const lead = draft.outputs.find((output) => output.primary) ?? draft.outputs[0];
	const modes = draft.outputs.map((output) => {
		const monitor = monitorOf(state, output.connector);
		const current = modeOf(state, output);
		return pickMode(monitor, size, current.refresh, false);
	});
	const scales = modes[0].scales.filter((scale) => modes.every((mode) => mode.scales.includes(scale)));
	const scale = closest(scales, lead.scale);
	draft.outputs.forEach((output, index) => {
		Object.assign(output, { enabled: true, mode: modes[index].id, x: 0, y: 0, scale, transform: lead.transform, primary: output === lead });
	});
	draft.mirrored = true;
}

export function unmirror(state: Displays, draft: Draft) {
	draft.mirrored = false;
	settle(state, draft);
}

export function mirroredScales(state: Displays, draft: Draft) {
	const modes = draft.outputs.map((output) => modeOf(state, output));
	return modes[0].scales.filter((scale) => modes.every((mode) => mode.scales.includes(scale)));
}

export function setScale(state: Displays, draft: Draft, output: Output, scale: number) {
	const targets = draft.mirrored || state.globalScale ? draft.outputs.filter((other) => other.enabled) : [output];
	for (const target of targets) {
		const supported = modeOf(state, target).scales;
		reshape(state, draft, target, (changed) => (changed.scale = closest(supported, scale)));
	}
}

export function toLogical(draft: Draft): LogicalConfig[] {
	const enabled = draft.outputs.filter((output) => output.enabled);
	const lead = enabled.find((output) => output.primary) ?? enabled[0];
	const place = (output: Output) => ({ connector: output.connector, mode: output.mode });
	if (draft.mirrored) {
		return [{ x: 0, y: 0, scale: lead.scale, transform: lead.transform, primary: true, monitors: enabled.map(place) }];
	}
	return enabled.map((output) => ({
		x: output.x,
		y: output.y,
		scale: output.scale,
		transform: output.transform,
		primary: output === lead,
		monitors: [place(output)]
	}));
}
