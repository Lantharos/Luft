type Handler = (event: KeyboardEvent) => boolean;

let viewKeys: Handler | null = null;

export function registerKeys(handler: Handler) {
	viewKeys = handler;
	return () => {
		if (viewKeys === handler) viewKeys = null;
	};
}

export function viewHandled(event: KeyboardEvent) {
	return viewKeys?.(event) ?? false;
}
