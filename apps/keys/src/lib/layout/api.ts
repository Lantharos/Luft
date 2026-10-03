import { invoke } from '$lib/bridge';

export type Kind = 'empty' | 'character' | 'dead' | 'compose' | 'function';

export interface Symbol {
	keysym: string;
	text: string;
	kind: Kind;
}

export type Levels = [Symbol, Symbol, Symbol, Symbol];

export type Layout = {
	id: string;
	name: string;
	short: string;
	language: string;
	base: string | null;
	keys: Record<string, Levels>;
};

export type Viewed = Layout & { custom: boolean };

export interface Entry {
	id: string;
	name: string;
	short: string;
	language: string;
}

export interface Specials {
	dead: Symbol[];
	compose: Symbol;
}

export type Origin = { kind: 'system'; id: string } | { kind: 'user'; id: string };

export const EMPTY: Symbol = { keysym: '', text: '', kind: 'empty' };

export const listLayouts = () => invoke<Entry[]>('layouts_list');
export const systemLayouts = () => invoke<Entry[]>('layouts_system');
export const openLayout = (id: string) => invoke<Layout>('layout_open', { id });
export const viewLayout = (id: string) => invoke<Viewed>('layout_view', { id });
export const createLayout = (name: string, from: Origin) => invoke<Layout>('layout_create', { name, from });
export const saveLayout = (layout: Layout) => invoke<void>('layout_save', layout);
export const deleteLayout = (id: string) => invoke<void>('layout_delete', { id });
export const useLayout = (id: string) => invoke<void>('layout_use', { id });
export const importLayout = () => invoke<Layout | null>('layout_import');
export const exportLayout = (id: string, format: 'symbols' | 'keymap') => invoke<boolean>('layout_export', { id, format });
export const describeKeysym = (keysym: string) => invoke<Symbol>('layout_describe', { keysym });
export const describeText = (text: string) => invoke<Symbol>('layout_describe', { text });
export const specials = () => invoke<Specials>('layout_specials');
export const tryLayout = (layout: Layout) => invoke<void>('layout_try', layout);
export const tryKey = (key: string, down: boolean) => invoke<string>('layout_try_key', { key, down });
