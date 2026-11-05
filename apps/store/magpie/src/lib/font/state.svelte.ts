import { errorText } from '@luft/ui';
import { commands } from '#lib/bindings.js';
import type { FontFace, FontFile, FontInstance, FontStatus, Role } from '#lib/bindings.js';
import { chrome } from '#lib/app/chrome.svelte.js';
import { loadFont } from './faces';

export type Tab = 'preview' | 'characters' | 'details';

class FontState {
	path = $state<string | null>(null);
	file = $state.raw<FontFile | null>(null);
	faceIndex = $state(0);
	status = $state<FontStatus | null>(null);
	family = $state<string | null>(null);
	coordinates = $state<Record<string, number>>({});
	problem = $state<string | null>(null);
	busy = $state(false);
	tab = $state<Tab>('preview');

	face = $derived<FontFace | null>(this.file?.faces[this.faceIndex] ?? null);
	variation = $derived(
		Object.entries(this.coordinates)
			.map(([tag, value]) => `'${tag}' ${value}`)
			.join(', ') || 'normal'
	);

	async open(path: string) {
		this.path = path;
		this.file = null;
		this.status = null;
		this.family = null;
		this.problem = null;
		try {
			const [file, status] = await Promise.all([commands.fontInfo({ path }), commands.fontStatus({ path })]);
			if (this.path !== path) return;
			this.file = file;
			this.status = status;
			await this.selectFace(0);
		} catch (reason) {
			if (this.path === path) this.problem = errorText(reason);
		}
	}

	async selectFace(index: number) {
		const path = this.path!;
		const face = this.file!.faces[index];
		this.faceIndex = index;
		this.coordinates = Object.fromEntries(face.axes.map((axis) => [axis.tag, axis.default]));
		const family = await loadFont(await commands.fontSource({ path, index: face.index }));
		if (this.path === path && this.faceIndex === index) this.family = family;
	}

	applyInstance(instance: FontInstance) {
		this.coordinates = Object.fromEntries(instance.coordinates);
	}

	async install() {
		await this.#change((path) => commands.fontInstall({ path }), (family) => `${family} is installed`);
	}

	async use(role: Role) {
		await this.#change(
			(path) => commands.fontUse({ path, role }),
			(family) => (role === 'interface' ? `${family} is now the system font` : `${family} is now the monospace font`)
		);
	}

	async remove() {
		await this.#change((path) => commands.fontRemove({ path }), (family) => `${family} was moved to the trash`);
	}

	async #change(action: (path: string) => Promise<FontStatus>, done: (family: string) => string) {
		const path = this.path;
		if (!path || this.busy) return;
		this.busy = true;
		try {
			const status = await action(path);
			if (this.path === path) this.status = status;
			chrome.notify(done(this.face?.family ?? 'The font'));
		} catch (reason) {
			chrome.notify(errorText(reason));
		} finally {
			this.busy = false;
		}
	}
}

export const fontState = new FontState();
