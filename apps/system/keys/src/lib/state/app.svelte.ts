import { appWindow, events as sabineEvents } from '@lantharos/sabine';
import { appearance, keepWindowState } from '@luft/ui';
import { commands } from '#lib/bindings.js';
import type { Launch, LayoutEntry, Summary, Targets } from '#lib/bindings.js';
import { toast } from './toast.svelte';

const LINK_SCHEME = 'kestrel-keys:';
const ENGINE_PREFIX = 'keys:';

export type Selection = { kind: 'layout'; id: string } | { kind: 'method'; id: string } | { kind: 'view'; id: string };
export type Creating = { kind: 'layout'; from: string | null } | { kind: 'method' };

class AppStore {
	layouts = $state.raw<LayoutEntry[]>([]);
	methods = $state.raw<Summary[]>([]);
	sources = $state.raw<[string, string][]>([]);
	selection = $state<Selection | null>(null);
	creating = $state<Creating | null>(null);
	focused = $state(false);

	async start() {
		const [state, restored] = await Promise.all([commands.appState(), appWindow.restoredState<Selection>(), this.refresh()]);
		appearance.start(state);
		if (state.opened.length) await this.refresh();
		this.selection ??= (restored && this.exists(restored) ? restored : null) ?? this.first();
		keepWindowState(() => this.selection);
		this.launched(state);
		this.focused = this.selection?.kind === 'view';
		sabineEvents.singleInstance(async (activation) => void this.arrive(await commands.activationTargets(activation)));
		window.addEventListener('focus', () => void this.refreshSources());
	}

	async refresh() {
		[this.layouts, this.methods] = await Promise.all([commands.layoutsList(), commands.methodsList()]);
		await this.refreshSources();
	}

	async refreshSources() {
		this.sources = await commands.inputSources();
	}

	inSources(selection: Selection) {
		const [kind, id] = selection.kind === 'layout' ? ['xkb', selection.id] : ['ibus', `${ENGINE_PREFIX}${selection.id}`];
		return this.sources.some(([type, name]) => type === kind && name === id);
	}

	select(selection: Selection | null) {
		this.selection = selection;
		this.focused &&= selection?.kind === 'view';
	}

	exists({ kind, id }: Selection) {
		if (kind === 'layout') return this.layouts.some((layout) => layout.id === id);
		if (kind === 'method') return this.methods.some((method) => method.id === id);
		return true;
	}

	first(): Selection | null {
		if (this.layouts[0]) return { kind: 'layout', id: this.layouts[0].id };
		if (this.methods[0]) return { kind: 'method', id: this.methods[0].id };
		return null;
	}

	async removed() {
		await this.refresh();
		this.selection = this.first();
	}

	launched({ link, opened, failed }: Launch) {
		if (link) this.follow(link.slice(LINK_SCHEME.length));
		const last = opened.at(-1);
		if (last) this.select(last);
		for (const error of failed) toast.fail(error);
	}

	async arrive({ link, files }: Targets) {
		if (link) this.follow(link.slice(LINK_SCHEME.length));
		for (const file of files) await this.open(file);
	}

	follow(link: string) {
		const [path, query = ''] = link.split('?');
		const [kind, id] = path.split('/');
		if (kind !== 'layout' && kind !== 'method' && kind !== 'view') return;
		if (id === 'new' && kind !== 'view') {
			this.creating = kind === 'layout' ? { kind, from: new URLSearchParams(query).get('from') } : { kind };
		} else if (id) {
			this.select({ kind, id: decodeURIComponent(id) });
		}
	}

	async open(path: string) {
		try {
			const opened = await commands.openFile({ path });
			await this.refresh();
			this.select(opened);
		} catch (error) {
			toast.fail(error);
		}
	}
}

export const app = new AppStore();
