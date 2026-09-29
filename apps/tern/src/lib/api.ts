import { invoke, listen } from '@lantharos/sabine';
import type { Activation, AppState, LaunchRequest, NotificationActivation, Settings } from './types';

export interface TerminalSize {
	cols: number;
	rows: number;
}

export const appState = () => invoke<AppState>('app_state');
export const updateSettings = (settings: Settings) => invoke<void>('update_settings', { settings });
export const resolveLaunch = (activation: Activation) => invoke<LaunchRequest>('resolve_launch', { ...activation });
export const openLink = (uri: string) => invoke<void>('open_link', { uri });
export const notify = (tab: string, title: string, body: string) => invoke<void>('notify', { tab, title, body });

export const pty = {
	spawn: (size: TerminalSize, request: LaunchRequest) => invoke<number>('pty_spawn', { ...size, ...request }),
	attach: (id: number) => invoke<void>('pty_attach', { id }),
	write: (id: number, data: string) => invoke<void>('pty_write', { id, data }),
	acknowledge: (id: number) => invoke<void>('pty_ack', { id }),
	resize: (id: number, size: TerminalSize) => invoke<void>('pty_resize', { id, ...size }),
	foreground: (id: number) => invoke<string | null>('pty_foreground', { id }),
	close: (id: number) => invoke<void>('pty_close', { id })
};

export const events = {
	output: (callback: (event: { id: number; data: string }) => void) => listen('tern.output', callback),
	exited: (callback: (event: { id: number; code: number }) => void) => listen('tern.exited', callback),
	notification: (callback: (event: NotificationActivation) => void) => listen('tern.notification', callback),
	activation: (callback: (activation: Activation) => void) => listen('singleInstance.activate', callback)
};
