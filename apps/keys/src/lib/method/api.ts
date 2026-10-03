import { invoke } from '#lib/bridge.js';

export interface Rule {
	keys: string;
	text: string;
	after?: string;
}

export interface Entry {
	keys: string;
	text: string;
}

export type Method = {
	id: string;
	name: string;
	label: string;
	language: string;
	candidates: number;
	learn: boolean;
	compose: string;
	rules: Rule[];
	words: Entry[];
	sequences: Entry[];
};

export interface Summary {
	id: string;
	name: string;
	label: string;
	language: string;
}

export interface Shown {
	handled: boolean;
	commit: string;
	preedit: string;
	candidates: string[];
	selected: number;
	first: number;
	total: number;
}

export const ENGINE_PREFIX = 'keys:';

export const listMethods = () => invoke<Summary[]>('methods_list');
export const openMethod = (id: string) => invoke<Method>('method_open', { id });
export const createMethod = (name: string) => invoke<Method>('method_create', { name });
export const saveMethod = (method: Method) => invoke<void>('method_save', method);
export const deleteMethod = (id: string) => invoke<void>('method_delete', { id });
export const useMethod = (id: string) => invoke<void>('method_use', { id });
export const importMethod = () => invoke<Method | null>('method_import');
export const exportMethod = (id: string) => invoke<boolean>('method_export', { id });
export const tryMethod = (method: Method) => invoke<void>('method_try', method);
export const tryMethodKey = (press: { keysym?: string; text?: string; before: string }) => invoke<Shown>('method_try_key', press);
export const tryMethodPick = (index: number) => invoke<Shown>('method_try_pick', { index });
