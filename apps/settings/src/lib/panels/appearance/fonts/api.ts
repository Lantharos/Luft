import { invoke } from '#lib/bridge.js';

export type FontRole = 'interface' | 'monospace';

export interface FontFamily {
	name: string;
	styles: number;
	monospace: boolean;
	file: string;
	removable: boolean;
}

export type FontDefaults = Record<FontRole, string>;

export const fontFamilies = () => invoke<FontFamily[]>('appearance_fonts');
export const openFont = (file: string) => invoke<void>('appearance_font_open', { file });
export const removeFont = (family: string) => invoke<void>('appearance_font_remove', { family });
export const fontDefaults = () => invoke<FontDefaults>('appearance_font_defaults');
export const useFont = (role: FontRole, family: string) => invoke<void>('appearance_font_use', { role, family });
export const resetFont = (role: FontRole) => invoke<void>('appearance_font_reset', { role });
