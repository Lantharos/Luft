import { cursorThemes, installCursor, onInstallProgress, type CursorTheme, type InstallState } from './api';

class Cursors {
	themes = $state<CursorTheme[] | null>(null);
	installs = $state<Record<number, InstallState>>({});
	private listening = false;

	async load() {
		this.themes = await cursorThemes();
	}

	async install(id: number, file: number) {
		if (!this.listening) {
			this.listening = true;
			onInstallProgress(({ id, ...progress }) => {
				this.installs[id] = progress;
				if (progress.state === 'installed') void this.load();
			});
		}
		this.installs[id] = { state: 'downloading', received: 0, total: null };
		await installCursor(id, file);
	}
}

export const cursors = new Cursors();
