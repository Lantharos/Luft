import { decode, FIELDS, type Process } from '$lib/backend/rows';
import type { AppInfo, Backend, Catalog, ProcessEntry } from '$lib/backend/types';

class ProcessStore {
	list = $state.raw<Process[]>([]);
	apps = $state.raw<Map<string, AppInfo>>(new Map());
	ready = $state(false);

	#entries = new Map<number, ProcessEntry>();

	start(backend: Backend) {
		backend.onCatalog((catalog) => this.#catalog(catalog));
		backend.onProcesses((rows) => this.#rows(rows));
	}

	#catalog({ reset, added, removed, apps }: Catalog) {
		if (reset) this.#entries.clear();
		for (const pid of removed) this.#entries.delete(pid);
		for (const entry of added) this.#entries.set(entry.pid, entry);
		if (apps.length || reset) {
			const next = reset ? new Map<string, AppInfo>() : new Map(this.apps);
			for (const app of apps) next.set(app.key, app);
			this.apps = next;
		}
		if (removed.length) this.list = this.list.filter((process) => this.#entries.has(process.pid));
	}

	#rows(rows: Float32Array) {
		const count = rows.length / FIELDS;
		const next: Process[] = [];
		for (let index = 0; index < count; index++) {
			const entry = this.#entries.get(rows[index * FIELDS]);
			if (!entry) continue;
			next.push({ ...entry, ...decode(rows, index) });
		}
		this.list = next;
		this.ready = true;
	}
}

export const processes = new ProcessStore();
