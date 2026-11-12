import { commands, events } from '#lib/bindings.js';
import type { Cleanup, SpaceUpdate } from '#lib/bindings.js';
import { WAIT } from '#lib/bridge/index.js';
import { PART_NAMES } from '#lib/components/space/parts.js';

const same = (a: string[], b: string[]) => a.length === b.length && a.every((part, index) => part === b[index]);

class Space {
	root = $state<string | null>(null);
	luft = $state(false);
	name = $state('');
	path = $state.raw<string[]>([]);
	update = $state.raw<SpaceUpdate | null>(null);
	hovered = $state<string | null>(null);

	view = $derived(this.update?.view && same(this.update.view.path, this.path) ? this.update.view : null);
	title = $derived(this.path.length ? this.label(this.path.at(-1)!, this.path.length - 1) : this.name);

	label(name: string, depth: number) {
		return this.luft && depth === 0 && name === 'home' ? PART_NAMES.files : name;
	}

	listen() {
		events.spaceUpdate((update) => {
			if (update.scan === this.update?.scan && (!update.view || same(update.view.path, this.path))) this.update = update;
		});
	}

	open(root: string, name: string) {
		return this.#start(root, name, false, () => commands.spaceScan({ path: root }));
	}

	openLuft(sysroot: string, name: string) {
		return this.#start(sysroot, name, true, commands.spaceScanLuft);
	}

	async #start(root: string, name: string, luft: boolean, scan: () => Promise<SpaceUpdate>) {
		this.root = root;
		this.luft = luft;
		this.name = name;
		this.path = [];
		this.hovered = null;
		this.update = await scan();
	}

	#scan() {
		return this.luft ? commands.spaceScanLuft() : commands.spaceScan({ path: this.root! });
	}

	refresh() {
		if (!this.root) return;
		const path = this.path;
		void this.#scan().then((update) => {
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

	async clean(what: Cleanup) {
		await commands.spaceClean({ what }, WAIT);
		this.refresh();
	}

	async trash(path: string[]) {
		this.update = await commands.spaceTrash({ path });
	}
}

export const space = new Space();
