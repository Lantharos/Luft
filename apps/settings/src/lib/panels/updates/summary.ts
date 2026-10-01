import type { Update } from './api';

export interface Area {
	title: string;
	updates: Update[];
}

const AREAS: { title: string; pattern: RegExp }[] = [
	{ title: 'Linux kernel', pattern: /^kernel(-|$)/ },
	{ title: 'Drivers and firmware', pattern: /(^mesa-|nvidia|firmware|microcode|^xorg-x11-drv|^libdrm|^vulkan|^libva|^libinput)/ },
	{
		title: 'Desktop',
		pattern: /^(gnome-|gtk|glib2|mutter|gdm|pipewire|wireplumber|NetworkManager|bluez|ibus|xdg-|fontconfig|freetype|harfbuzz|pango|cairo|libadwaita|flatpak|PackageKit|fwupd|plymouth|greetd|.*-fonts)/
	},
	{ title: 'Core system', pattern: /^(systemd|glibc|dnf|rpm|libdnf|bash|coreutils|util-linux|selinux|policycoreutils|openssl|ca-certificates|grub2|shim|dracut|sudo|polkit|dbus|kmod|filesystem|setup|fedora-|audit|pam|shadow-utils|crypto-policies)/ }
];
const OTHER = 'Libraries and tools';

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

function list(parts: string[]) {
	return parts.length < 2 ? parts.join('') : `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`;
}

export function describe(updates: Update[]) {
	const names = updates.map((update) => update.package.name);
	const parts: string[] = [];
	if (updates.some((update) => update.security)) parts.push('security fixes');
	if (names.some((name) => AREAS[0].pattern.test(name))) parts.push('a new Linux kernel');
	if (names.some((name) => AREAS[1].pattern.test(name))) parts.push('updated drivers');
	if (!parts.length) return 'Fixes and improvements across the system';
	return `Includes ${list(parts)}`;
}
