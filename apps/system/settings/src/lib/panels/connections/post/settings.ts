import type { Value } from '#lib/bindings.js';

export const POST_SCHEMA = 'com.lantharos.kestrel.post';
export const POST_KEYS = ['visibility', 'name', 'folder', 'devices', 'copy-text', 'copy-picture'] as const;

export type Visibility = 'no-one' | 'your-devices' | 'everyone';

export type PostSettings = {
	visibility: Visibility;
	name: string;
	folder: string;
	devices: [string, string][];
	'copy-text': boolean;
	'copy-picture': boolean;
} & Record<string, Value>;
