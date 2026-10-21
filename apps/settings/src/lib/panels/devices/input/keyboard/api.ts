import { activationToken } from '@luft/ui';
import { invoke } from '#lib/bridge.js';

export interface Layout {
	id: string;
	name: string;
	custom: boolean;
}

export interface InputMethod {
	id: string;
	name: string;
	language: string;
}

export const layouts = () => invoke<Layout[]>('keyboard_layouts');
export const inputMethods = () => invoke<InputMethod[]>('keyboard_input_methods');
export const keysInstalled = () => invoke<boolean>('keyboard_keys_installed');
export const openKeys = async (link: string) => invoke<void>('keyboard_open_keys', { link, token: await activationToken() });
