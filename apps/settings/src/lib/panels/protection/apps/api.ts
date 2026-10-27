import type { App } from '#lib/bindings.js';

export function matches(app: App, query: string) {
	return app.name.toLowerCase().includes(query.trim().toLowerCase());
}
