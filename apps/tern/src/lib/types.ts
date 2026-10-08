import type { Appearance } from '@luft/ui';

export type CursorStyle = 'block' | 'bar' | 'underline';
export type SchemePreference = 'system' | 'dark' | 'light';

export interface Settings {
	fontSize: number;
	scrollback: number;
	cursorStyle: CursorStyle;
	cursorBlink: boolean;
	translucent: boolean;
	opacity: number;
	scheme: SchemePreference;
	shell: string | null;
	copyOnSelect: boolean;
	clipboardReads: boolean;
}

export interface LaunchRequest {
	directory: string | null;
	command: string[] | null;
}

export interface AppState extends Appearance {
	settings: Settings;
	launch: LaunchRequest;
	defaultShell: string;
	shells: string[];
	glass: boolean;
}

export interface Activation {
	arguments: string[];
	workingDirectory: string | null;
}
