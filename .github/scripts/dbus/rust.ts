import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { INTROSPECTION } from './sources';

const ATTRIBUTE = /#\[(?:zbus::)?(interface|proxy)\(([\s\S]*?)\)\]/g;
const NAME = /\b(?:name|interface)\s*=\s*"([^"]+)"/;
const PACKAGE = /^\[package\][\s\S]*?^name\s*=\s*"([^"]+)"/m;

function packages(files: string[]): Map<string, string> {
	const found = new Map<string, string>();
	for (const manifest of files.filter((file) => file.endsWith('Cargo.toml'))) {
		const name = PACKAGE.exec(readFileSync(manifest, 'utf8'))?.[1];
		if (name) found.set(dirname(manifest), name);
	}
	return found;
}

function owner(file: string, crates: Map<string, string>): string | undefined {
	for (let folder = dirname(file); folder !== '.'; folder = dirname(folder)) {
		const name = crates.get(folder);
		if (name) return name;
	}
	return undefined;
}

function kept(folder: string): string[] {
	if (!existsSync(folder)) return [];
	return readdirSync(folder, { recursive: true, encoding: 'utf8' })
		.filter((file) => file.endsWith('.xml'))
		.map((file) => join(folder, file));
}

export function introspectionProblems(files: string[]): { problems: string[]; written: Map<string, string> } {
	const crates = packages(files);
	const expected = new Map<string, string>();
	const problems: string[] = [];
	for (const file of files.filter((file) => file.endsWith('.rs') && !file.startsWith('packages/dbus/macros/'))) {
		const text = readFileSync(file, 'utf8');
		for (const match of text.matchAll(ATTRIBUTE)) {
			const [, side, argumentsText] = match;
			const name = NAME.exec(argumentsText)?.[1];
			const line = text.slice(0, match.index).split('\n').length;
			const above = text.slice(0, match.index).trimEnd().split('\n').at(-1)?.trim();
			if (above !== '#[introspect]') problems.push(`${file}:${line}: #[${side}] needs #[introspect] right above it`);
			const crate = owner(file, crates);
			if (!name || !crate) continue;
			const path = join(INTROSPECTION, crate, side === 'proxy' ? 'proxies' : '', `${name}.xml`);
			expected.set(path, `${file}:${line}`);
			if (!existsSync(path)) problems.push(`${file}:${line}: ${path} is missing; run LUFT_DBUS_UPDATE=1 cargo test -p ${crate} introspection`);
		}
	}
	for (const path of kept(INTROSPECTION).filter((path) => !expected.has(path))) problems.push(`${path} is left over; no #[introspect] item writes it anymore`);
	return { problems, written: expected };
}
