import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { PageId } from '@luft/settings-pages';
import type { Plugin } from 'vite';

const PANELS = fileURLToPath(new URL('./src/lib/panels/', import.meta.url));
const MODULE = 'virtual:settings-rows';
const RESOLVED = `\0${MODULE}`;
const TITLE = /title=\{t\('([a-z0-9-]+)'/g;
const TAG = /<([A-Z][A-Za-z]*)\b/g;
const TITLED = new Set(['Row', 'ActionRow', 'Section', 'SubPage', 'DelayRow']);

const FOLDERS: [string, PageId][] = [
	['connections/network/wifi', 'network/wifi'],
	['connections/network/ethernet', 'network/ethernet'],
	['connections/network/vpn', 'network/vpn'],
	['connections/network/firewall', 'network/firewall'],
	['connections/network/proxy', 'network/proxy'],
	['connections/network', 'network'],
	['connections/bluetooth', 'bluetooth'],
	['connections/post', 'post'],
	['devices/display', 'display'],
	['devices/sound/system', 'sound/custom'],
	['devices/sound', 'sound'],
	['devices/power', 'power'],
	['devices/input/shortcuts', 'input/shortcuts'],
	['devices/input/dictation', 'input/dictation'],
	['devices/input', 'input'],
	['devices/pen', 'pen'],
	['devices/printers', 'printers'],
	['personalization/appearance', 'appearance'],
	['personalization/wallpaper', 'appearance'],
	['personalization/taskbar', 'taskbar'],
	['personalization/windows', 'windows'],
	['personalization/extensions', 'extensions'],
	['personalization/accessibility', 'accessibility'],
	['protection/privacy/sharing', 'privacy/sharing'],
	['protection/privacy', 'privacy'],
	['protection/security/encryption', 'security/encryption'],
	['protection/security/keyring', 'security/keyring'],
	['protection/security/remote', 'security/remote-login'],
	['protection/security', 'security'],
	['system/apps', 'apps'],
	['system/accounts/login', 'accounts/login'],
	['system/accounts/online', 'accounts/add'],
	['system/accounts', 'accounts'],
	['system/language', 'language'],
	['system/about', 'system/about'],
	['system', 'system']
];

function sources(folder: string): string[] {
	return readdirSync(folder, { withFileTypes: true }).flatMap((entry) => {
		const path = join(folder, entry.name);
		if (entry.isDirectory()) return sources(path);
		return entry.name.endsWith('.svelte') ? [path] : [];
	});
}

function pageOf(file: string): PageId {
	const path = relative(PANELS, file);
	const found = FOLDERS.find(([folder]) => path.startsWith(`${folder}/`));
	if (!found) throw new Error(`${path} belongs to no Settings page, so search can't find its settings. Add its folder to rows.ts.`);
	return found[1];
}

function titles(source: string): string[] {
	const tags = [...source.matchAll(TAG)];
	return [...source.matchAll(TITLE)].filter((title) => TITLED.has(tags.findLast((tag) => tag.index < title.index)?.[1] ?? '')).map((title) => title[1]);
}

function rows() {
	const seen = new Set<string>();
	return sources(PANELS).flatMap((file) => {
		const page = pageOf(file);
		return titles(readFileSync(file, 'utf8'))
			.filter((title) => !seen.has(`${page} ${title}`) && seen.add(`${page} ${title}`))
			.map((title) => ({ page, title }));
	});
}

export function settingsRows(): Plugin {
	return {
		name: 'settings-rows',
		resolveId: (id) => (id === MODULE ? RESOLVED : undefined),
		load: (id) => (id === RESOLVED ? `export const ROWS = ${JSON.stringify(rows())};` : undefined),
		handleHotUpdate({ file, server }) {
			if (!file.startsWith(PANELS)) return;
			const module = server.moduleGraph.getModuleById(RESOLVED);
			if (module) server.moduleGraph.invalidateModule(module);
		}
	};
}
