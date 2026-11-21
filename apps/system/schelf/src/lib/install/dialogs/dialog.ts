import { appWindow } from '@lantharos/sabine';
import { commands, type InstalledApp, type OpenedFile, type Permissions, type StoreDetails } from '#lib/bindings.js';
import type { Consent } from '#lib/files/install.svelte.js';
import type { Failed } from '#lib/state/opening.svelte.js';

/** A dialog an install window shows as a window of its own, over itself. */
export type InstallDialog =
	| { kind: 'details'; file: OpenedFile }
	| { kind: 'consent'; consent: Consent; file: OpenedFile }
	| { kind: 'store'; store: StoreDetails }
	| { kind: 'flathub'; name: string; permissions: Permissions }
	| { kind: 'remove'; app: InstalledApp }
	| { kind: 'openFailed'; failed: Failed };

const UNTIL_ANSWERED = 2 ** 31 - 1;

export async function openDialog(request: number, dialog: InstallDialog) {
	const parent = await appWindow.identifier();
	return commands.installDialogOpen({ request, parent, dialog }, { timeoutMs: UNTIL_ANSWERED });
}
