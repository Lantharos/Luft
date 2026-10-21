import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { localeFiles, locales, merged } from './tools/merge.js';

const MODULE = 'virtual:luft-locales';
const RESOLVED = `\0${MODULE}`;
const UI_LOCALES = fileURLToPath(new URL('../web/ui/locales', import.meta.url));

/**
 * Bundles an app's Fluent files, one lazily loaded chunk per locale with the
 * English messages filled in for anything not yet translated.
 * @param {{ dirs?: string[] }} [options]
 * @returns {import('vite').Plugin}
 */
export function luftLocales({ dirs = ['locales'] } = {}) {
	/** @type {string[]} */
	let folders = [];
	return {
		name: 'luft-locales',
		configResolved(config) {
			folders = [...dirs.map((dir) => resolve(config.root, dir)), UI_LOCALES];
		},
		resolveId(id) {
			if (id === MODULE || id.startsWith(`${MODULE}/`)) return `\0${id}`;
		},
		load(id) {
			if (id === RESOLVED) {
				const loaders = locales(folders).map((locale) => `${JSON.stringify(locale)}: () => import(${JSON.stringify(`${MODULE}/${locale}`)})`);
				return `const loaders = {${loaders.join(',')}};\nexport const load = (locale) => loaders[locale]().then((module) => module.default);`;
			}
			if (id.startsWith(`${RESOLVED}/`)) {
				const locale = id.slice(RESOLVED.length + 1);
				for (const dir of folders) for (const file of [...localeFiles(dir, locale), ...localeFiles(dir, 'en')]) this.addWatchFile(file);
				return `export default ${JSON.stringify(merged(folders, locale))};`;
			}
		}
	};
}
