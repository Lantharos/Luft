import { invoke, isAvailable } from '@lantharos/sabine';
import type { Backend } from './types';

export async function connect(): Promise<Backend> {
	if (!isAvailable()) return (await import('./sample')).sample;
	const { native } = await import('./native');
	if (!(await invoke<boolean>('sample_system'))) return native;
	const { sample } = await import('./sample');
	return { ...sample, appState: native.appState, saveSettings: native.saveSettings };
}
