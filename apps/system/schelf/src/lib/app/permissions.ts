import type { Component } from 'svelte';
import AppWindow from '@luft/symbols/icons/app-window';
import Camera from '@luft/symbols/icons/camera';
import Folder from '@luft/symbols/icons/folder';
import FolderOpen from '@luft/symbols/icons/folder-open';
import Gamepad2 from '@luft/symbols/icons/gamepad-2';
import Globe from '@luft/symbols/icons/globe';
import HardDrive from '@luft/symbols/icons/hard-drive';
import KeyRound from '@luft/symbols/icons/key-round';
import MessagesSquare from '@luft/symbols/icons/messages-square';
import Mic from '@luft/symbols/icons/mic';
import Printer from '@luft/symbols/icons/printer';
import ShieldCheck from '@luft/symbols/icons/shield-check';
import SquareTerminal from '@luft/symbols/icons/square-terminal';
import Usb from '@luft/symbols/icons/usb';
import Volume2 from '@luft/symbols/icons/volume-2';
import { i18n, t } from '@luft/i18n';
import type { Permissions } from '#lib/bindings.js';

export interface Access {
	icon: Component;
	title: string;
	description: string;
	notable: boolean;
}

const FOLDERS: Record<string, string> = {
	'xdg-download': 'permission-folder-downloads',
	'xdg-documents': 'permission-folder-documents',
	'xdg-pictures': 'permission-folder-pictures',
	'xdg-music': 'permission-folder-music',
	'xdg-videos': 'permission-folder-videos',
	'xdg-desktop': 'permission-folder-desktop',
	'xdg-public-share': 'permission-folder-public',
	'xdg-templates': 'permission-folder-templates'
};

const listing = (names: string[]) => new Intl.ListFormat(i18n.formats, { type: 'conjunction' }).format(names);

function files(filesystems: string[]): Access[] {
	const entries = filesystems.map((entry) => {
		const [place, mode] = entry.split(':');
		return { place: place.replace(/^!/, ''), readOnly: mode === 'ro', denied: place.startsWith('!') };
	});
	const hidden = ['xdg-run', 'xdg-config', 'xdg-cache', 'xdg-data', '/run/'];
	const granted = entries.filter((entry) => !entry.denied && !hidden.some((prefix) => entry.place.startsWith(prefix)));
	const mode = (readOnly: boolean, count = 2) => (readOnly ? t('permission-files-read-only', { count }) : t('permission-files-read-write', { count }));
	const access: Access[] = [];
	const host = granted.find((entry) => entry.place === 'host' || entry.place === 'host-os' || entry.place === 'host-etc');
	if (host) {
		access.push({ icon: HardDrive, title: t('permission-all-files'), description: mode(host.readOnly), notable: true });
		return access;
	}
	const home = granted.find((entry) => entry.place === 'home' || entry.place === '~');
	if (home) access.push({ icon: FolderOpen, title: t('permission-home'), description: mode(home.readOnly, 1), notable: true });
	const folders = granted.filter((entry) => FOLDERS[entry.place]);
	for (const readOnly of [false, true]) {
		const group = folders.filter((entry) => entry.readOnly === readOnly);
		if (!group.length) continue;
		const title = t('permission-folders', { count: group.length, folders: listing(group.map((entry) => t(FOLDERS[entry.place]))) });
		access.push({ icon: Folder, title, description: mode(readOnly, group.length), notable: !readOnly });
	}
	const others = granted.filter((entry) => entry !== home && !FOLDERS[entry.place]);
	if (others.length) {
		access.push({ icon: Folder, title: t('permission-other-folders'), description: listing(others.map((entry) => entry.place.replace(/^~\//, '~/'))), notable: true });
	}
	return access;
}

export function describe(permissions: Permissions): Access[] {
	const access: Access[] = [];
	const has = (list: string[], name: string) => list.includes(name);
	const bus = [...permissions.sessionBus, ...permissions.systemBus];
	if (bus.includes('org.freedesktop.Flatpak') || permissions.sockets.includes('system-bus') || permissions.sockets.includes('session-bus')) {
		access.push({ icon: SquareTerminal, title: t('permission-outside-sandbox'), description: t('permission-outside-sandbox-description'), notable: true });
	}
	access.push(...files(permissions.filesystems));
	if (has(permissions.shared, 'network')) access.push({ icon: Globe, title: t('permission-internet'), description: t('permission-internet-description'), notable: false });
	if (has(permissions.devices, 'all')) access.push({ icon: Usb, title: t('permission-all-devices'), description: t('permission-all-devices-description'), notable: true });
	else {
		if (has(permissions.devices, 'usb')) access.push({ icon: Usb, title: t('permission-usb'), description: t('permission-usb-description'), notable: true });
		if (has(permissions.devices, 'serial')) access.push({ icon: Usb, title: t('permission-serial'), description: t('permission-serial-description'), notable: true });
		if (has(permissions.devices, 'input')) access.push({ icon: Gamepad2, title: t('permission-input'), description: t('permission-input-description'), notable: false });
	}
	if (has(permissions.sockets, 'x11') && !has(permissions.sockets, 'fallback-x11')) {
		access.push({
			icon: AppWindow,
			title: t('permission-x11'),
			description: t('permission-x11-description'),
			notable: !has(permissions.sockets, 'wayland')
		});
	}
	if (has(permissions.devices, 'microphone')) access.push({ icon: Mic, title: t('permission-microphone'), description: t('permission-microphone-description'), notable: true });
	if (has(permissions.devices, 'camera')) access.push({ icon: Camera, title: t('permission-camera'), description: t('permission-camera-description'), notable: true });
	if (has(permissions.sockets, 'pulseaudio')) access.push({ icon: Volume2, title: t('permission-sound'), description: t('permission-pulseaudio-description'), notable: false });
	if (has(permissions.sockets, 'playback')) access.push({ icon: Volume2, title: t('permission-sound'), description: t('permission-playback-description'), notable: false });
	if (bus.includes('org.freedesktop.secrets')) access.push({ icon: KeyRound, title: t('permission-secrets'), description: t('permission-secrets-description'), notable: true });
	if (has(permissions.sockets, 'ssh-auth') || has(permissions.sockets, 'gpg-agent')) access.push({ icon: KeyRound, title: t('permission-keys'), description: t('permission-keys-description'), notable: true });
	if (has(permissions.sockets, 'cups')) access.push({ icon: Printer, title: t('permission-printers'), description: t('permission-printers-description'), notable: false });
	if (!access.length) access.push({ icon: ShieldCheck, title: t('permission-none'), description: t('permission-none-description'), notable: false });
	else if (permissions.sessionBus.length > 4) access.push({ icon: MessagesSquare, title: t('permission-session-bus'), description: t('permission-session-bus-description', { count: permissions.sessionBus.length }), notable: false });
	return access.sort((a, b) => Number(b.notable) - Number(a.notable));
}
