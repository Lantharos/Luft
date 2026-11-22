import { existsSync, readdirSync, rmSync } from 'node:fs';
import { basename, join } from 'node:path';

import { parseDrawing, type Shape } from './drawing.js';
import { MIRRORED } from './mirrored.js';
import { layers } from './outline.js';

export const NAME = 'Mochi';

const ROOT = join(import.meta.dir, '..');
const DRAWINGS = join(ROOT, 'drawings');
const ALIASES = join(ROOT, 'aliases');
const COMPONENTS = join(ROOT, 'components');
const OUTPUTS = ['theme', 'icons'];
const APP_ONLY = 'app';
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
	for (const context of [...Object.keys(CONTEXTS), APP_ONLY]) {
		for (const file of svgFiles(join(DRAWINGS, context))) {
			const name = basename(file, '.svg');
			found.set(name, { context, shapes: parseDrawing(file, await Bun.file(join(DRAWINGS, context, file)).text()) });
		}
	}
	return found;
}

async function names(dir: string) {
	const files = readdirSync(dir).filter(file => file.endsWith('.json')).sort();
	const entries = await Promise.all(files.map(async file => Object.entries(await Bun.file(join(dir, file)).json() as Record<string, string>)));
	return new Map(entries.flat());
}

export const aliases = () => names(ALIASES);
export const components = () => names(COMPONENTS);

function component(shapes: Shape[]) {
	const { ink, shade } = layers(shapes, false);
	return `<script lang="ts">\n\timport Symbol from '../src/Symbol.svelte';\n\timport type { SymbolProps } from '../src/props.ts';\n\n\tlet props: SymbolProps = $props();\n</script>\n\n<Symbol {...props} ink="${ink}" shade="${shade}" />\n`;
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

function drawingOf(drawn: Map<string, Drawing>, name: string, target: string) {
	const drawing = drawn.get(target);
	if (!drawing) throw new Error(`${name} points at ${target}, which isn't drawn`);
	return drawing;
}

async function outputs() {
	const files = new Map([['theme/index.theme', indexTheme()]]);
	const drawn = await drawings();
	const themed = [...drawn].filter(([, { context }]) => context !== APP_ONLY);
	const named = [...themed, ...[...await aliases()].map(([alias, target]): [string, Drawing] => [alias, drawingOf(drawn, alias, target)])];
	for (const [name, { context, shapes }] of named) {
		files.set(`theme/symbolic/${context}/${name}-symbolic.svg`, icon(shapes, false));
		if (MIRRORED.has(name)) files.set(`theme/symbolic/${context}/${name}-symbolic-rtl.svg`, icon(shapes, true));
	}
	for (const [name, target] of await components()) files.set(`icons/${name}.svelte`, component(drawingOf(drawn, name, target).shapes));
	return files;
}

function written(dir: string): string[] {
	if (!existsSync(join(ROOT, dir))) return [];
	return readdirSync(join(ROOT, dir), { withFileTypes: true }).flatMap(entry => {
		const path = `${dir}/${entry.name}`;
		return entry.isDirectory() ? written(path) : [path];
	});
}

if (import.meta.main) {
	const files = await outputs();
	const stale: string[] = [];
	for (const [path, contents] of files) {
		const file = Bun.file(join(ROOT, path));
		if (await file.exists() && await file.text() === contents) continue;
		if (checking) stale.push(path);
		else await Bun.write(file, contents);
	}
	for (const path of OUTPUTS.flatMap(dir => written(dir)).filter(path => !files.has(path))) {
		if (checking) stale.push(path);
		else rmSync(join(ROOT, path));
	}
	if (stale.length) {
		console.error(`These icons don't match kestrel/symbols; run \`bun run build\` there:\n${stale.join('\n')}`);
		process.exit(1);
	}
}
