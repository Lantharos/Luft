const ALIASES: Record<string, string> = { '+': '=', ' ': 'Space', Esc: 'Escape' };

export function combo(event: KeyboardEvent) {
	const key = ALIASES[event.key] ?? (event.key.length === 1 ? event.key.toUpperCase() : event.key);
	return [event.ctrlKey && 'Ctrl', event.altKey && 'Alt', event.shiftKey && 'Shift', key].filter(Boolean).join('+');
}

export function tabNumber(event: KeyboardEvent) {
	if (!event.altKey || event.ctrlKey || event.shiftKey) return null;
	const digit = Number.parseInt(event.key, 10);
	return digit >= 1 && digit <= 9 ? digit : null;
}
