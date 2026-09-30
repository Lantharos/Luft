import type { Process } from '$lib/backend/rows';

export function matches(process: Process, query: string, appName?: string) {
	const needle = query.trim().toLowerCase();
	if (!needle) return true;
	return (
		process.name.toLowerCase().includes(needle) ||
		process.command.toLowerCase().includes(needle) ||
		process.user.toLowerCase().includes(needle) ||
		String(process.pid) === needle ||
		(appName?.toLowerCase().includes(needle) ?? false)
	);
}
