import type { Component } from 'svelte';
import AppWindow from '@lucide/svelte/icons/app-window';
import Folder from '@lucide/svelte/icons/folder';
import FolderOpen from '@lucide/svelte/icons/folder-open';
import Gamepad2 from '@lucide/svelte/icons/gamepad-2';
import Globe from '@lucide/svelte/icons/globe';
import HardDrive from '@lucide/svelte/icons/hard-drive';
import KeyRound from '@lucide/svelte/icons/key-round';
import MessagesSquare from '@lucide/svelte/icons/messages-square';
import Printer from '@lucide/svelte/icons/printer';
import ShieldCheck from '@lucide/svelte/icons/shield-check';
import SquareTerminal from '@lucide/svelte/icons/square-terminal';
import Usb from '@lucide/svelte/icons/usb';
import Volume2 from '@lucide/svelte/icons/volume-2';
import type { Permissions } from '$lib/bridge/types';

export interface Access {
	icon: Component;
	title: string;
	description: string;
	notable: boolean;
}

const FOLDERS: Record<string, string> = {
	'xdg-download': 'Downloads',
	'xdg-documents': 'Documents',
	'xdg-pictures': 'Pictures',
	'xdg-music': 'Music',
	'xdg-videos': 'Videos',
	'xdg-desktop': 'Desktop',
	'xdg-public-share': 'Public',
	'xdg-templates': 'Templates'
};

function listing(names: string[]) {
	if (names.length < 2) return names.join('');
	return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

function files(filesystems: string[]): Access[] {
	const entries = filesystems.map((entry) => {
		const [place, mode] = entry.split(':');
		return { place: place.replace(/^!/, ''), readOnly: mode === 'ro', denied: place.startsWith('!') };
	});
	const hidden = ['xdg-run', 'xdg-config', 'xdg-cache', 'xdg-data', '/run/'];
	const granted = entries.filter((entry) => !entry.denied && !hidden.some((prefix) => entry.place.startsWith(prefix)));
	const mode = (readOnly: boolean) => (readOnly ? 'It can look at them but not change them.' : 'It can read and change them.');
	const access: Access[] = [];
	const host = granted.find((entry) => entry.place === 'host' || entry.place === 'host-os' || entry.place === 'host-etc');
	if (host) {
		access.push({ icon: HardDrive, title: 'All files on this computer', description: mode(host.readOnly), notable: true });
		return access;
	}
	const home = granted.find((entry) => entry.place === 'home' || entry.place === '~');
	if (home) access.push({ icon: FolderOpen, title: 'Your home folder', description: mode(home.readOnly), notable: true });
	const folders = granted.filter((entry) => FOLDERS[entry.place]);
	if (folders.length) {
		const readOnly = folders.every((entry) => entry.readOnly);
		access.push({ icon: Folder, title: `${listing(folders.map((entry) => FOLDERS[entry.place]))} ${folders.length > 1 ? 'folders' : 'folder'}`, description: mode(readOnly), notable: !readOnly });
	}
	const others = granted.filter((entry) => entry !== home && !FOLDERS[entry.place]);
	if (others.length) {
		access.push({ icon: Folder, title: 'Other folders', description: listing(others.map((entry) => entry.place.replace(/^~\//, '~/'))), notable: true });
	}
	return access;
}

export function describe(permissions: Permissions): Access[] {
	const access: Access[] = [];
	const has = (list: string[], name: string) => list.includes(name);
	const bus = [...permissions.sessionBus, ...permissions.systemBus];
	if (bus.includes('org.freedesktop.Flatpak') || permissions.sockets.includes('system-bus') || permissions.sockets.includes('session-bus')) {
		access.push({ icon: SquareTerminal, title: 'Runs outside its sandbox', description: 'It can start programs or reach services with your full permissions.', notable: true });
	}
	access.push(...files(permissions.filesystems));
	if (has(permissions.shared, 'network')) access.push({ icon: Globe, title: 'Internet', description: 'It can go online.', notable: false });
	if (has(permissions.devices, 'all')) access.push({ icon: Usb, title: 'All devices', description: 'Including cameras, microphones and USB devices.', notable: true });
	else if (has(permissions.devices, 'input')) access.push({ icon: Gamepad2, title: 'Game controllers', description: 'It can read controllers and other input devices.', notable: false });
	if (has(permissions.sockets, 'x11') && !has(permissions.sockets, 'fallback-x11') && !has(permissions.sockets, 'wayland')) {
		access.push({ icon: AppWindow, title: 'Older display system', description: 'It uses X11, which lets it see what other apps show and type.', notable: true });
	}
	if (has(permissions.sockets, 'pulseaudio')) access.push({ icon: Volume2, title: 'Sound', description: 'It can play sound and may be able to record it.', notable: false });
	if (bus.includes('org.freedesktop.secrets')) access.push({ icon: KeyRound, title: 'Saved passwords', description: 'It can use the passwords stored on this computer.', notable: true });
	if (has(permissions.sockets, 'ssh-auth') || has(permissions.sockets, 'gpg-agent')) access.push({ icon: KeyRound, title: 'Your keys', description: 'It can use your SSH or GPG keys.', notable: true });
	if (has(permissions.sockets, 'cups')) access.push({ icon: Printer, title: 'Printers', description: 'It can print directly.', notable: false });
	if (!access.length) access.push({ icon: ShieldCheck, title: 'No special access', description: 'It runs separated from your files and other apps.', notable: false });
	else if (permissions.sessionBus.length > 4) access.push({ icon: MessagesSquare, title: 'Talks to other apps', description: `It can reach ${permissions.sessionBus.length} other services on your desktop.`, notable: false });
	return access.sort((a, b) => Number(b.notable) - Number(a.notable));
}
