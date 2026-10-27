import { fileUrl } from '@lantharos/sabine';
import { activationToken } from '@luft/ui';
import { commands } from '#lib/bindings.js';

export const openWith = async (path: string, app: string) => commands.openWith({ path, app, token: await activationToken() });
export const openUri = async (uri: string) => commands.openUri({ uri, token: await activationToken() });
export const showInFolder = async (path: string) => commands.showInFolder({ path, token: await activationToken() });

export function fileSource(path: string, version: number = 0) {
	return `${fileUrl(path)}?v=${version}`;
}
