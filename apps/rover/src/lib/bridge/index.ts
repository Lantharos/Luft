import { fileUrl } from '@lantharos/sabine';
import { activationToken } from '@luft/ui';
import { commands } from '#lib/bindings.js';

export const openWithDefault = async (path: string) => commands.openWithDefault({ path, token: await activationToken() });
export const openLink = async (uri: string) => commands.openLink({ uri, token: await activationToken() });
export const openWithApp = async (path: string, app: string) => commands.openWithApp({ path, app, token: await activationToken() });
export const manageDrive = async (mountPoint: string) => commands.manageDrive({ mountPoint, token: await activationToken() });
export const openInBrowser = async (path: string) =>
	commands.cloudOpenInBrowser({ path, token: await activationToken() }, { timeoutMs: 60_000 });
export const addCloudAccount = async () => commands.cloudAddAccount({ token: await activationToken() });
export const openTerminal = async (path: string) => commands.openTerminal({ path, token: await activationToken() });
export const exploreSpace = async (path: string) => commands.exploreSpace({ path, token: await activationToken() });

export const localFileSource = (path: string, modified: number | null) => `${fileUrl(path)}?v=${modified ?? 0}`;
