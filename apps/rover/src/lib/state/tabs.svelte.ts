import type { Tab, TabHistoryEntry, TabPlace, ViewMemory } from '$lib/types';

export class Tabs {
	list = $state<Tab[]>([]);
	activeId = $state('');

	active = $derived(this.list.find((tab) => tab.id === this.activeId) ?? null);
	current = $derived(this.active?.history[this.active.historyIndex] ?? null);
	canGoBack = $derived((this.active?.historyIndex ?? 0) > 0);
	canGoForward = $derived(Boolean(this.active && this.active.historyIndex < this.active.history.length - 1));

	open(entry: TabHistoryEntry) {
		const tab: Tab = { ...place(entry), id: crypto.randomUUID(), history: [entry], historyIndex: 0 };
		this.list.push(tab);
		this.activeId = tab.id;
		return tab;
	}

	close(id: string) {
		const index = this.list.findIndex((tab) => tab.id === id);
		if (index === -1 || this.list.length === 1) return;
		this.list.splice(index, 1);
		if (this.activeId === id) this.activeId = this.list[Math.min(index, this.list.length - 1)].id;
	}

	remember(memory: ViewMemory | null) {
		const entry = this.current;
		if (entry && memory) entry.memory = memory;
	}

	navigate(entry: TabHistoryEntry) {
		const tab = this.active;
		if (!tab || (tab.path === entry.path && tab.view === entry.view)) return;
		tab.history = [...tab.history.slice(0, tab.historyIndex + 1), entry];
		tab.historyIndex = tab.history.length - 1;
		Object.assign(tab, place(entry));
	}

	back() {
		return this.#step(-1);
	}

	forward() {
		return this.#step(1);
	}

	#step(offset: number) {
		const tab = this.active;
		const entry = tab?.history[tab.historyIndex + offset];
		if (!tab || !entry) return null;
		tab.historyIndex += offset;
		Object.assign(tab, place(entry));
		return entry;
	}
}

function place({ path, title, view }: TabHistoryEntry): TabPlace {
	return { path, title, view };
}
