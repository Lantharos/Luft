import type { AppUpdate, Backend, FedoraSummary, Finished, InstalledApp, Job, Operation } from './types';

const parameters = new URLSearchParams(location.search);
const ICONS = 'https://dl.flathub.org/media/icons/128x128';
const icon = (id: string) => `${ICONS}/${id}.png`;

function installedApp(source: InstalledApp['source'], id: string, name: string, version: string, size: number, origin: string, extra: Partial<InstalledApp> = {}): InstalledApp {
	const key = source === 'flatpak' ? `flatpak/${id}/x86_64/stable` : source === 'package' ? `package/${extra.package}` : `appimage/${id}`;
	return {
		key,
		source,
		id,
		desktop: `${id}.desktop`,
		name,
		summary: null,
		icon: icon(id),
		version,
		size,
		origin,
		installation: source === 'flatpak' ? 'system' : null,
		reference: source === 'flatpak' ? `${id}/x86_64/stable` : null,
		package: null,
		path: null,
		...extra
	};
}

let installed: InstalledApp[] = [
	installedApp('flatpak', 'org.mozilla.Thunderbird', 'Thunderbird', '157.0', 339_400_000, 'flathub'),
	installedApp('flatpak', 'com.spotify.Client', 'Spotify', '1.2.95', 14_100_000, 'flathub'),
	installedApp('flatpak', 'org.localsend.localsend_app', 'LocalSend', '1.18.2', 58_200_000, 'flathub'),
	installedApp('flatpak', 'org.prismlauncher.PrismLauncher', 'Prism Launcher', '11.1.1', 87_400_000, 'flathub', { installation: 'user' }),
	installedApp('package', 'org.gimp.GIMP', 'GNU Image Manipulation Program', '3.0.6', 142_000_000, 'Fedora Project', { package: 'gimp' }),
	installedApp('package', 'org.gnome.DiskUtility', 'Disks', '46.1', 8_200_000, 'Fedora Project', { package: 'gnome-disk-utility' }),
	installedApp('package', 'com.discordapp.Discord', 'Discord', '0.0.111', 287_000_000, 'Discord Inc.', { package: 'discord' }),
	installedApp('appImage', 'appimage-limbo', 'Limbo', '1.4.0', 14_080_504, '~/Applications', { icon: null, path: '~/Applications/limbo.AppImage' })
];

const updates: AppUpdate[] = [
	{ key: 'flatpak/org.mozilla.Thunderbird/x86_64/stable', source: 'flatpak', id: 'org.mozilla.Thunderbird', desktop: null, name: 'Thunderbird', icon: icon('org.mozilla.Thunderbird'), from: '157.0', to: '157.0.1', size: 82_000_000, platform: false, installation: 'system', reference: 'org.mozilla.Thunderbird/x86_64/stable', package: null },
	{ key: 'package/discord', source: 'package', id: 'discord.desktop', desktop: null, name: 'Discord', icon: icon('com.discordapp.Discord'), from: '0.0.111', to: '0.0.112', size: 104_000_000, platform: false, installation: null, reference: null, package: 'discord' },
	{ key: 'flatpak/org.freedesktop.Platform/x86_64/25.08', source: 'flatpak', id: 'org.freedesktop.Platform', desktop: null, name: 'Freedesktop Platform', icon: null, from: '25.08.17', to: '25.08.18', size: 31_000_000, platform: true, installation: 'system', reference: 'org.freedesktop.Platform/x86_64/25.08', package: null },
	{ key: 'flatpak/org.freedesktop.Platform.GL.default/x86_64/25.08', source: 'flatpak', id: 'org.freedesktop.Platform.GL.default', desktop: null, name: 'Mesa', icon: null, from: '26.2.2', to: '26.2.3', size: 48_000_000, platform: true, installation: 'system', reference: 'org.freedesktop.Platform.GL.default/x86_64/25.08', package: null }
];

const fedora: FedoraSummary[] = [
	['org.gimp.GIMP', 'gimp', 'GNU Image Manipulation Program', 'Create images and edit photographs', ['Graphics']],
	['org.inkscape.Inkscape', 'inkscape', 'Inkscape', 'Vector Graphics Editor', ['Graphics']],
	['org.gnome.Calculator', 'gnome-calculator', 'Calculator', 'Perform arithmetic, scientific or financial calculations', ['Utility']],
	['org.kde.krita', 'krita', 'Krita', 'Digital Painting, Creative Freedom', ['Graphics']],
	['org.gnome.Boxes', 'gnome-boxes', 'Boxes', 'Virtualization made simple', ['System']],
	['org.blender.Blender', 'blender', 'Blender', '3D modeling, animation, rendering and post-production', ['Graphics']],
	['org.libreoffice.LibreOffice', 'libreoffice-core', 'LibreOffice', 'The LibreOffice productivity suite', ['Office']],
	['org.videolan.VLC', 'vlc', 'VLC', 'Media player', ['AudioVideo']]
].map(([id, name, title, summary, categories]) => ({
	id: id as string,
	package: name as string,
	name: title as string,
	summary: summary as string,
	icon: icon(id as string),
	categories: categories as string[],
	keywords: [],
	screenshots: 2
}));

let operations: Operation[] = [];
let nextId = 1;
const listeners = { operations: new Set<(list: Operation[]) => void>(), library: new Set<(finished: Finished) => void>() };

function publish() {
	for (const listener of listeners.operations) listener(operations);
}

function simulate(operation: Operation, job: Job) {
	let fraction = 0;
	const timer = setInterval(() => {
		fraction += 0.07;
		operations = operations.map((entry) => (entry.id === operation.id ? { ...entry, state: 'running', progress: { stage: 'downloading', fraction: Math.min(fraction, 1) } } : entry));
		publish();
		if (fraction < 1) return;
		clearInterval(timer);
		operations = operations.filter((entry) => entry.id !== operation.id);
		if (job.kind === 'removeFlatpak' || job.kind === 'removePackage' || job.kind === 'removeAppImage') installed = installed.filter((app) => app.key !== operation.key);
		publish();
		for (const listener of listeners.library) listener({ keys: [operation.key, ...operation.members], action: operation.action, succeeded: true });
	}, 220);
}

async function json<T>(response: Response): Promise<T> {
	if (!response.ok) throw new Error(response.status === 404 ? "That isn't available any more." : "You're offline, or the server couldn't be reached.");
	return response.json();
}

export const preview: Backend = {
	appState: async () => ({
		palette: null,
		typography: { interface: null, monospace: null, textScale: 1 },
		files: parameters.getAll('file'),
		page: parameters.get('page')
	}),
	activationFiles: async () => [],
	flathub: <T>(path: string) => fetch(`/flathub/${path}`).then((response) => json<T>(response)),
	flathubSearch: <T>(query: string) =>
		fetch('/flathub/search', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ query, filters: [], hitsPerPage: 60, page: 1 }) }).then((response) =>
			json<T>(response)
		),
	fedoraApps: async () => fedora,
	fedoraApp: async (id) => {
		const app = fedora.find((entry) => entry.id === id)!;
		return { ...app, description: `<p>${app.summary}.</p>`, developer: null, license: 'GPL-3.0-or-later', homepage: 'https://fedoraproject.org', screenshots: [], details: null };
	},
	installed: async () => installed,
	launch: async () => {},
	removalPlan: async () => [],
	permissions: async () => ({ shared: ['network', 'ipc'], sockets: ['wayland', 'pulseaudio'], devices: ['dri'], filesystems: ['xdg-download'], sessionBus: [], systemBus: [] }),
	checkUpdates: async () => {
		await new Promise((resolve) => setTimeout(resolve, 600));
		return { apps: updates, checked: Math.floor(Date.now() / 1000) - 240, error: null };
	},
	inspectFile: async (path) => ({ kind: 'appImage', path, name: 'Raffi', summary: 'A modern video player', version: '0.13.0', icon: null, size: 121_748_278 }),
	chooseAppImage: async () => null,
	operations: async () => operations,
	start: async (key, title, job, members = []) => {
		const operation: Operation = { id: nextId++, key, members, title, action: job.kind.startsWith('remove') ? 'remove' : job.kind.startsWith('update') ? 'update' : 'install', state: 'queued', progress: null, error: null };
		operations = [...operations, operation];
		publish();
		simulate(operation, job);
		return operation.id;
	},
	cancel: async (id) => {
		operations = operations.filter((entry) => entry.id !== id);
		publish();
	},
	openUrl: async (url) => void window.open(url, '_blank'),
	onOperations: (callback) => {
		listeners.operations.add(callback);
		return () => listeners.operations.delete(callback);
	},
	onLibraryChanged: (callback) => {
		listeners.library.add(callback);
		return () => listeners.library.delete(callback);
	},
	onActivated: () => () => {}
};
