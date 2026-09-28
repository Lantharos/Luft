import { invoke } from '$lib/bridge';
import type { App } from '../apps/api';

export interface NotifyingApp extends App {
	path: string;
}

export type AppOptions = {
	enable: boolean;
	'show-banners': boolean;
	'enable-sound-alerts': boolean;
	'show-in-lock-screen': boolean;
	'details-in-lock-screen': boolean;
};

export const KESTREL_SCHEMA = 'dev.lantharos.kestrel';
export const APP_SCHEMA = 'org.gnome.desktop.notifications.application';
export const APP_KEYS: (keyof AppOptions)[] = ['enable', 'show-banners', 'enable-sound-alerts', 'show-in-lock-screen', 'details-in-lock-screen'];

export const notifyingApps = () => invoke<NotifyingApp[]>('notifications_apps');
