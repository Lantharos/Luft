import { i18n, t } from '@luft/i18n';
import { bytes } from '@luft/ui';
import { filesystemLabel } from '#lib/format.js';
import { typeName } from '#lib/partitions/types.js';
import { apply, type Layout, type Part, type Step } from './model';

export interface Described {
	sentence: string;
	loss: string | null;
	unmounts: boolean;
}

let listLocale = '';
let lists: Intl.ListFormat;

function list(items: string[]) {
	if (listLocale !== i18n.formats) {
		listLocale = i18n.formats;
		lists = new Intl.ListFormat(listLocale, { type: 'unit', style: 'short' });
	}
	return lists.format(items);
}

function amount(from: number, to: number) {
	return bytes(Math.abs(to - from));
}

function placement(part: Part, offset: number, size: number) {
	const name = part.title;
	if (part.system && offset < part.offset) {
		const rest = offset + size - (part.offset + part.size);
		const room = amount(part.offset, offset);
		return rest > 0 ? t('disks-plan-move-system-grow', { name, room, rest: bytes(rest) }) : t('disks-plan-move-system', { name, room });
	}
	const change = amount(part.size, size);
	if (offset === part.offset) return t(size > part.size ? 'disks-plan-grow' : 'disks-plan-shrink', { name, change });
	return t('disks-plan-move', {
		name,
		distance: amount(part.offset, offset),
		direction: offset < part.offset ? 'left' : 'right',
		sizing: size > part.size ? 'grow' : size < part.size ? 'shrink' : 'none',
		change
	});
}

function created(step: Extract<Step, { kind: 'create' }>) {
	const size = bytes(step.size);
	const named = step.label || step.name;
	if (!step.filesystem) return named ? t('disks-plan-create-empty-named', { size, name: named }) : t('disks-plan-create-empty', { size });
	const filesystem = filesystemLabel(step.filesystem);
	return named ? t('disks-plan-create-named', { size, filesystem, name: named }) : t('disks-plan-create', { size, filesystem });
}

function changed(part: Part, step: Extract<Step, { kind: 'change' }>) {
	const changes: string[] = [];
	if (step.label !== undefined && step.label !== part.label) changes.push(step.label ? t('disks-plan-change-label', { label: step.label }) : t('disks-plan-change-label-remove'));
	if (step.name !== undefined && step.name !== part.name) changes.push(step.name ? t('disks-plan-change-name', { name: step.name }) : t('disks-plan-change-name-clear'));
	if (step.type !== undefined && step.type !== part.type) changes.push(t('disks-plan-change-type', { type: typeName(step.type) ?? step.type }));
	if (step.flags !== undefined) changes.push(t('disks-plan-change-flags'));
	return t('disks-plan-change', { name: part.title, changes: list(changes) });
}

function erased(part: Part) {
	return t('disks-plan-loss-erased', { name: part.title, size: bytes(part.size) });
}

function describe(layout: Layout, step: Step): Described {
	const part = layout.parts.find((candidate) => candidate.key === step.key);
	if (step.kind === 'create' || !part) return { sentence: step.kind === 'create' ? created(step) : '', loss: null, unmounts: false };
	const holds = !part.pending && !part.replaced;
	switch (step.kind) {
		case 'delete':
			return {
				sentence: t('disks-plan-delete', { name: part.title, size: bytes(part.size) }),
				loss: holds ? erased(part) : null,
				unmounts: part.mounted
			};
		case 'format': {
			const filesystem = step.filesystem ? filesystemLabel(step.filesystem) : '';
			return {
				sentence: step.label ? t('disks-plan-format-named', { name: part.title, filesystem, label: step.label }) : t('disks-plan-format', { name: part.title, filesystem }),
				loss: holds ? erased(part) : null,
				unmounts: part.mounted
			};
		}
		case 'place': {
			const moves = step.offset !== part.offset && !part.system;
			return {
				sentence: placement(part, step.offset, step.size),
				loss: moves && holds ? t('disks-plan-loss-moving', { name: part.title, size: bytes(Math.min(part.size, step.size)) }) : null,
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
