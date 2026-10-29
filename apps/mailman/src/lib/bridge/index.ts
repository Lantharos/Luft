import { app, invoke } from '@lantharos/sabine';
import { activationToken, fileUrlPath } from '@luft/ui';
import { commands } from '#lib/bindings.js';
import type { AccountConfig, NewSecret } from '#lib/bindings.js';

export const LONG = { timeoutMs: 10 * 60 * 1000 };
export const FOREVER = { timeoutMs: 24 * 60 * 60 * 1000 };

export type Launch = { kind: 'mailto'; url: string } | { kind: 'message'; path: string };
export type PartSource = { id: number } | { file: string };

function launch(url: string): Launch | null {
	if (url.toLowerCase().startsWith('mailto:')) return { kind: 'mailto', url };
	const path = fileUrlPath(url);
	return path === null ? null : { kind: 'message', path };
}

export const takeLaunches = async () => (await app.takeOpenUrls()).map(launch).filter((launch) => launch !== null);
export const addAccount = async (email: string, name: string, config: AccountConfig, secret: NewSecret) =>
	commands.addAccount({ email, name, config, secret, token: await activationToken() }, LONG);
export const signInAgain = async (id: number, secret: NewSecret) => commands.signInAgain({ id, secret, token: await activationToken() }, LONG);
export const openAttachment = async (source: PartSource, index: number) =>
	commands.openAttachment({ ...source, index, token: await activationToken() }, LONG);
export const openUri = async (uri: string) => commands.openUri({ uri, token: await activationToken() });
export const unsubscribe = async (id: number) => commands.unsubscribe({ id, token: await activationToken() }, LONG);
export const stashFile = (file: File, name = file.name) => invoke<string>('stash_file', { name }, { body: file });
