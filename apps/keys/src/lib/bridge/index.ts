import { invoke, listen } from '@lantharos/sabine';
import type { Appearance } from '@luft/ui';

export { invoke };

export interface Targets {
	link: string | null;
	files: string[];
}

export interface AppState extends Appearance, Targets {}

export interface Activation {
	arguments: string[];
	workingDirectory: string | null;
}

export type Opened = { kind: 'layout'; id: string } | { kind: 'method'; id: string };

export type Source = [string, string];

export const appState = () => invoke<AppState>('app_state');
export const activationTargets = (activation: Activation) => invoke<Targets>('activation_targets', { ...activation });
export const openFile = (path: string) => invoke<Opened>('open_file', { path });
export const inputSources = () => invoke<Source[]>('input_sources');
export const onActivated = (callback: (activation: Activation) => void) => listen<Activation>('singleInstance.activate', callback);
