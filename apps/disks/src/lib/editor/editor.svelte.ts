import * as api from '#lib/api.js';
import type { PlanStep } from '#lib/api.js';
import { errorText } from '#lib/format.js';
import { disks } from '#lib/state/disks.svelte.js';
import { describePlan } from './describe';
import { apply, layoutOf, type Layout, type Step } from './model';

export interface Progress {
	index: number;
	copied: number;
	total: number;
}

export interface Outcome {
	sentences: string[];
	done: number;
	error: string | null;
}

type Draft = { key: string; offset: number; size: number };

const sameKey = (a: Step, b: Step) => a.key === b.key;

function merge(last: Step, next: Step): Step | null {
	if (!sameKey(last, next)) return null;
	if (last.kind === 'create' && (next.kind === 'place' || next.kind === 'format' || next.kind === 'change')) {
		if (next.kind === 'place') return { ...last, offset: next.offset, size: next.size };
		if (next.kind === 'format') return { ...last, filesystem: next.filesystem, label: next.label };
		return { ...last, ...Object.fromEntries(Object.entries(next).filter(([field]) => field !== 'kind' && field !== 'key')) };
	}
	if (last.kind === 'place' && next.kind === 'place') return next;
	if (last.kind === 'format' && next.kind === 'format') return next;
	if (last.kind === 'change' && next.kind === 'change') return { ...last, ...next };
	return null;
}

function changesNothing(layout: Layout, step: Step) {
	const part = layout.parts.find((candidate) => candidate.key === step.key);
	if (!part) return false;
	if (step.kind === 'place') return step.offset === part.offset && step.size === part.size;
	if (step.kind !== 'change') return false;
	const flags = step.flags ?? part.flags;
	return (
		(step.type ?? part.type) === part.type &&
		(step.name ?? part.name) === part.name &&
		(step.label ?? part.label) === part.label &&
		flags.length === part.flags.length &&
		flags.every((bit) => part.flags.includes(bit))
	);
}

class Editor {
	driveId = $state<string | null>(null);
	steps = $state.raw<Step[]>([]);
	history = $state.raw<Step[][]>([]);
	selected = $state<string | null>(null);
	draft = $state.raw<Draft | null>(null);
	frozen = $state.raw<{ layout: Layout; sentences: string[] } | null>(null);
	progress = $state.raw<Progress | null>(null);
	outcome = $state.raw<Outcome | null>(null);

	#created = 0;

	drive = $derived(disks.drives.find((drive) => drive.id === this.driveId) ?? null);
	base = $derived(this.drive ? layoutOf(this.drive) : null);
	planned = $derived(this.base ? this.steps.reduce(apply, this.base) : null);
	layout = $derived(this.frozen?.layout ?? (this.planned && this.draft ? apply(this.planned, { kind: 'place', ...this.draft }) : this.planned));
	described = $derived(this.base ? describePlan(this.base, this.steps) : []);
	running = $derived(this.progress !== null);
	active = $derived(this.driveId !== null && this.driveId === disks.drive?.id);

	open(driveId: string, selected: string | null = null) {
		if (this.running) return;
		if (driveId === this.driveId) {
			this.selected = selected ?? this.selected;
			return;
		}
		this.driveId = driveId;
		this.steps = [];
		this.history = [];
		this.selected = selected;
		this.outcome = null;
	}

	close() {
		if (this.running) return;
		this.driveId = null;
		this.steps = [];
		this.history = [];
		this.draft = null;
		this.outcome = null;
	}

	newKey() {
		this.#created += 1;
		return `new:${this.#created}`;
	}

	push(step: Step) {
		this.history = [...this.history, this.steps];
		this.outcome = null;
		if (step.kind === 'delete' && step.key.startsWith('new:')) {
			this.steps = this.steps.filter((candidate) => candidate.key !== step.key);
			return;
		}
		const last = this.steps.at(-1);
		const merged = last && merge(last, step);
		const earlier = merged ? this.steps.slice(0, -1) : this.steps;
		const next = merged ?? step;
		const before = this.base ? earlier.reduce(apply, this.base) : null;
		this.steps = before && changesNothing(before, next) ? earlier : [...earlier, next];
	}

	undo() {
		const previous = this.history.at(-1);
		if (!previous || this.running) return;
		this.steps = previous;
		this.history = this.history.slice(0, -1);
		if (this.selected && !this.layout?.parts.some((part) => part.key === this.selected)) this.selected = null;
	}

	discard() {
		if (this.running) return;
		this.steps = [];
		this.history = [];
		this.selected = null;
	}

	async apply() {
		const drive = this.drive;
		const layout = this.planned;
		if (!drive || !layout || !this.steps.length || this.running) return;
		const steps = this.steps;
		const sentences = this.described.map((described) => described.sentence);
		const blocks = new Map(this.base?.parts.map((part) => [part.key, part.key]));
		this.frozen = { layout, sentences };
		this.outcome = null;
		let done = 0;
		let error: string | null = null;
		const stop = api.events.moved(({ copied, total }) => {
			if (this.progress) this.progress = { ...this.progress, copied, total };
		});
		try {
			for (const [index, step] of steps.entries()) {
				this.progress = { index, copied: 0, total: 0 };
				const result = await api.planStep(this.#request(step, blocks, drive.block));
				if (result) blocks.set(step.key, result);
				done += 1;
			}
		} catch (caught) {
			error = errorText(caught);
		} finally {
			stop();
		}
		this.progress = null;
		this.frozen = null;
		if (error === api.CANCELLED && done === 0) return;
		this.steps = [];
		this.history = [];
		this.selected = null;
		this.outcome = { sentences, done, error };
	}

	#request(step: Step, blocks: Map<string, string>, table: string): PlanStep {
		const block = blocks.get(step.key) ?? '';
		switch (step.kind) {
			case 'create':
				return {
					kind: 'create',
					table,
					offset: step.offset,
					size: step.size,
					partitionType: step.type,
					name: step.name,
					flags: step.flags,
					filesystem: step.filesystem,
					label: step.label
				};
			case 'delete':
				return { kind: 'delete', block };
			case 'place':
				return { kind: 'place', block, offset: step.offset, size: step.size };
			case 'format':
				return { kind: 'format', block, filesystem: step.filesystem, label: step.label };
			case 'change':
				return { kind: 'change', block, partitionType: step.type ?? null, name: step.name ?? null, flags: step.flags ?? null, label: step.label ?? null };
		}
	}
}

export const editor = new Editor();
