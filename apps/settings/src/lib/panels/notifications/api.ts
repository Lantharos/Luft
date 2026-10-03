import { invoke } from '#lib/bridge.js';
import type { App } from '../apps/api';

export interface NotifyingApp extends App {
	path: string;
	rulesPath: string;
}

export type AppOptions = {
	enable: boolean;
	'show-banners': boolean;
	'enable-sound-alerts': boolean;
	'show-in-lock-screen': boolean;
	'details-in-lock-screen': boolean;
};

export type DoNotDisturb = 'never' | 'urgent' | 'always';

export type AppRules = {
	'during-do-not-disturb': DoNotDisturb;
	'keep-in-list': boolean;
};

export const KESTREL_SCHEMA = 'com.lantharos.kestrel';
export const APP_SCHEMA = 'org.gnome.desktop.notifications.application';
export const RULES_SCHEMA = 'com.lantharos.kestrel.notifications.application';
export const RULES_KEYS: (keyof AppRules)[] = ['during-do-not-disturb', 'keep-in-list'];
export const APP_KEYS: (keyof AppOptions)[] = ['enable', 'show-banners', 'enable-sound-alerts', 'show-in-lock-screen', 'details-in-lock-screen'];

export const notifyingApps = () => invoke<NotifyingApp[]>('notifications_apps');
