import type { Backend } from '#lib/bridge/types.js';

let current: Backend | null = null;

export function setBackend(backend: Backend) {
	current = backend;
}

export function backend(): Backend {
	if (!current) throw new Error('The backend is not connected yet');
	return current;
}
