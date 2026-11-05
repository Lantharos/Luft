import { commands, events } from '#lib/bindings.js';
import type { CursorTheme, InstallState } from '#lib/bindings.js';

class Cursors {
	themes = $state<CursorTheme[] | null>(null);
	installs = $state<Record<number, InstallState>>({});
	private listening = false;

	async load() {
		this.themes = await commands.appearanceCursorThemes();
	}

	async install(id: number, file: number) {
		if (!this.listening) {
			this.listening = true;
			events.appearanceCursorInstall(({ id, ...progress }) => {
				this.installs[id] = progress;
				if (progress.state === 'installed') void this.load();
			});
		}
		this.installs[id] = { state: 'downloading', received: 0, total: null };
		await commands.appearanceCursorInstall({ id, file });
	}
}

export const cursors = new Cursors();
