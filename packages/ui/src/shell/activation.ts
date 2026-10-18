import { invoke, isAvailable } from '@lantharos/sabine';

export const activationToken = (): Promise<string | null> =>
	isAvailable() ? invoke<string | null>('sabine.window.activationToken').catch(() => null) : Promise.resolve(null);
