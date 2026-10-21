import { invoke } from '@lantharos/sabine';
import { native } from './native';
import type { Backend } from './types';

export async function connect(): Promise<Backend> {
	if (!(await invoke<boolean>('sample_system'))) return native;
	const { sample } = await import('./sample');
	return { ...native, ...sample };
}
