import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { Junk, Message, parse, Term, type Entry, type Pattern } from '@fluent/syntax';

import { LOCALES } from '../src/locales.js';
import { hardCoded } from './strings.js';
import { cyrillicFileOf, latinFileOf, serbianLatin } from './transliterate.js';

interface Component {
	name: string;
	bundle: string;
	mask: string;
	sources: string[];
}

const ROOT = join(import.meta.dir, '../../..');
const SHARED_BUNDLES: Record<string, string[]> = { settings: ['ui', 'settings-pages'], setup: ['ui'], kestrel: ['settings-pages'] };
const SOURCE_FILE = /\.(ts|js|svelte|rs)$/;
const ID = `([a-z][a-z0-9-]*)(?:\\.[a-z][a-z0-9-]*)?`;
const REFERENCES = [
	new RegExp(`(?:(?<![\\w.$])|KestrelUi\\.)t\\(\\s*['"\`]${ID}['"\`]`, 'g'),
	new RegExp(`bindText\\([^,()]+,\\s*['"\`]${ID}['"\`]`, 'g'),
	new RegExp(`\\bt!\\(\\s*[\\w:]+\\s*,\\s*"${ID}"`, 'g'),
	new RegExp(`\\.(?:t|format)\\(\\s*"${ID}"`, 'g')
];

const components: Component[] = JSON.parse(readFileSync(join(import.meta.dir, '../components.json'), 'utf8'));
const ALLOWED = join(import.meta.dir, '../allowed');
const allowed = new Set(
	(existsSync(ALLOWED) ? readdirSync(ALLOWED) : []).flatMap((name) =>
		readFileSync(join(ALLOWED, name), 'utf8')
			.split('\n')
			.filter(Boolean)
	)
);
const problems: string[] = [];

const fileOf = (component: Component, locale: string) => join(ROOT, component.mask.replace('*', locale));

function walk(path: string): string[] {
	const full = join(ROOT, path);
	if (!existsSync(full)) return [];
	if (!statSync(full).isDirectory()) return SOURCE_FILE.test(full) ? [full] : [];
	return readdirSync(full).flatMap((name) => (name === 'node_modules' || name === 'target' ? [] : walk(join(path, name))));
}

function entries(file: string): Entry[] {
	if (!existsSync(file)) return [];
	const body = parse(readFileSync(file, 'utf8'), { withSpans: true }).body;
	for (const entry of body) if (entry instanceof Junk) problems.push(`${relative(ROOT, file)}: can't be parsed near "${entry.content.trim().split('\n')[0]}"`);
	return body.filter((entry) => entry instanceof Message || entry instanceof Term);
}

const idOf = (entry: Message | Term) => (entry instanceof Term ? `-${entry.id.name}` : entry.id.name);

function variables(pattern: Pattern | null, found = new Set<string>()): Set<string> {
	JSON.stringify(pattern, (key, value) => {
		if (value?.type === 'VariableReference') found.add(value.id.name);
		return key === 'span' ? undefined : value;
	});
	return found;
}

const english = new Map<string, Map<string, Message | Term>>();
for (const component of components) {
	const messages = new Map<string, Message | Term>();
	for (const entry of entries(fileOf(component, 'en')) as (Message | Term)[]) {
		if (messages.has(idOf(entry))) problems.push(`${component.mask}: ${idOf(entry)} is defined twice`);
		messages.set(idOf(entry), entry);
	}
	english.set(component.name, messages);
}

const bundleIds = new Map<string, Set<string>>();
for (const component of components) {
	const ids = bundleIds.get(component.bundle) ?? new Set<string>();
	for (const id of english.get(component.name)!.keys()) {
		if (ids.has(id)) problems.push(`${component.mask}: ${id} is also defined by another file of the ${component.bundle} bundle`);
		ids.add(id);
	}
	bundleIds.set(component.bundle, ids);
}

for (const component of components) {
	const source = english.get(component.name)!;
	for (const locale of LOCALES.filter((locale) => locale !== 'en')) {
		const file = fileOf(component, locale);
		if (!existsSync(file)) {
			problems.push(`${relative(ROOT, file)} is missing`);
			continue;
		}
		for (const entry of entries(file) as (Message | Term)[]) {
			const original = source.get(idOf(entry));
			if (!original) {
				problems.push(`${relative(ROOT, file)}: ${idOf(entry)} isn't in the English file`);
				continue;
			}
			const known = variables(original.value);
			for (const attribute of original.attributes) variables(attribute.value, known);
			for (const name of variables(entry.value)) if (!known.has(name)) problems.push(`${relative(ROOT, file)}: ${idOf(entry)} uses $${name}, which English doesn't have`);
		}
	}

	const files = component.sources.flatMap(walk);
	const text = files.map((file) => readFileSync(file, 'utf8')).join('\n');
	const visible = new Set([...(bundleIds.get(component.bundle) ?? []), ...(SHARED_BUNDLES[component.bundle] ?? []).flatMap((bundle) => [...(bundleIds.get(bundle) ?? [])])]);
	for (const id of source.keys()) {
		if (id.startsWith('-')) continue;
		if (!new RegExp(`['"\`]${id}(?:\\.[a-z-]+)?['"\`]`).test(text)) problems.push(`${component.mask}: ${id} isn't used`);
	}
	for (const file of files) {
		const content = readFileSync(file, 'utf8');
		for (const id of REFERENCES.flatMap((pattern) => [...content.matchAll(pattern)].map((match) => match[1]))) {
			if (!visible.has(id)) problems.push(`${relative(ROOT, file)}: ${id} has no English message`);
		}
		for (const { line, text: literal } of hardCoded(file, content)) {
			const path = relative(ROOT, file);
			if (!allowed.has(`${path}\t${literal}`)) problems.push(`${path}:${line}: "${literal}" should come from a Fluent file`);
		}
	}
}

for (const { mask } of components) {
	if (existsSync(cyrillicFileOf(mask)) && readFileSync(latinFileOf(mask), 'utf8') !== serbianLatin(readFileSync(cyrillicFileOf(mask), 'utf8'))) {
		problems.push(`${mask.replace('*', 'sr-Latn')} isn't the Latin form of the Serbian file; run bun run transliterate in packages/i18n`);
	}
}

if (problems.length) {
	console.error(problems.join('\n'));
	console.error(`\n${problems.length} translation problems`);
	process.exit(1);
}
