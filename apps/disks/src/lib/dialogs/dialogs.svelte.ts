import type { ChosenImage, Drive, Volume } from '$lib/api';

export type OpenDialog =
	| { kind: 'format-volume'; drive: Drive; volume: Volume }
	| { kind: 'format-drive'; drive: Drive }
	| { kind: 'create'; drive: Drive; offset: number; size: number }
	| { kind: 'delete'; drive: Drive; volume: Volume }
	| { kind: 'resize'; volume: Volume; room: number }
	| { kind: 'label'; volume: Volume }
	| { kind: 'unlock'; volume: Volume }
	| { kind: 'passphrase'; volume: Volume }
	| { kind: 'startup'; volume: Volume }
	| { kind: 'restore'; drive: Drive; block: string; target: string; image: ChosenImage }
	| { kind: 'save-image'; block: string; name: string }
	| { kind: 'write-image'; image: ChosenImage }
	| { kind: 'details'; drive: Drive; volume: Volume }
	| { kind: 'drive'; drive: Drive }
	| { kind: 'health'; drive: Drive }
	| { kind: 'trash'; path: string[]; name: string; size: number; folder: boolean };

class Dialogs {
	current = $state.raw<OpenDialog | null>(null);

	open = (dialog: OpenDialog) => {
		this.current = dialog;
	};

	close = () => {
		this.current = null;
	};
}

export const dialogs = new Dialogs();
