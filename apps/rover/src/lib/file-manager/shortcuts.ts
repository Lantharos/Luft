export interface ShortcutHandlers {
	copy: () => void;
	cut: () => void;
	paste: () => void;
	selectAll: () => void;
	newTab: () => void;
	closeTab: () => void;
	hasActiveTab: () => boolean;
}

export function handleShortcut(event: KeyboardEvent, handlers: ShortcutHandlers) {
	if (event.key === 'c') {
		event.preventDefault();
		handlers.copy();
	}
	if (event.key === 'x') {
		event.preventDefault();
		handlers.cut();
	}
	if (event.key === 'v') {
		event.preventDefault();
		handlers.paste();
	}
	if (event.key === 'a') {
		event.preventDefault();
		handlers.selectAll();
	}
	if (event.key === 't') {
		event.preventDefault();
		handlers.newTab();
	}
	if (event.key === 'w' && handlers.hasActiveTab()) {
		event.preventDefault();
		handlers.closeTab();
	}
}

export function isTextInputTarget(target: EventTarget | null) {
	return target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;
}
