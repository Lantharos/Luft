import { appWindow, isAvailable } from '@lantharos/sabine';

export const activationToken = (): Promise<string | null> =>
	isAvailable() ? appWindow.activationToken().catch(() => null) : Promise.resolve(null);
