import { existsSync, readdirSync, rmSync } from 'node:fs';
import { basename, join } from 'node:path';

import { parseDrawing, type Shape } from './drawing.js';
import { MIRRORED } from './mirrored.js';
import { layers } from './outline.js';

export const NAME = 'Mochi';

const ROOT = join(import.meta.dir, '..');
const DRAWINGS = join(ROOT, 'drawings');
const ALIASES = join(ROOT, 'aliases');
const THEME = join(ROOT, 'theme');
const SHADE_OPACITY = 0.4;
const checking = process.argv.includes('--check');

const CONTEXTS: Record<string, string> = {
	actions: 'Actions',
	categories: 'Categories',
	devices: 'Devices',
	emotes: 'Emotes',
	legacy: 'Legacy',
	mimetypes: 'MimeTypes',
	places: 'Places',
	status: 'Status',
	ui: 'UI',
};

type Drawing = { context: string; shapes: Shape[] };

const svgFiles = (dir: string) => (existsSync(dir) ? readdirSync(dir).filter(file => file.endsWith('.svg')).sort() : []);

export async function drawings() {
	const found = new Map<string, Drawing>();
	for (const context of Object.keys(CONTEXTS)) {
		for (const file of svgFiles(join(DRAWINGS, context))) {
			const name = basename(file, '.svg');
			found.set(name, { context, shapes: parseDrawing(file, await Bun.file(join(DRAWINGS, context, file)).text()) });
		}
	}
	return found;
}

export async function aliases() {
	const files = readdirSync(ALIASES).filter(file => file.endsWith('.json')).sort();
	const entries = await Promise.all(files.map(async file => Object.entries(await Bun.file(join(ALIASES, file)).json() as Record<string, string>)));
	return new Map(entries.flat());
}

export function icon(shapes: Shape[], mirrored: boolean) {
	const { ink, shade } = layers(shapes, mirrored);
	const shaded = shade ? `<path opacity="${SHADE_OPACITY}" fill-rule="evenodd" d="${shade}"/>` : '';
	return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="#2e3436">${shaded}<path fill-rule="evenodd" d="${ink}"/></svg>\n`;
}

function indexTheme() {
	const folders = Object.keys(CONTEXTS).map(folder => `symbolic/${folder}`);
	const sections = Object.entries(CONTEXTS).map(([folder, context]) =>
		`[symbolic/${folder}]\nContext=${context}\nSize=16\nMinSize=8\nMaxSize=512\nType=Scalable\n`);
	return `[Icon Theme]\nName=${NAME}\nComment=Luft's symbolic icons\nInherits=Adwaita,hicolor\nDirectories=${folders.join(',')}\n\n${sections.join('\n')}`;
}

async function outputs() {
	const files = new Map([['index.theme', indexTheme()]]);
	const drawn = await drawings();
	const named = [...drawn.entries(), ...[...await aliases()].map(([alias, target]): [string, Drawing] => {
		const drawing = drawn.get(target);
		if (!drawing) throw new Error(`The alias ${alias} points at ${target}, which isn't drawn`);
		return [alias, drawing];
	})];
	for (const [name, { context, shapes }] of named) {
		files.set(`symbolic/${context}/${name}-symbolic.svg`, icon(shapes, false));
		if (MIRRORED.has(name)) files.set(`symbolic/${context}/${name}-symbolic-rtl.svg`, icon(shapes, true));
	}
	return files;
}

function written(dir = ''): string[] {
	if (!existsSync(join(THEME, dir))) return [];
	return readdirSync(join(THEME, dir), { withFileTypes: true }).flatMap(entry => {
		const path = dir ? `${dir}/${entry.name}` : entry.name;
		return entry.isDirectory() ? written(path) : [path];
	});
}

if (import.meta.main) {
	const files = await outputs();
	const stale: string[] = [];
	for (const [path, contents] of files) {
		const file = Bun.file(join(THEME, path));
		if (await file.exists() && await file.text() === contents) continue;
		if (checking) stale.push(path);
		else await Bun.write(file, contents);
	}
	for (const path of written().filter(path => !files.has(path))) {
		if (checking) stale.push(path);
		else rmSync(join(THEME, path));
	}
	if (stale.length) {
		console.error(`These icons don't match kestrel/symbols; run \`bun run build\` there:\n${stale.join('\n')}`);
		process.exit(1);
	}
}
