import type { Translate } from '../i18n/translate';

const icons = import.meta.glob<string>('../../../../kestrel/engine/data/icons/scalable/apps/com.lantharos.*-symbolic.svg', {
	eager: true,
	query: '?raw',
	import: 'default'
});

const iconOf = (id: string) =>
	icons[`../../../../kestrel/engine/data/icons/scalable/apps/com.lantharos.${id}-symbolic.svg`]
		.replace(/\s(width|height)="16"/g, '')
		.replace(/fill="#[0-9a-f]+"/i, 'fill="currentColor"');

export interface App {
	id: string;
	name: string;
	does: string;
	detail: string;
	icon: string;
}

const app = (id: string, name: string, does: string, detail: string): App => ({ id, name, does, detail, icon: iconOf(id) });

export const apps = (t: Translate): App[] => [
	app('rover', 'Rover', t('home-app-rover'), t('home-app-rover-detail')),
	app('settings', t('home-app-settings-name'), t('home-app-settings'), t('home-app-settings-detail')),
	app('magpie', 'Magpie', t('home-app-magpie'), t('home-app-magpie-detail')),
	app('mailman', 'Mailman', t('home-app-mailman'), t('home-app-mailman-detail')),
	app('draft', 'Draft', t('home-app-draft'), t('home-app-draft-detail')),
	app('tern', 'Tern', t('home-app-tern'), t('home-app-tern-detail')),
	app('schelf', 'Schelf', t('home-app-schelf'), t('home-app-schelf-detail')),
	app('disks', t('home-app-disks-name'), t('home-app-disks'), t('home-app-disks-detail')),
	app('barometer', 'Barometer', t('home-app-barometer'), t('home-app-barometer-detail')),
	app('keys', 'Keys', t('home-app-keys'), t('home-app-keys-detail'))
];
