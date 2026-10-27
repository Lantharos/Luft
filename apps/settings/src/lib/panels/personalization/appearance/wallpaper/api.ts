import { activationToken } from '@luft/ui';
import { commands } from '#lib/bindings.js';
import type { Focus } from '#lib/bindings.js';

export const CENTER: Focus = [0.5, 0.5];

export const openFolder = async () => commands.appearanceOpenFolder({ token: await activationToken() });

export function uriToPath(uri: string) {
	return uri.startsWith('file://') ? decodeURIComponent(uri.slice('file://'.length)) : uri;
}

export function pathToUri(path: string) {
	return `file://${path.split('/').map(encodeURIComponent).join('/')}`;
}

export const objectPosition = ([x, y]: Focus) => `${x * 100}% ${y * 100}%`;
