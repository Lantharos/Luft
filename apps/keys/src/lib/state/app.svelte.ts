import { appearance } from '@luft/ui';
import { appState, inputSources, onActivated, openFile, type Source } from '$lib/bridge';
import { listLayouts, type Entry } from '$lib/layout/api';
import { ENGINE_PREFIX, listMethods, type Summary } from '$lib/method/api';
import { toast } from './toast.svelte';

const LINK_SCHEME = 'kestrel-keys:';

export type Selection = { kind: 'layout'; id: string } | { kind: 'method'; id: string } | { kind: 'view'; id: string };
export type Creating = { kind: 'layout'; from: string | null } | { kind: 'method' };

class AppStore {
	layouts = $state.raw<Entry[]>([]);
	methods = $state.raw<Summary[]>([]);
	sources = $state.raw<Source[]>([]);
	selection = $state<Selection | null>(null);
	creating = $state<Creating | null>(null);
	focused = $state(false);

	async start() {
		const [state] = await Promise.all([appState(), this.refresh()]);
		appearance.start(state);
		this.selection ??= this.first();
		await this.arrive(state.link ? [state.link, ...state.files] : state.files);
		this.focused = this.selection?.kind === 'view';
		onActivated(({ arguments: args }) => void this.arrive(args.slice(1).filter((argument) => !argument.startsWith('-'))));
		window.addEventListener('focus', () => void this.refreshSources());
	}

	async refresh() {
		[this.layouts, this.methods] = await Promise.all([listLayouts(), listMethods()]);
		await this.refreshSources();
	}

	async refreshSources() {
		this.sources = await inputSources();
	}

	inSources(selection: Selection) {
		const [kind, id] = selection.kind === 'layout' ? ['xkb', selection.id] : ['ibus', `${ENGINE_PREFIX}${selection.id}`];
		return this.sources.some(([type, name]) => type === kind && name === id);
	}

	select(selection: Selection | null) {
		this.selection = selection;
		this.focused &&= selection?.kind === 'view';
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

	async arrive(targets: string[]) {
		for (const target of targets) {
			if (target.startsWith(LINK_SCHEME)) this.follow(target.slice(LINK_SCHEME.length));
			else await this.open(target);
		}
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
			const opened = await openFile(path);
			await this.refresh();
			this.select(opened);
		} catch (error) {
			toast.failed(error);
		}
	}
}

export const app = new AppStore();
