import { activationToken } from '@luft/ui';
import { commands, type Failure, type InstalledApp } from '#lib/bindings.js';

export type Failed = { app: InstalledApp; failure: Failure | null; error: string | null };

class Opening {
	failed = $state<Failed | null>(null);

	async open(app: InstalledApp, desktop = app.desktop) {
		if (!desktop) return;
		try {
			const failure = await commands.libraryOpen({ desktop, token: await activationToken(), source: app.source });
			if (failure) this.failed = { app, failure, error: null };
		} catch (error) {
			this.failed = { app, failure: null, error: String(error) };
		}
	}

	dismiss() {
		this.failed = null;
	}
}

export const opening = new Opening();
