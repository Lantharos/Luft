import { invoke } from '#lib/bridge.js';

export type Kind = 'empty' | 'character' | 'dead' | 'compose' | 'function';

export interface Symbol {
	keysym: string;
	text: string;
	kind: Kind;
}

export type Levels = [Symbol, Symbol, Symbol, Symbol];

export interface Pair {
	base: string;
	text: string;
	next?: string;
}

export interface DeadKey {
	keysym: string;
	name: string;
	symbol: string;
	spacing: string;
	pairs: Pair[];
}

export interface SystemTable {
	spacing: string;
	pairs: Pair[];
}

export type AltGr = 'ralt' | 'lalt' | 'alt' | 'rctrl' | 'menu' | 'rwin' | 'caps';
export type ComposeKey = 'none' | 'ralt' | 'rctrl' | 'menu' | 'rwin' | 'caps' | 'sclk' | 'prsc';
export type CapsLock = 'capslock' | 'shiftlock' | 'escape' | 'swapescape' | 'backspace' | 'ctrl' | 'none';

export interface Options {
	altgr: AltGr;
	compose: ComposeKey;
	caps: CapsLock;
}

export type Layout = {
	id: string;
	name: string;
	short: string;
	language: string;
	base: string | null;
	keys: Record<string, Levels>;
	dead: DeadKey[];
	options: Options;
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

export type ExportFormat = 'symbols' | 'keymap' | 'compose' | 'klc';

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
export const exportLayout = (id: string, format: ExportFormat) => invoke<boolean>('layout_export', { id, format });
export const describeKeysym = (keysym: string) => invoke<Symbol>('layout_describe', { keysym });
export const describeText = (text: string) => invoke<Symbol>('layout_describe', { text });
export const specials = () => invoke<Specials>('layout_specials');
export const freeKeysym = (id: string, taken: string[]) => invoke<string>('layout_free_keysym', { id, taken });
export const systemTable = (keysym: string) => invoke<SystemTable>('layout_system_table', { keysym });
export const tryLayout = (layout: Layout) => invoke<void>('layout_try', layout);
export const tryKey = (key: string, down: boolean) => invoke<string>('layout_try_key', { key, down });
