import type { InputMethod, Layout } from './api';

export type SourceType = 'xkb' | 'ibus';

export interface Source {
	type: SourceType;
	id: string;
	name: string;
	link: string | null;
}

const KEYS_ENGINE = 'keys:';

export function fromLayout(layout: Layout): Source {
	return { type: 'xkb', id: layout.id, name: layout.name, link: layout.custom ? `kestrel-keys:layout/${encodeURIComponent(layout.id)}` : null };
}

export function fromMethod(method: InputMethod): Source {
	const own = method.id.startsWith(KEYS_ENGINE);
	return { type: 'ibus', id: method.id, name: method.name, link: own ? `kestrel-keys:method/${encodeURIComponent(method.id.slice(KEYS_ENGINE.length))}` : null };
}
