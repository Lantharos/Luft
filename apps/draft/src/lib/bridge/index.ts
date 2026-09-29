import { isAvailable } from '@lantharos/sabine';
import type { Backend } from './types';

export async function connect(): Promise<Backend> {
	if (isAvailable()) return (await import('./native')).native;
	return (await import('./sample')).sample;
}
