import type { Entry, Group } from '#lib/bindings.js';
import type { Process } from '#lib/bridge/rows.js';
import type { Row } from '../columns';

export type Kind = 'group' | 'entry' | 'window' | 'process';

const BLANK: Row = {
	name: '',
	cpu: 0,
	memory: 0,
	read: 0,
	write: 0,
	gpu: 0,
	vram: 0,
	encoder: 0,
	decoder: 0,
	nice: 0,
	state: '',
	threads: 0,
	userTime: 0,
	systemTime: 0,
	readTotal: 0,
	writeTotal: 0
};

export class Node {
	title = $state('');
	icon = $state<string | null>(null);
	app = $state<string | null>(null);
	row = $state.raw<Row>(BLANK);
	count = $state(0);
	note = $state<string | undefined>();
	working = $state(false);
	expanded = $state<boolean | undefined>();
	child = $state(false);
	parent: Node | null = null;
	group: Group | null = null;
	entry = $state.raw<Entry | null>(null);
	process = $state.raw<Process | null>(null);

	constructor(
		readonly key: string,
		readonly kind: Kind
	) {}
}
