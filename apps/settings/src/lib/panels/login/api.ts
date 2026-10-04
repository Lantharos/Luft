import { invoke, listen } from '#lib/bridge.js';

const WAIT_FOR_PERMISSION = 300_000;

export interface Session {
	id: string;
	name: string;
}

export interface LoginScreen {
	sharedWallpaper: string | null;
	showUsers: boolean;
	hiddenUsers: string[];
	defaultSession: string;
	automaticLogin: string;
	sessions: Session[];
}

const change = (command: string, args?: Record<string, unknown>) => invoke<void>(command, args, { timeoutMs: WAIT_FOR_PERMISSION });

export const loginScreen = () => invoke<LoginScreen | null>('login_screen');
export const onLoginScreenChanged = (callback: (screen: LoginScreen) => void) => listen<LoginScreen>('login.changed', callback);
export const chooseWallpaper = () => invoke<boolean>('login_choose_wallpaper', undefined, { timeoutMs: WAIT_FOR_PERMISSION });
export const clearWallpaper = () => change('login_clear_wallpaper');
export const setShowUsers = (enabled: boolean) => change('login_set_show_users', { enabled });
export const setHiddenUsers = (users: string[]) => change('login_set_hidden_users', { users });
export const setDefaultSession = (session: string) => change('login_set_default_session', { session });
export const setAutomaticLogin = (user: string) => change('login_set_automatic_login', { user });
