import { bytes } from '@luft/ui';
import { FILESYSTEM_NAMES } from '#lib/format.js';
import { typeName } from '#lib/partitions/types.js';
import { apply, type Layout, type Part, type Step } from './model';

export interface Described {
	sentence: string;
	loss: string | null;
	unmounts: boolean;
}

const quoted = (part: Part) => `“${part.title}”`;
const filesystemName = (filesystem: string) => (filesystem ? (FILESYSTEM_NAMES[filesystem] ?? filesystem) : '');

function amount(from: number, to: number) {
	return bytes(Math.abs(to - from));
}

function placement(part: Part, offset: number, size: number) {
	const sizing = size > part.size ? `grow it by ${amount(part.size, size)}` : size < part.size ? `shrink it by ${amount(part.size, size)}` : '';
	if (offset === part.offset) {
		const verb = size > part.size ? 'Grow' : 'Shrink';
		return `${verb} ${quoted(part)} by ${amount(part.size, size)}`;
	}
	const direction = offset < part.offset ? 'left' : 'right';
	const move = `Move ${quoted(part)} ${amount(part.offset, offset)} ${direction}`;
	return sizing ? `${move} and ${sizing}` : move;
}

function created(step: Extract<Step, { kind: 'create' }>) {
	const filesystem = filesystemName(step.filesystem);
	const what = filesystem ? `${bytes(step.size)} ${filesystem} partition` : `${bytes(step.size)} partition without a file system`;
	const named = step.label || step.name;
	return `Create a ${what}${named ? ` named “${named}”` : ''}`;
}

function changed(part: Part, step: Extract<Step, { kind: 'change' }>) {
	const parts: string[] = [];
	if (step.label !== undefined && step.label !== part.label) parts.push(step.label ? `rename it to “${step.label}”` : 'remove its name');
	if (step.name !== undefined && step.name !== part.name) parts.push(step.name ? `set its partition name to “${step.name}”` : 'clear its partition name');
	if (step.type !== undefined && step.type !== part.type) parts.push(`set its type to ${typeName(step.type)}`);
	if (step.flags !== undefined) parts.push('change its flags');
	const sentence = parts.join(', ');
	return `For ${quoted(part)}, ${sentence}`;
}

function describe(layout: Layout, step: Step): Described {
	const part = layout.parts.find((candidate) => candidate.key === step.key);
	if (step.kind === 'create' || !part) return { sentence: step.kind === 'create' ? created(step) : '', loss: null, unmounts: false };
	const kept = !part.pending && !part.replaced;
	const holds = kept;
	switch (step.kind) {
		case 'delete':
			return {
				sentence: `Delete ${quoted(part)} (${bytes(part.size)})`,
				loss: holds ? `Everything on ${quoted(part)} (${bytes(part.size)}) is erased.` : null,
				unmounts: part.mounted
			};
		case 'format':
			return {
				sentence: `Format ${quoted(part)} as ${filesystemName(step.filesystem)}${step.label ? ` named “${step.label}”` : ''}`,
				loss: holds ? `Everything on ${quoted(part)} (${bytes(part.size)}) is erased.` : null,
				unmounts: part.mounted
			};
		case 'place': {
			const moves = step.offset !== part.offset;
			return {
				sentence: placement(part, step.offset, step.size),
				loss: moves && holds ? `Moving ${quoted(part)} copies all of its ${bytes(Math.min(part.size, step.size))}. Keep the computer on and the drive connected until it’s done, or what’s on it can be lost.` : null,
				unmounts: part.mounted && !part.system
			};
		}
		case 'change':
			return { sentence: changed(part, step), loss: null, unmounts: false };
	}
}

export function describePlan(base: Layout, steps: Step[]) {
	let layout = base;
	return steps.map((step) => {
		const described = describe(layout, step);
		layout = apply(layout, step);
		return described;
	});
}
