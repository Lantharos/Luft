import type { Entry, Group } from '#lib/bindings.js';
import type { Backend } from '#lib/bridge/types.js';

const FOCUS = 'barometer:';

export function focusOf(args: string[]) {
	return args.slice(1).find((argument) => argument.startsWith(FOCUS))?.slice(FOCUS.length) ?? null;
}

class EntryStore {
	list = $state.raw<Entry[]>([]);
	ready = $state(false);
	expanded = $state.raw<string[]>([]);
	collapsed = $state.raw<ReadonlySet<Group>>(new Set(['system']));
	query = $state('');
	focusing = $state<string | null>(null);

	searching = $derived(this.query.trim() !== '');

	start(backend: Backend) {
		backend.onEntries((list) => {
			this.list = list;
			this.ready = true;
		});
	}

	find(key: string) {
		return this.list.find((entry) => entry.key === key);
	}

	toggle(key: string) {
		this.expanded = this.expanded.includes(key) ? this.expanded.filter((other) => other !== key) : [...this.expanded, key];
	}

	toggleGroup(group: Group) {
		const next = new Set(this.collapsed);
		if (!next.delete(group)) next.add(group);
		this.collapsed = next;
	}

	reveal(group: Group) {
		if (!this.collapsed.has(group)) return;
		this.toggleGroup(group);
	}
}

export const entries = new EntryStore();
