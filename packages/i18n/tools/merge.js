import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Comment, GroupComment, Junk, parse, Resource, ResourceComment, serialize } from '@fluent/syntax';

export const SOURCE_LOCALE = 'en';

/** @typedef {string | { dir: string, files: string[] }} Source */

/** @param {Source} source @param {string} locale */
export function localeFiles(source, locale) {
	const { dir, files } = typeof source === 'string' ? { dir: source, files: null } : source;
	const folder = join(dir, locale);
	if (!existsSync(folder)) return [];
	return readdirSync(folder)
		.filter((name) => name.endsWith('.ftl') && (!files || files.includes(name.slice(0, -4))))
		.sort()
		.map((name) => join(folder, name));
}

/** @param {string[]} files */
function entries(files) {
	return files.flatMap((file) =>
		parse(readFileSync(file, 'utf8'), { withSpans: false }).body.filter(
			(entry) => !(entry instanceof Comment || entry instanceof GroupComment || entry instanceof ResourceComment || entry instanceof Junk)
		)
	);
}

/** @param {any} entry */
const idOf = (entry) => `${entry.type === 'Term' ? '-' : ''}${entry.id.name}`;

/**
 * One Fluent source for a locale: its own messages from every folder, and the
 * English ones for whatever it hasn't translated yet.
 * @param {Source[]} dirs
 * @param {string} locale
 */
export function merged(dirs, locale) {
	const own = entries(dirs.flatMap((dir) => localeFiles(dir, locale)));
	const known = new Set(own.map(idOf));
	const missing = locale === SOURCE_LOCALE ? [] : entries(dirs.flatMap((dir) => localeFiles(dir, SOURCE_LOCALE))).filter((entry) => !known.has(idOf(entry)));
	const body = [...own, ...missing];
	for (const entry of body) entry.comment = null;
	return serialize(new Resource(body), {});
}

/** @param {Source[]} dirs */
export function locales(dirs) {
	const found = new Set([SOURCE_LOCALE]);
	for (const source of dirs) {
		const dir = typeof source === 'string' ? source : source.dir;
		if (!existsSync(dir)) continue;
		for (const name of readdirSync(dir)) if (localeFiles(source, name).length) found.add(name);
	}
	return [...found].sort();
}
