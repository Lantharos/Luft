import { commands, events } from '#lib/bindings.js';
import type { SpaceUpdate } from '#lib/bindings.js';

const same = (a: string[], b: string[]) => a.length === b.length && a.every((part, index) => part === b[index]);

class Space {
	root = $state<string | null>(null);
	name = $state('');
	path = $state.raw<string[]>([]);
	update = $state.raw<SpaceUpdate | null>(null);
	hovered = $state<string | null>(null);

	view = $derived(this.update?.view && same(this.update.view.path, this.path) ? this.update.view : null);
	title = $derived(this.path.at(-1) ?? this.name);

	listen() {
		events.spaceUpdate((update) => {
			if (update.scan === this.update?.scan && (!update.view || same(update.view.path, this.path))) this.update = update;
		});
	}

	async open(root: string, name: string) {
		this.root = root;
		this.name = name;
		this.path = [];
		this.hovered = null;
		this.update = await commands.spaceScan({ path: root });
	}

	refresh() {
		if (!this.root) return;
		const path = this.path;
		void commands.spaceScan({ path: this.root }).then((update) => {
			this.update = update;
			this.path = [];
			if (path.length) void this.go(path);
		});
	}

	async go(path: string[]) {
		this.path = path;
		this.hovered = null;
		this.update = await commands.spaceView({ path });
	}

	up() {
		if (this.path.length) void this.go(this.path.slice(0, -1));
		else this.close();
	}

	close() {
		if (!this.root) return;
		this.root = null;
		this.update = null;
		void commands.spaceStop();
	}

	async trash(path: string[]) {
		this.update = await commands.spaceTrash({ path });
	}
}

export const space = new Space();
