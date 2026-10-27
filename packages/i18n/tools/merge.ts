import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Message, parse, Resource, serialize, Term } from '@fluent/syntax';

export const SOURCE_LOCALE = 'en';

export function localeFiles(dir: string, locale: string) {
	const folder = join(dir, locale);
	if (!existsSync(folder)) return [];
	return readdirSync(folder)
		.filter((name) => name.endsWith('.ftl'))
		.sort()
		.map((name) => join(folder, name));
}

function entries(files: string[]) {
	return files.flatMap((file) =>
		parse(readFileSync(file, 'utf8'), { withSpans: false }).body.filter((entry) => entry instanceof Message || entry instanceof Term)
	);
}

const idOf = (entry: Message | Term) => `${entry instanceof Term ? '-' : ''}${entry.id.name}`;

/**
 * One Fluent source for a locale: its own messages from every folder, and the
 * English ones for whatever it hasn't translated yet.
 */
export function merged(dirs: string[], locale: string) {
	const own = entries(dirs.flatMap((dir) => localeFiles(dir, locale)));
	const known = new Set(own.map(idOf));
	const missing = locale === SOURCE_LOCALE ? [] : entries(dirs.flatMap((dir) => localeFiles(dir, SOURCE_LOCALE))).filter((entry) => !known.has(idOf(entry)));
	const body = [...own, ...missing];
	for (const entry of body) entry.comment = null;
	return serialize(new Resource(body), {});
}

export function locales(dirs: string[]) {
	const found = new Set([SOURCE_LOCALE]);
	for (const dir of dirs) {
		if (!existsSync(dir)) continue;
		for (const name of readdirSync(dir)) if (localeFiles(dir, name).length) found.add(name);
	}
	return [...found].sort();
}
