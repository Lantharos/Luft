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

export const apps: App[] = [
	app('rover', 'Rover', 'Files', 'Tabs, Quick Look, network drives and your cloud drives, with a sidebar that knows where Windows lives.'),
	app('settings', 'Settings', 'Settings', 'Every switch in one place, from Wi-Fi and displays to updates, security and the taskbar.'),
	app('magpie', 'Magpie', 'Photos, videos and music', 'Opens photos, videos, songs, PDFs and fonts, with the rest of the folder an arrow key away.'),
	app('mailman', 'Mailman', 'Mail', 'One inbox for every account, a screener for new senders and search that works offline.'),
	app('draft', 'Draft', 'Text and code', 'Over a hundred languages, multiple cursors and a Markdown preview, and it remembers where you left off.'),
	app('tern', 'Tern', 'Terminal', 'Tabs and split panes, a nudge when a long command finishes, and colours from your wallpaper.'),
	app('schelf', 'Schelf', 'Apps', 'Thousands of apps from Flathub and AppImages, with permissions explained in plain words.'),
	app('disks', 'Disks', 'Drives', 'Partitions to scale, encryption, health checks and USB sticks made from an image.'),
	app('barometer', 'Barometer', 'System monitor', 'What every app is using, with live graphs for the processor, memory, graphics and network.'),
	app('keys', 'Keys', 'Keyboard layouts', 'Draw your own keyboard layout or input method, and try it before you save it.')
];
