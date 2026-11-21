import { existsSync } from 'node:fs';
import { join } from 'node:path';

import palette from '../palette.json';
import { parseDrawing } from './drawing.js';
import { glyph } from './glyph.js';

const ICONS = join(import.meta.dir, '..');
const ROOT = join(ICONS, '../..');
const GLYPHS = join(ROOT, 'kestrel/engine/data/icons/scalable/apps');
const BRAND_COLOR = /^brand_color = ".*"$/m;
const checking = process.argv.includes('--check');

const appFolder = (app: string) => ['system', 'store'].map(kind => join(ROOT, 'apps', kind, app)).find(existsSync)!;

async function iconFiles(id: string, icon: string, colour: string): Promise<[string, string][]> {
	const [app, entry] = id.split('.');
	const folder = appFolder(app);
	if (entry) return [[join(folder, 'data', `com.lantharos.${id}.svg`), icon]];
	const files: [string, string][] = [[join(folder, 'public/favicon.svg'), icon]];
	const listing = join(folder, 'store/listing.toml');
	if (existsSync(listing)) {
		files.push([join(folder, 'store/icon.svg'), icon]);
		files.push([listing, (await Bun.file(listing).text()).replace(BRAND_COLOR, `brand_color = "${colour}"`)]);
	}
	return files;
}

async function outputs(id: string, colour: string): Promise<[string, string][]> {
	const shapes = parseDrawing(`${id}.svg`, await Bun.file(join(ICONS, 'glyphs', `${id}.svg`)).text());
	const icon = await Bun.file(join(ICONS, 'originals', `${id}.svg`)).text();
	return [[join(GLYPHS, `com.lantharos.${id}-symbolic.svg`), glyph(shapes)], ...await iconFiles(id, icon, colour)];
}

const files = (await Promise.all(Object.entries(palette).map(([id, colour]) => outputs(id, colour)))).flat();
const stale: string[] = [];
for (const [path, contents] of files) {
	if (await Bun.file(path).exists() && await Bun.file(path).text() === contents) continue;
	if (checking) stale.push(path.slice(ROOT.length + 1));
	else await Bun.write(path, contents);
}
if (stale.length) {
	console.error(`These app icons don't match apps/icons; run \`bun run build\` there:\n${stale.join('\n')}`);
	process.exit(1);
}
