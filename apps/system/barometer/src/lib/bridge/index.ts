import { commands } from '#lib/bindings.js';
import { native } from './native';
import type { Backend } from './types';

export async function connect(): Promise<Backend> {
	if (!(await commands.sampleSystem())) return native;
	const { sample } = await import('./sample/index');
	return { ...native, ...sample };
}
