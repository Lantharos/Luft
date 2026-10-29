import { readFileSync } from 'node:fs';
import { basename } from 'node:path';

import { Glob } from 'bun';

import { embedded, type Interface } from './introspection';

export type Role = 'exported' | 'proxy' | 'document' | 'copy';

export type Occurrence = { file: string; role: Role; tooling: boolean; exporting: boolean; definition: Interface };

export const INTROSPECTION = 'packages/dbus/introspection';
const KESTREL_INTERFACES = 'kestrel/engine/data/dbus-interfaces/';

const SCANNED = /\.(xml|ts|js|py|c|rs|sh|patch)$/;
const SKIPPED = ['**/node_modules/**', 'kestrel/types/**', 'web/**', 'docs/**', '.github/**', '**/*.gschema.xml', '**/*.metainfo.xml', '**/*.d.ts'].map((pattern) => new Glob(pattern));
const TOOLING = ['**/fixtures/**', '**/tools/**', '**/vm/**', '**/tests/**'].map((pattern) => new Glob(pattern));
const DOCUMENT = new Glob('**/data/**/com.lantharos.*.xml');
const EXPORTS = /wrapJSObject|register_object|serve_at|object_server/;

function role(file: string): Role {
	if (file.startsWith(`${INTROSPECTION}/`)) return file.includes('/proxies/') ? 'proxy' : 'exported';
	if (DOCUMENT.match(file) && !file.startsWith(KESTREL_INTERFACES)) return 'document';
	return 'copy';
}

function loadedNames(files: string[]): Map<string, boolean> {
	const exported = new Map<string, boolean>();
	const loader = /(?:const|let)\s+(\w+)\s*=\s*loadInterfaceXML\(\s*'([\w.]+)'\s*\)/g;
	for (const file of files.filter((file) => file.startsWith('kestrel/ui/src/') && file.endsWith('.ts'))) {
		const text = readFileSync(file, 'utf8');
		for (const [, variable, name] of text.matchAll(loader)) {
			const wrapped = new RegExp(`(?:wrapJSObject|super)\\(\\s*${variable}\\b`).test(text);
			exported.set(name, (exported.get(name) ?? false) || wrapped);
		}
	}
	return exported;
}

export function occurrences(files: string[]): Occurrence[] {
	const loaded = loadedNames(files);
	const found: Occurrence[] = [];
	for (const file of files) {
		if (!SCANNED.test(file) || SKIPPED.some((glob) => glob.match(file))) continue;
		const text = readFileSync(file, 'utf8');
		if (!text.includes('<interface')) continue;
		const tooling = TOOLING.some((glob) => glob.match(file));
		const interfaceFile = file.startsWith(KESTREL_INTERFACES);
		for (const definition of embedded(file, text)) {
			const exporting = interfaceFile ? loaded.get(basename(file, '.xml')) === true : !file.endsWith('.xml') && EXPORTS.test(text);
			found.push({ file, role: role(file), tooling, exporting, definition });
		}
	}
	return found;
}
