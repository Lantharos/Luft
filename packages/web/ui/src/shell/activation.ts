import { appWindow } from '@lantharos/sabine';

export const activationToken = (): Promise<string | null> => appWindow.activationToken().catch(() => null);
