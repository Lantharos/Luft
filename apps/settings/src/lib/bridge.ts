import { invoke, listen } from '@lantharos/sabine';
import type { Appearance } from '@luft/ui';

export { invoke, listen };

export interface AppState extends Appearance {
	page: string | null;
}

export interface Activation {
	arguments: string[];
}

export const appState = () => invoke<AppState>('app_state');
export const onActivated = (callback: (activation: Activation) => void) => listen<Activation>('singleInstance.activate', callback);
