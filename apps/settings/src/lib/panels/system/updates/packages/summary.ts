import type { Update } from '../api';

export interface Area {
	title: string;
	updates: Update[];
}

const KERNEL = /^kernel(-|$)/;
const DRIVERS = /(^mesa-|nvidia|firmware|microcode|^xorg-x11-drv|^libdrm|^vulkan|^libva|^libinput)/;
const AREAS: { title: string; pattern: RegExp }[] = [
	{ title: 'settings-updates-area-kernel', pattern: KERNEL },
	{ title: 'settings-updates-area-drivers', pattern: DRIVERS },
	{
		title: 'settings-updates-area-desktop',
		pattern: /^(gnome-|gtk|glib2|mutter|gdm|pipewire|wireplumber|NetworkManager|bluez|ibus|xdg-|fontconfig|freetype|harfbuzz|pango|cairo|libadwaita|flatpak|PackageKit|fwupd|plymouth|greetd|.*-fonts)/
	},
	{ title: 'settings-updates-area-core', pattern: /^(systemd|glibc|dnf|rpm|libdnf|bash|coreutils|util-linux|selinux|policycoreutils|openssl|ca-certificates|grub2|shim|dracut|sudo|polkit|dbus|kmod|filesystem|setup|fedora-|audit|pam|shadow-utils|crypto-policies)/ }
];
const OTHER = 'settings-updates-area-other';

export function areas(updates: Update[]): Area[] {
	const groups = new Map<string, Update[]>([...AREAS.map(({ title }) => [title, []] as [string, Update[]]), [OTHER, []]]);
	for (const update of updates) {
		const area = AREAS.find(({ pattern }) => pattern.test(update.package.name))?.title ?? OTHER;
		groups.get(area)!.push(update);
	}
	return [...groups]
		.filter(([, list]) => list.length)
		.map(([title, list]) => ({ title, updates: list.sort((a, b) => a.package.name.localeCompare(b.package.name)) }));
}

export function contents(updates: Update[]) {
	const names = updates.map((update) => update.package.name);
	return [
		updates.some((update) => update.security) && 'security',
		names.some((name) => KERNEL.test(name)) && 'kernel',
		names.some((name) => DRIVERS.test(name)) && 'drivers'
	]
		.filter(Boolean)
		.join('-');
}
