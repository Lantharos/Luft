import { invoke } from '#lib/bridge.js';

export interface FontFamily {
	name: string;
	styles: number;
	file: string;
	removable: boolean;
}

export const fontFamilies = () => invoke<FontFamily[]>('appearance_fonts');
export const openFont = (file: string) => invoke<void>('appearance_font_open', { file });
export const removeFont = (family: string) => invoke<void>('appearance_font_remove', { family });
