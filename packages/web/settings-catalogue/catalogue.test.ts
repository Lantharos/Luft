import { describe, expect, test } from 'bun:test';
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { Message, parse } from '@fluent/syntax';
import { PAGES } from '@luft/settings-pages';
import { SETTINGS, SETTINGS_ONLY, SYSTEM_SETTINGS, splitKey, type Setting } from './catalogue.js';

const ROOT = join(import.meta.dir, '../../..');
const SETTINGS_APP = join(ROOT, 'apps/system/settings');
const PANELS = join(SETTINGS_APP, 'src/lib/panels');
const KESTREL_SCHEMAS = join(ROOT, 'kestrel/engine/data');
const FOLDER = /\['([a-z/-]+)', '([a-z/-]+)'\]/g;

function files(folder: string, pattern: RegExp): string[] {
	return readdirSync(folder, { withFileTypes: true }).flatMap((entry) => {
		const path = join(folder, entry.name);
		if (entry.isDirectory()) return files(path, pattern);
		return pattern.test(entry.name) ? [path] : [];
	});
}

const folders = [...readFileSync(join(SETTINGS_APP, 'rows.ts'), 'utf8').matchAll(FOLDER)].map(([, folder, page]) => ({ folder, page }));

function pageOf(file: string): string | undefined {
	const path = relative(PANELS, file);
	return folders.find(({ folder }) => path.startsWith(`${folder}/`))?.page;
}

const sources = new Map<string, string>();
for (const file of files(PANELS, /\.(svelte|ts)$/)) {
	const page = pageOf(file);
	if (page) sources.set(page, `${sources.get(page) ?? ''}\n${readFileSync(file, 'utf8')}`);
}

const messages = new Set(
	files(join(SETTINGS_APP, 'locales/en'), /\.ftl$/).flatMap((file) =>
		parse(readFileSync(file, 'utf8'), { withSpans: false })
			.body.filter((entry) => entry instanceof Message)
			.map((entry) => (entry as Message).id.name)
	)
);

const kestrelKeys = new Set(
	files(KESTREL_SCHEMAS, /\.gschema\.xml(\.in)?$/).flatMap((file) => {
		const text = readFileSync(file, 'utf8');
		return [...text.matchAll(/<schema id="([^"]+)"[\s\S]*?<\/schema>/g)].flatMap(([schema, id]) =>
			[...schema.matchAll(/<key name="([^"]+)"/g)].map(([, key]) => `${id} ${key}`)
		);
	})
);

const pageIds = new Set(PAGES.map((page) => page.id));
const pageTitles = new Set(PAGES.map((page) => page.title));
const keysOf = (setting: Setting) => [setting.key, ...(setting.options ?? []).flatMap((option) => [...Object.keys(option.when ?? {}), ...Object.keys(option.set ?? {})])].filter((key): key is string => !!key);

function shownOn(page: string, id: string) {
	return sources.get(page)?.includes(`'${id}'`) ?? false;
}

describe('the settings luft and the review of changes offer', () => {
	test('have one id each', () => {
		const ids = [...SETTINGS, ...SETTINGS_ONLY].map((setting) => setting.id);
		expect(new Set(ids).size).toBe(ids.length);
		for (const id of ids) expect(id).toMatch(/^[a-z]+(\.[a-z0-9-]+)+$/);
	});

	for (const setting of SETTINGS.filter((setting) => !setting.developer)) {
		test(`${setting.id} is on its page in Settings, under the name Settings shows`, () => {
			expect(PAGES.find((page) => page.id === setting.page)?.title).toBe(`settings-page-${setting.page}`);
			expect(messages.has(setting.title!)).toBe(true);
			expect(shownOn(setting.page!, setting.title!)).toBe(true);
			for (const option of setting.options ?? []) {
				for (const id of [option.label, option.note].filter((id): id is string => !!id)) {
					expect(messages.has(id)).toBe(true);
					expect(shownOn(setting.page!, id)).toBe(true);
				}
			}
			for (const key of keysOf(setting)) expect(shownOn(setting.page!, splitKey(key).key)).toBe(true);
		});
	}

	test('send what only Settings changes to its page', () => {
		for (const only of SETTINGS_ONLY) {
			expect(pageIds.has(only.page)).toBe(true);
			expect(pageTitles.has(only.title)).toBe(true);
		}
	});

	test('name only keys the schemas have', () => {
		for (const key of SETTINGS.flatMap(keysOf).filter((key) => key.startsWith('com.lantharos.'))) expect(kestrelKeys.has(key)).toBe(true);
	});

	test('say how every setting is kept', () => {
		for (const setting of SETTINGS) {
			const kinds = [setting.key, setting.system, setting.service, setting.options?.some((option) => option.set)].filter(Boolean);
			expect(kinds.length).toBe(1);
			if (setting.system) expect(SYSTEM_SETTINGS).toContain(setting.system);
			if (!setting.key) expect(setting.type).toBeDefined();
			if (setting.developer) expect(setting.key?.startsWith('com.lantharos.kestrel.diagnostics ')).toBe(true);
		}
	});
});
