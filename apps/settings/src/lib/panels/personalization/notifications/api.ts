export type AppOptions = {
	enable: boolean;
	'show-banners': boolean;
	'show-in-lock-screen': boolean;
	'details-in-lock-screen': boolean;
};

export type DoNotDisturb = 'never' | 'urgent' | 'always';

export type Sound = 'automatic' | 'luft' | 'app' | 'none';

export type AppRules = {
	sound: Sound;
	'during-do-not-disturb': DoNotDisturb;
	'keep-in-list': boolean;
};

export const APP_SCHEMA = 'org.gnome.desktop.notifications.application';
export const RULES_SCHEMA = 'com.lantharos.kestrel.notifications.application';
export const RULES_KEYS: (keyof AppRules)[] = ['sound', 'during-do-not-disturb', 'keep-in-list'];
export const APP_KEYS: (keyof AppOptions)[] = ['enable', 'show-banners', 'show-in-lock-screen', 'details-in-lock-screen'];

