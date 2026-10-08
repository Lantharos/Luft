export interface MenuEntry {
	label: string;
	run: () => void;
	danger?: boolean;
}

export interface OpenMenu {
	at: { x: number; y: number };
	groups: MenuEntry[][];
}

export class Menus {
	current = $state.raw<OpenMenu | null>(null);

	open(event: MouseEvent, groups: MenuEntry[][]) {
		event.preventDefault();
		this.current = { at: { x: event.clientX, y: event.clientY }, groups: groups.filter((group) => group.length) };
	}

	close() {
		this.current = null;
	}
}
