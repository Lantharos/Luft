import { invoke, listen } from '@lantharos/sabine';

export { invoke, listen };

export type Unlisten = () => void;

export interface Accent {
	color: string;
}

export interface AppState {
	translucent: boolean;
	accent: Accent | null;
	page: string | null;
}

export interface Activation {
	arguments: string[];
}

export const appState = () => invoke<AppState>('app_state');
export const onAccentChanged = (callback: (accent: Accent) => void) => listen<Accent>('kestrel.accent', callback);
export const onActivated = (callback: (activation: Activation) => void) => listen<Activation>('singleInstance.activate', callback);
